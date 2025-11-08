/**
 * 🌸 Miara 🌸 — Session Repair Utility (2025)
 * by MidKnightMantra
 * ------------------------------------------------------------
 * Automatically heals corrupted or stale Signal sessions
 * caused by JSON parse errors, Bad MAC, or Buffer mismatches.
 */

import fs from "fs";
import path from "path";
import { BufferJSON } from "@whiskeysockets/baileys";

const MAIN_SESSION = "./session";
const MULTI_SESSIONS = "./sessions";
const BACKUP_ROOT = "./session_backups";

export async function repairSession(silent = false) {
  const log = (...msg) => !silent && console.log(...msg);

  log("🔧 Running Miara session integrity check...");

  const allTargets = [];

  // Collect main session
  if (fs.existsSync(MAIN_SESSION)) allTargets.push(MAIN_SESSION);

  // Collect multi-session directories (Miara~User folders)
  if (fs.existsSync(MULTI_SESSIONS)) {
    const subs = fs
      .readdirSync(MULTI_SESSIONS)
      .filter((f) => f.startsWith("Miara~"))
      .map((f) => path.join(MULTI_SESSIONS, f));
    allTargets.push(...subs);
  }

  if (allTargets.length === 0) {
    log("ℹ️ No session folders found — skipping repair.");
    return;
  }

  let repairedCount = 0,
    deletedCount = 0,
    skippedCount = 0;

  fs.mkdirSync(BACKUP_ROOT, { recursive: true });

  for (const sessionDir of allTargets) {
    const files = fs.readdirSync(sessionDir);
    const sessionName = path.basename(sessionDir);
    log(`🔍 Checking session: ${sessionName} (${files.length} files)`);

    const backupDir = path.join(BACKUP_ROOT, `${sessionName}_${Date.now()}`);
    fs.mkdirSync(backupDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(sessionDir, file);

      try {
        const stats = fs.statSync(filePath);
        const modifiedMinutes = (Date.now() - stats.mtimeMs) / 60000;

        // Skip fresh files (less than 2 minutes old)
        if (modifiedMinutes < 2) {
          skippedCount++;
          continue;
        }

        const content = fs.readFileSync(filePath, "utf8");
        const backupPath = path.join(backupDir, file);
        fs.copyFileSync(filePath, backupPath);

        // Try reviving with BufferJSON
        const revived = JSON.parse(content, BufferJSON.reviver);

        // Re-save only if structure changes
        if (content !== JSON.stringify(revived, BufferJSON.replacer, 2)) {
          fs.writeFileSync(filePath, JSON.stringify(revived, BufferJSON.replacer, 2));
          repairedCount++;
          log(`✅ Repaired: ${sessionName}/${file}`);
        }
      } catch (err) {
        log(`⚠️ Corrupted session file: ${sessionName}/${file} — ${err.message}`);
        try {
          fs.unlinkSync(filePath);
          deletedCount++;
          log(`🗑️ Deleted broken file: ${sessionName}/${file}`);
        } catch (deleteErr) {
          console.error(`❌ Failed to delete ${file}: ${deleteErr.message}`);
        }
      }
    }
  }

  log(`\n✨ Session repair complete!`);
  log(
    `🩹 Fixed: ${repairedCount} | 🧹 Deleted: ${deletedCount} | ⏳ Skipped (recent): ${skippedCount}`
  );

  return { repairedCount, deletedCount, skippedCount };
}

/**
 * 🛠 Scheduled or panel-friendly trigger
 * Can be called automatically on startup or from a cron task.
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  repairSession(false)
    .then(() => console.log("✅ Repair process finished."))
    .catch((err) => console.error("❌ Repair failed:", err.message));
}
