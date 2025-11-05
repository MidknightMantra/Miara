/**
 * 🌸 Miara Bot — Auth State for Baileys 7.x RC
 * ✅ Creates skeleton creds when none exist
 * ✅ Auto-fixes buffer-like session data
 */

import fs from "fs";
import path from "path";
import { initAuthCreds } from "@whiskeysockets/baileys";

/**
 * Convert { type: 'Buffer', data: [...] } to Buffer recursively
 */
function reviveBuffers(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (obj.type === "Buffer" && Array.isArray(obj.data)) return Buffer.from(obj.data);
  for (const key of Object.keys(obj)) obj[key] = reviveBuffers(obj[key]);
  return obj;
}

/**
 * Load or create Baileys multi-file auth state
 */
export const useMultiFileAuthState = async (folderPath = "./session") => {
  fs.mkdirSync(folderPath, { recursive: true });

  const credsFile = path.join(folderPath, "creds.json");

  let creds;
  if (fs.existsSync(credsFile)) {
    // Load existing creds and repair buffers
    const raw = JSON.parse(fs.readFileSync(credsFile, "utf8"));
    creds = reviveBuffers(raw);
  } else {
    // Create a temporary skeleton creds object for QR scan
    creds = initAuthCreds();
  }

  const state = {
    creds,
    keys: {
      get: async (type, ids) => {
        const file = path.join(folderPath, `${type}.json`);
        if (!fs.existsSync(file)) return {};
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        const result = {};
        for (const id of ids) if (data[id]) result[id] = reviveBuffers(data[id]);
        return result;
      },
      set: async (data) => {
        for (const type in data) {
          const file = path.join(folderPath, `${type}.json`);
          const prev = fs.existsSync(file)
            ? JSON.parse(fs.readFileSync(file, "utf8"))
            : {};
          const merged = { ...prev, ...data[type] };
          fs.writeFileSync(file, JSON.stringify(merged, null, 2));
        }
      },
    },
  };

  const saveCreds = async () => {
    await fs.promises.writeFile(credsFile, JSON.stringify(state.creds, null, 2));
  };

  return { state, saveCreds };
};
