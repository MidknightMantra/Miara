/**
 * 🌸 Miara 🌸 — Auth Handler (Deluxe 2025, Stable Edition)
 * ---------------------------------------------------------
 * Handles persistent authentication state for Baileys.
 * - Auto-recovers from corruption
 * - Timestamped JSON backups
 * - Retains only recent backups
 * - Compatible with Render, VPS, and Docker
 *
 * by MidKnightMantra × GPT-5
 */

import fs from "fs/promises";
import path from "path";
import { initAuthCreds, BufferJSON } from "@whiskeysockets/baileys";
import { logger } from "../utils/logger.js";

const BACKUP_PREFIX = "creds-backup-";
const BACKUP_SUFFIX = ".json";
const DEFAULT_RETENTION_DAYS = 7;

// ─────────────────────────────────────────────
// 🔧 Utility Helpers
// ─────────────────────────────────────────────
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function safeReadJSON(filePath, reviver = null) {
  try {
    if (!(await fileExists(filePath))) return {};
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data, reviver);
  } catch (err) {
    logger.warn(`⚠️ Corrupt JSON detected at ${filePath}: ${err.message}`, "Auth");
    return tryRestoreFromBackup(filePath);
  }
}

// ─────────────────────────────────────────────
// 🩹 Backup Restoration
// ─────────────────────────────────────────────
async function tryRestoreFromBackup(mainFilePath) {
  const dir = path.dirname(mainFilePath);
  const files = await fs.readdir(dir);
  const backups = files
    .filter((f) => f.startsWith(BACKUP_PREFIX) && f.endsWith(BACKUP_SUFFIX))
    .map((f) => path.join(dir, f));

  if (!backups.length) {
    logger.error("❌ No valid backup found; starting clean session.", "Auth");
    await fs.rm(mainFilePath, { force: true });
    return {};
  }

  const sorted = await Promise.all(
    backups.map(async (file) => ({
      file,
      mtime: (await fs.stat(file)).mtimeMs
    }))
  );
  sorted.sort((a, b) => b.mtime - a.mtime);

  for (const { file } of sorted) {
    try {
      const content = await fs.readFile(file, "utf8");
      const parsed = JSON.parse(content, BufferJSON.reviver);
      await fs.copyFile(file, mainFilePath);
      logger.info(`✅ Restored from backup: ${path.basename(file)}`, "Auth");
      return parsed;
    } catch (err) {
      logger.warn(`⚠️ Failed to load backup ${file}: ${err.message}`, "Auth");
    }
  }

  logger.error("❌ All backups invalid; initializing fresh credentials.", "Auth");
  await fs.rm(mainFilePath, { force: true });
  return {};
}

// ─────────────────────────────────────────────
// 🧹 Backup Cleanup
// ─────────────────────────────────────────────
async function cleanOldBackups(dir, days = DEFAULT_RETENTION_DAYS) {
  try {
    const cutoff = Date.now() - days * 86_400_000;
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (!file.startsWith(BACKUP_PREFIX)) continue;
      const full = path.join(dir, file);
      const stat = await fs.stat(full);
      if (stat.mtimeMs < cutoff) {
        await fs.unlink(full);
        logger.debug(`🗑️ Removed old backup: ${file}`, "Auth");
      }
    }
  } catch (err) {
    logger.warn(`Cleanup error: ${err.message}`, "Auth");
  }
}

// ─────────────────────────────────────────────
// 🔑 MultiFile Auth State (Main Export)
// ─────────────────────────────────────────────
export async function useMultiFileAuthState(folderPath) {
  if (!folderPath) throw new Error("Auth folder path is required.");
  await ensureDir(folderPath);

  const credsPath = path.join(folderPath, "creds.json");
  const keysDir = path.join(folderPath, "keys");
  await ensureDir(keysDir);

  // Load creds or new init
  const creds = await safeReadJSON(credsPath, BufferJSON.reviver);
  const state = {
    creds: Object.keys(creds).length ? creds : initAuthCreds(),
    keys: {
      async get(type, ids) {
        const result = {};
        for (const id of ids) {
          const file = path.join(keysDir, `${type}-${id}.json`);
          result[id] = await safeReadJSON(file, BufferJSON.reviver);
        }
        return result;
      },
      async set(data) {
        for (const [type, records] of Object.entries(data)) {
          for (const [id, value] of Object.entries(records)) {
            const file = path.join(keysDir, `${type}-${id}.json`);
            await ensureDir(path.dirname(file));
            try {
              await fs.writeFile(file, JSON.stringify(value, BufferJSON.replacer, 2));
            } catch (err) {
              logger.error(`Failed to write key ${type}-${id}: ${err.message}`, "Auth");
            }
          }
        }
      }
    }
  };

  // ───────────────────────────────
  // 💾 Save Creds + Backup Routine
  // ───────────────────────────────
  async function saveCreds() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = path.join(folderPath, `${BACKUP_PREFIX}${timestamp}${BACKUP_SUFFIX}`);

      if (await fileExists(credsPath)) {
        await fs.copyFile(credsPath, backupFile);
        logger.debug(`💾 Backup created: ${path.basename(backupFile)}`, "Auth");
      }

      await fs.writeFile(credsPath, JSON.stringify(state.creds, BufferJSON.replacer, 2));
      logger.info("✅ Credentials saved successfully.", "Auth");
      await cleanOldBackups(folderPath, DEFAULT_RETENTION_DAYS);
    } catch (err) {
      logger.error(`❌ Critical saveCreds error: ${err.message}`, "Auth");
    }
  }

  return { state, saveCreds };
}
