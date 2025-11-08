/**
 * 🌸 Miara 🌸 — Auth Handler (2025)
 * ------------------------------------------------------
 * Robust authentication state handler for Baileys.
 * - Auto-recovers from corrupted sessions
 * - Creates timestamped backups of creds.json
 * - Restores from newest backup automatically
 * - Cleans up old backups after retention period
 * - Compatible with all deployment environments
 *
 * by MidKnightMantra × GPT-5
 */

import fs from "fs/promises";
import path from "path";
import { initAuthCreds, BufferJSON } from "@whiskeysockets/baileys";
import { logger } from "../utils/logger.js";

const BACKUP_FILE_PREFIX = "creds-backup-";
const BACKUP_FILE_SUFFIX = ".json";
const DEFAULT_BACKUP_RETENTION_DAYS = 7;

// ─────────────────────────────────────────────
// 🔍 File Helpers
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
    logger.warn(`Corrupt JSON at ${filePath}: ${err.message} — attempting recovery.`, "Auth");
    return await tryRestoreFromBackups(filePath);
  }
}

// ─────────────────────────────────────────────
// 🩹 Backup Recovery Logic
// ─────────────────────────────────────────────
async function tryRestoreFromBackups(mainFilePath) {
  const dir = path.dirname(mainFilePath);
  const allFiles = await fs.readdir(dir);
  const backups = allFiles
    .filter((f) => f.startsWith(BACKUP_FILE_PREFIX) && f.endsWith(BACKUP_FILE_SUFFIX))
    .map((f) => path.join(dir, f));

  if (backups.length === 0) {
    logger.error(`No backups found. Deleting corrupted session: ${mainFilePath}`, "Auth");
    try {
      if (await fileExists(mainFilePath)) await fs.unlink(mainFilePath);
    } catch {}
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
      const restored = JSON.parse(content, BufferJSON.reviver);
      await fs.copyFile(file, mainFilePath);
      logger.info(`✅ Restored session from backup: ${path.basename(file)}`, "Auth");
      return restored;
    } catch (err) {
      logger.warn(`Failed to restore ${file}: ${err.message}`, "Auth");
    }
  }

  logger.error("All session backups failed to restore. Starting clean.", "Auth");
  try {
    if (await fileExists(mainFilePath)) await fs.unlink(mainFilePath);
  } catch {}
  return {};
}

// ─────────────────────────────────────────────
// 🧹 Backup Cleanup
// ─────────────────────────────────────────────
async function cleanOldBackups(folderPath, days = DEFAULT_BACKUP_RETENTION_DAYS) {
  try {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const files = await fs.readdir(folderPath);
    const oldBackups = files.filter(
      (f) => f.startsWith(BACKUP_FILE_PREFIX) && f.endsWith(BACKUP_FILE_SUFFIX)
    );

    for (const file of oldBackups) {
      const filePath = path.join(folderPath, file);
      const stat = await fs.stat(filePath);
      if (stat.mtimeMs < cutoff) {
        await fs.unlink(filePath);
        logger.debug(`🗑️ Deleted old backup: ${file}`, "Auth");
      }
    }
  } catch (err) {
    logger.warn(`Backup cleanup error: ${err.message}`, "Auth");
  }
}

// ─────────────────────────────────────────────
// 🔑 Main Auth Handler
// ─────────────────────────────────────────────
export async function useMultiFileAuthState(folderPath) {
  if (!folderPath) throw new Error("Auth folder path is required!");

  await ensureDir(folderPath);
  const credsPath = path.join(folderPath, "creds.json");
  const keysDir = path.join(folderPath, "keys");
  await ensureDir(keysDir);

  // Load creds or initialize new
  const creds = await safeReadJSON(credsPath, BufferJSON.reviver);
  const state = {
    creds: Object.keys(creds).length ? creds : initAuthCreds(),
    keys: {
      async get(type, ids) {
        const result = {};
        for (const id of ids) {
          const filePath = path.join(keysDir, `${type}-${id}.json`);
          result[id] = await safeReadJSON(filePath, BufferJSON.reviver);
        }
        return result;
      },
      async set(data) {
        for (const [type, records] of Object.entries(data)) {
          for (const [id, value] of Object.entries(records)) {
            const filePath = path.join(keysDir, `${type}-${id}.json`);
            await ensureDir(path.dirname(filePath));
            try {
              await fs.writeFile(filePath, JSON.stringify(value, BufferJSON.replacer, 2));
            } catch (err) {
              logger.error(`Failed to save key ${type}-${id}: ${err.message}`, "Auth");
            }
          }
        }
      }
    }
  };

  // ───────────────────────────────
  // 💾 Save Credentials Function
  // ───────────────────────────────
  async function saveCreds() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupPath = path.join(
        folderPath,
        `${BACKUP_FILE_PREFIX}${timestamp}${BACKUP_FILE_SUFFIX}`
      );

      if (await fileExists(credsPath)) {
        await fs.copyFile(credsPath, backupPath);
        logger.info(`💾 Backup created: ${path.basename(backupPath)}`, "Auth");
      }

      await fs.writeFile(credsPath, JSON.stringify(state.creds, BufferJSON.replacer, 2));
      logger.info("✅ Credentials saved successfully.", "Auth");

      await cleanOldBackups(folderPath, DEFAULT_BACKUP_RETENTION_DAYS);
    } catch (err) {
      logger.error(`Critical saveCreds error: ${err.message}`, "Auth");
    }
  }

  return { state, saveCreds };
}
