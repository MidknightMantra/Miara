/**
 * 🌸 Miara 🌸 — Deluxe Auth Handler (2025, Stable + Atomic Safe)
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * Fault-tolerant Baileys authentication manager with:
 * - Auto corruption recovery
 * - Timestamped rotating backups
 * - Atomic save operations
 * - Optional AES encryption
 * - Render/VPS-safe filesystem handling
 */

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { initAuthCreds, BufferJSON } from "@whiskeysockets/baileys";
import { logger } from "../utils/logger.js";

const BACKUP_PREFIX = "creds-backup-";
const BACKUP_SUFFIX = ".json";
const DEFAULT_RETENTION_DAYS = 7;
const AUTH_KEY = process.env.AUTH_ENCRYPT_KEY || null;

// ─────────────────────────────────────────────
// 🌿 Helpers
// ─────────────────────────────────────────────
async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

function encrypt(text) {
  if (!AUTH_KEY) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    crypto.createHash("sha256").update(AUTH_KEY).digest(),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return JSON.stringify({ iv: iv.toString("hex"), data: encrypted.toString("hex") });
}

function decrypt(text) {
  if (!AUTH_KEY) return text;
  try {
    const { iv, data } = JSON.parse(text);
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      crypto.createHash("sha256").update(AUTH_KEY).digest(),
      Buffer.from(iv, "hex")
    );
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(data, "hex")),
      decipher.final()
    ]);
    return decrypted.toString("utf8");
  } catch {
    logger.warn("⚠️ Auth decryption failed, falling back to plain JSON.", "Auth");
    return text;
  }
}

// ─────────────────────────────────────────────
// 🩹 Backup Recovery
// ─────────────────────────────────────────────
async function tryRestoreFromBackup(mainFilePath) {
  const dir = path.dirname(mainFilePath);
  const files = await fs.readdir(dir);
  const backups = files
    .filter((f) => f.startsWith(BACKUP_PREFIX) && f.endsWith(BACKUP_SUFFIX))
    .map((f) => path.join(dir, f));

  if (!backups.length) {
    logger.warn("⚠️ No valid backup found; starting fresh session.", "Auth");
    await fs.rm(mainFilePath, { force: true });
    return { creds: {}, recovered: false };
  }

  const sorted = await Promise.all(
    backups.map(async (f) => ({ f, mtime: (await fs.stat(f)).mtimeMs }))
  );
  sorted.sort((a, b) => b.mtime - a.mtime);

  for (const { f } of sorted) {
    try {
      const content = decrypt(await fs.readFile(f, "utf8"));
      const parsed = JSON.parse(content, BufferJSON.reviver);
      await fs.copyFile(f, mainFilePath);
      logger.info(`✅ Restored credentials from backup: ${path.basename(f)}`, "Auth");
      return { creds: parsed, recovered: true };
    } catch (err) {
      logger.warn(`⚠️ Failed to load backup ${f}: ${err.message}`, "Auth");
    }
  }

  logger.error("❌ All backups invalid; resetting session.", "Auth");
  await fs.rm(mainFilePath, { force: true });
  return { creds: {}, recovered: false };
}

// ─────────────────────────────────────────────
// 🧹 Backup Cleanup
// ─────────────────────────────────────────────
async function cleanOldBackups(dir, days = DEFAULT_RETENTION_DAYS) {
  const cutoff = Date.now() - days * 86_400_000;
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (!file.startsWith(BACKUP_PREFIX)) continue;
      const full = path.join(dir, file);
      const { mtimeMs } = await fs.stat(full);
      if (mtimeMs < cutoff) {
        await fs.unlink(full);
        logger.debug(`🗑️ Removed old backup: ${file}`, "Auth");
      }
    }
  } catch (err) {
    logger.warn(`Cleanup error: ${err.message}`, "Auth");
  }
}

// ─────────────────────────────────────────────
// 🔑 MultiFile Auth State
// ─────────────────────────────────────────────
export async function useMultiFileAuthState(folderPath) {
  if (!folderPath) throw new Error("Auth folder path is required.");
  await ensureDir(folderPath);

  const credsPath = path.join(folderPath, "creds.json");
  const keysDir = path.join(folderPath, "keys");
  await ensureDir(keysDir);

  // Load creds with recovery fallback
  let credsData = {};
  let recovered = false;

  try {
    if (await fileExists(credsPath)) {
      const raw = decrypt(await fs.readFile(credsPath, "utf8"));
      credsData = JSON.parse(raw, BufferJSON.reviver);
    } else {
      credsData = {};
    }
  } catch (err) {
    logger.warn(`⚠️ Corrupt creds detected: ${err.message}`, "Auth");
    const recovery = await tryRestoreFromBackup(credsPath);
    credsData = recovery.creds;
    recovered = recovery.recovered;
  }

  const state = {
    creds: Object.keys(credsData).length ? credsData : initAuthCreds(),
    keys: {
      async get(type, ids) {
        const result = {};
        for (const id of ids) {
          const file = path.join(keysDir, `${type}-${id}.json`);
          try {
            if (await fileExists(file)) {
              const content = decrypt(await fs.readFile(file, "utf8"));
              result[id] = JSON.parse(content, BufferJSON.reviver);
            }
          } catch (err) {
            logger.warn(`Key read failed ${file}: ${err.message}`, "Auth");
          }
        }
        return result;
      },
      async set(data) {
        for (const [type, records] of Object.entries(data)) {
          for (const [id, value] of Object.entries(records)) {
            const file = path.join(keysDir, `${type}-${id}.json`);
            await ensureDir(path.dirname(file));
            const tempFile = `${file}.tmp`;
            try {
              const content = encrypt(JSON.stringify(value, BufferJSON.replacer, 2));
              await fs.writeFile(tempFile, content);
              await fs.rename(tempFile, file);
            } catch (err) {
              logger.error(`Key write failed for ${file}: ${err.message}`, "Auth");
            }
          }
        }
      }
    }
  };

  // ───────────────────────────────
  // 💾 Atomic saveCreds()
  // ───────────────────────────────
  let lastSave = 0;
  async function saveCreds() {
    const now = Date.now();
    if (now - lastSave < 5000) return; // throttle
    lastSave = now;

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(folderPath, `${BACKUP_PREFIX}${timestamp}${BACKUP_SUFFIX}`);

    try {
      if (await fileExists(credsPath)) {
        await fs.copyFile(credsPath, backupFile);
        logger.debug(`💾 Backup created: ${path.basename(backupFile)}`, "Auth");
      }

      const tempFile = `${credsPath}.tmp`;
      const content = encrypt(JSON.stringify(state.creds, BufferJSON.replacer, 2));
      await fs.writeFile(tempFile, content);
      await fs.rename(tempFile, credsPath);

      logger.info("✅ Credentials saved safely.", "Auth");
      await cleanOldBackups(folderPath);
    } catch (err) {
      logger.error(`❌ saveCreds() failed: ${err.message}`, "Auth");
    }
  }

  if (recovered) logger.info("🩹 Recovered session from backup successfully.", "Auth");

  return { state, saveCreds };
}
