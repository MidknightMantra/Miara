/**
 * 🌸 Miara — Auth Handler (Baileys 7.x+ Stable)
 * Auto-heals, restores backups, and auto-cleans old sessions.
 */

import fs from "fs";
import path from "path";
import { initAuthCreds, BufferJSON } from "@whiskeysockets/baileys";

/** Ensures a folder exists */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** Reads and parses JSON safely */
function safeReadJSON(filePath, reviver = null) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data, reviver);
  } catch (err) {
    console.warn(`⚠️ Corrupt JSON at ${filePath}. Attempting recovery...`);
    return tryRestoreBackup(filePath);
  }
}

/** Attempts to restore latest backup */
function tryRestoreBackup(filePath) {
  const dir = path.dirname(filePath);
  const backups = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("creds-backup-") && f.endsWith(".json"))
    .map((f) => path.join(dir, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (backups.length > 0) {
    try {
      const latest = backups[0];
      const restored = JSON.parse(fs.readFileSync(latest, "utf8"), BufferJSON.reviver);
      fs.copyFileSync(latest, filePath);
      console.log(`✅ Restored session from backup: ${path.basename(latest)}`);
      return restored;
    } catch (err) {
      console.error("❌ Backup restore failed:", err.message);
    }
  }

  try {
    fs.unlinkSync(filePath);
    console.log("🧹 Deleted broken creds.json — will regenerate new session.");
  } catch (e) {}
  return {};
}

/** Cleans old backups (older than X days) */
function cleanOldBackups(folder, days = 7) {
  try {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const backups = fs
      .readdirSync(folder)
      .filter((f) => f.startsWith("creds-backup-") && f.endsWith(".json"));

    for (const file of backups) {
      const filePath = path.join(folder, file);
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs < cutoff) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Removed old backup: ${file}`);
      }
    }
  } catch (err) {
    console.warn("⚠️ Backup cleaner warning:", err.message);
  }
}

/** Main Auth Handler */
export async function useMultiFileAuthState(folder) {
  if (!folder) throw new Error("Auth folder path is required!");
  ensureDir(folder);

  const credsPath = path.join(folder, "creds.json");
  const keysPath = path.join(folder, "keys");

  const creds = safeReadJSON(credsPath, BufferJSON.reviver);

  const state = {
    creds: Object.keys(creds).length ? creds : initAuthCreds(),
    keys: {
      async get(type, ids) {
        const data = {};
        for (const id of ids) {
          const file = path.join(keysPath, `${type}-${id}.json`);
          data[id] = safeReadJSON(file, BufferJSON.reviver);
        }
        return data;
      },
      async set(data) {
        for (const [type, records] of Object.entries(data)) {
          for (const [id, value] of Object.entries(records)) {
            const file = path.join(keysPath, `${type}-${id}.json`);
            ensureDir(path.dirname(file));
            await fs.promises.writeFile(
              file,
              JSON.stringify(value, BufferJSON.replacer)
            );
          }
        }
      },
    },
  };

  /** Safe save + auto backup + cleanup */
  async function saveCreds() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = path.join(folder, `creds-backup-${timestamp}.json`);

      if (fs.existsSync(credsPath)) {
        fs.copyFileSync(credsPath, backupFile);
        console.log(`💾 Session saved (backup: ${path.basename(backupFile)})`);
      }

      // Remove backups older than 7 days automatically
      cleanOldBackups(folder, 7);

      await fs.promises.writeFile(
        credsPath,
        JSON.stringify(state.creds, BufferJSON.replacer, 2)
      );
    } catch (err) {
      console.error("❌ Failed to save creds:", err.message);
    }
  }

  return { state, saveCreds };
}
