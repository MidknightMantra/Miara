/**
 * 🌸 Miara🌸 — Auth Handler
 */

import fs from "fs/promises";
import path from "path";
import { initAuthCreds, BufferJSON } from "@whiskeysockets/baileys";

// Configuration constants
const BACKUP_FILE_PREFIX = "creds-backup-";
const BACKUP_FILE_SUFFIX = ".json";
const DEFAULT_BACKUP_RETENTION_DAYS = 7;

/**
 * Checks if a file exists.
 * @param {string} filePath - The path to the file.
 * @returns {Promise<boolean>} True if the file exists, false otherwise.
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures a directory exists, creating it recursively if necessary.
 * @param {string} dirPath - The path to the directory.
 */
async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Reads and safely parses a JSON file.
 * Attempts to restore from backups if the main file is corrupt.
 * @param {string} filePath - The path to the JSON file.
 * @param {Function} reviver - Optional reviver function for JSON.parse.
 * @returns {Promise<object>} The parsed object data or an empty object if failed.
 */
async function safeReadJSON(filePath, reviver = null) {
  try {
    if (!(await fileExists(filePath))) {
      // console.log(`File not found, initializing: ${filePath}`); // Optional log
      return {};
    }
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data, reviver);
  } catch (err) {
    console.warn(`⚠️ Corrupt JSON file detected at ${filePath}. Attempting recovery...`, err.message);
    return await tryRestoreFromBackups(filePath);
  }
}

/**
 * Attempts to restore data from backup files, starting from the latest.
 * If successful, copies the backup over the main file.
 * If no backups exist or all fail, deletes the main file.
 * @param {string} mainFilePath - The path to the main file that failed to parse.
 * @returns {Promise<object>} The restored data or an empty object.
 */
async function tryRestoreFromBackups(mainFilePath) {
  const dir = path.dirname(mainFilePath);
  const prefix = BACKUP_FILE_PREFIX;
  const suffix = BACKUP_FILE_SUFFIX;

  // Find all backup files in the directory
  const allFiles = await fs.readdir(dir);
  const backupFiles = allFiles
    .filter(f => f.startsWith(prefix) && f.endsWith(suffix))
    .map(f => path.join(dir, f));

  if (backupFiles.length === 0) {
    console.error(`❌ No backup files found in ${dir}. Deleting corrupted main file: ${mainFilePath}`);
    try {
      if (await fileExists(mainFilePath)) {
        await fs.unlink(mainFilePath);
      }
    } catch (unlinkErr) {
      console.error(`❌ Failed to delete corrupted file ${mainFilePath}:`, unlinkErr.message);
    }
    return {};
  }

  // Get stats and sort backups by modification time (newest first)
  const backupsWithStats = await Promise.all(
    backupFiles.map(async (file) => ({
      file,
      mtimeMs: (await fs.stat(file)).mtimeMs,
    }))
  );

  backupsWithStats.sort((a, b) => b.mtimeMs - a.mtimeMs);

  for (const { file } of backupsWithStats) {
    console.log(`🔍 Trying backup: ${path.basename(file)}`);
    try {
      const data = await fs.readFile(file, "utf8");
      const restoredData = JSON.parse(data, BufferJSON.reviver);
      // Restore by copying the backup to the main file
      await fs.copyFile(file, mainFilePath);
      console.log(`✅ Successfully restored session from backup: ${path.basename(file)}`);
      return restoredData;
    } catch (restoreErr) {
      console.error(`❌ Failed to restore from backup ${path.basename(file)}:`, restoreErr.message);
    }
  }

  // If all backups fail
  console.error(`❌ All backups failed to restore. Deleting corrupted main file: ${mainFilePath}`);
  try {
    if (await fileExists(mainFilePath)) {
      await fs.unlink(mainFilePath);
    }
  } catch (unlinkErr) {
    console.error(`❌ Failed to delete corrupted file ${mainFilePath}:`, unlinkErr.message);
  }
  return {};
}

/**
 * Cleans backup files older than a specified number of days.
 * @param {string} folderPath - The directory containing backup files.
 * @param {number} days - The number of days to retain backups (default 7).
 */
async function cleanOldBackups(folderPath, days = DEFAULT_BACKUP_RETENTION_DAYS) {
  try {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000; // Calculate cutoff timestamp
    const prefix = BACKUP_FILE_PREFIX;
    const suffix = BACKUP_FILE_SUFFIX;

    const allFiles = await fs.readdir(folderPath);
    const backupFiles = allFiles
      .filter(f => f.startsWith(prefix) && f.endsWith(suffix));

    for (const fileName of backupFiles) {
      const filePath = path.join(folderPath, fileName);
      const stats = await fs.stat(filePath);

      if (stats.mtimeMs < cutoffTime) {
        await fs.unlink(filePath);
        console.log(`🗑️ Removed old backup: ${fileName}`);
      }
    }
  } catch (err) {
    console.warn("⚠️ Error during backup cleanup:", err.message);
  }
}

/**
 * Main authentication state handler for Baileys.
 * Manages credentials (creds.json) and keys (keys/ folder) with backup and restore capabilities.
 * @param {string} folderPath - The directory path to store auth state files.
 * @returns {Promise<{state: object, saveCreds: function}>} An object containing the state and save function.
 */
export async function useMultiFileAuthState(folderPath) {
  if (!folderPath) {
    throw new Error("Auth folder path is required!");
  }

  await ensureDir(folderPath);

  const credsPath = path.join(folderPath, "creds.json");
  const keysFolderPath = path.join(folderPath, "keys");
  await ensureDir(keysFolderPath); // Ensure keys subdirectory exists

  // Load main credentials, attempting restore if necessary
  const creds = await safeReadJSON(credsPath, BufferJSON.reviver);

  const state = {
    // Initialize creds if the loaded object was empty
    creds: Object.keys(creds).length > 0 ? creds : initAuthCreds(),
    keys: {
      /**
       * Retrieves key data for given IDs.
       * @param {string} type - The type of key (e.g., 'pre-key', 'session').
       * @param {string[]} ids - The IDs of the keys to retrieve.
       * @returns {Promise<object>} An object mapping IDs to their key data.
       */
      async get(type, ids) {
        const data = {};
        for (const id of ids) {
          const keyFilePath = path.join(keysFolderPath, `${type}-${id}.json`);
          data[id] = await safeReadJSON(keyFilePath, BufferJSON.reviver);
        }
        return data;
      },

      /**
       * Saves key data.
       * @param {object} data - The key data to save, structured as { type: { id: value, ... }, ... }.
       */
      async set(data) {
        for (const [type, records] of Object.entries(data)) {
          for (const [id, value] of Object.entries(records)) {
            const keyFilePath = path.join(keysFolderPath, `${type}-${id}.json`);
            await ensureDir(path.dirname(keyFilePath)); // Ensure subdirectory exists if needed
            try {
              await fs.writeFile(
                keyFilePath,
                JSON.stringify(value, BufferJSON.replacer, 2) // Pretty-print for readability
              );
              // console.log(`Saved key: ${type}-${id}`); // Optional log for debugging
            } catch (writeErr) {
              console.error(`❌ Failed to write key file ${keyFilePath}:`, writeErr.message);
              // Depending on requirements, you might want to throw the error or just log it
              // throw writeErr;
            }
          }
        }
      },
    },
  };

  /**
   * Saves the current credentials state, creates a backup, and cleans old backups.
   */
  async function saveCreds() {
    try {
      // 1. Create a backup of the current creds.json before overwriting it
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFilePath = path.join(folderPath, `${BACKUP_FILE_PREFIX}${timestamp}${BACKUP_FILE_SUFFIX}`);

      if (await fileExists(credsPath)) {
        await fs.copyFile(credsPath, backupFilePath);
        console.log(`💾 Session backup created: ${path.basename(backupFilePath)}`);
      } else {
        console.log(`ℹ️ No existing creds.json to backup, creating new one: ${credsPath}`);
      }

      // 2. Write the updated creds.json
      await fs.writeFile(
        credsPath,
        JSON.stringify(state.creds, BufferJSON.replacer, 2) // Pretty-print
      );
      console.log(`✅ Session credentials saved to: ${credsPath}`);

      // 3. Clean up old backups after saving the new one
      await cleanOldBackups(folderPath, DEFAULT_BACKUP_RETENTION_DAYS);

    } catch (saveErr) {
      console.error("❌ Critical error during saveCreds:", saveErr.message);
      // Depending on requirements, you might want to exit or handle this more critically
      // process.exit(1); // Example: Exit on critical save failure
    }
  }

  return { state, saveCreds };
}