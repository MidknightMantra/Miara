/**
 * 🌸 Miara 🌸 — Deluxe Session Repair Utility (2025)
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * Heals corrupted or stale Signal sessions gracefully.
 * Safe, async, and visually integrated with Miara’s color style.
 */

import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import gradient from "gradient-string";
import { BufferJSON } from "@whiskeysockets/baileys";

const MAIN_SESSION = "./session";
const MULTI_SESSIONS = "./sessions";
const BACKUP_ROOT = "./session_backups";
const CORRUPT_QUARANTINE = "./session_corrupt";

export async function repairSession(silent = false) {
  const log = (...msg) => !silent && console.log(...msg);
  const pulse = gradient(["#b197fc", "#c77dff", "#ff8fab"]);

  log(pulse("🔧 Miara Session Integrity Check Initiated..."));

  const allTargets = [];

  if (await exists(MAIN_SESSION)) allTargets.push(MAIN_SESSION);

  if (await exists(MULTI_SESSIONS)) {
    const subs = (await fs.readdir(MULTI_SESSIONS))
      .filter((f) => f.startsWith("Miara~"))
      .map((f) => path.join(MULTI_SESSIONS, f));
    allTargets.push(...subs);
  }

  if (!allTargets.length) {
    log(chalk.gray("ℹ️ No session directories found — nothing to heal."));
    return;
  }

  await fs.mkdir(BACKUP_ROOT, { recursive: true });
  await fs.mkdir(CORRUPT_QUARANTINE, { recursive: true });

  let repairedCount = 0,
    deletedCount = 0,
    skippedCount = 0,
    quarantined = 0;

  for (const sessionDir of allTargets) {
    const files = await fs.readdir(sessionDir);
    const sessionName = path.basename(sessionDir);
    log(chalk.cyanBright(`\n🔍 Checking ${sessionName} (${files.length} files)`));

    const backupDir = path.join(BACKUP_ROOT, `${sessionName}_${Date.now()}`);
    await fs.mkdir(backupDir, { recursive: true });

    for (const file of files) {
      const filePath = path.join(sessionDir, file);

      try {
        const stats = await fs.stat(filePath);
        const modifiedMinutes = (Date.now() - stats.mtimeMs) / 60000;
        if (modifiedMinutes < 2) {
          skippedCount++;
          continue;
        }

        const content = await fs.readFile(filePath, "utf8");
        const backupPath = path.join(backupDir, file);
        await fs.copyFile(filePath, backupPath);

        const revived = JSON.parse(content, BufferJSON.reviver);
        const normalized = JSON.stringify(revived, BufferJSON.replacer, 2);

        if (content !== normalized) {
          await fs.writeFile(filePath, normalized);
          repairedCount++;
          log(chalk.green(`✅ Repaired: ${sessionName}/${file}`));
        }
      } catch (err) {
        log(chalk.yellow(`⚠️ Corrupted: ${sessionName}/${file} — ${err.message}`));
        try {
          const quarantinePath = path.join(
            CORRUPT_QUARANTINE,
            `${sessionName}_${file}_${Date.now()}`
          );
          await fs.copyFile(filePath, quarantinePath);
          await fs.unlink(filePath);
          quarantined++;
          deletedCount++;
          log(chalk.redBright(`🗑️ Moved broken file to quarantine: ${file}`));
        } catch (deleteErr) {
          log(chalk.red(`❌ Could not quarantine ${file}: ${deleteErr.message}`));
        }
      }
    }
  }

  log(pulse("\n✨ Session Repair Complete!"));
  log(
    chalk.whiteBright(
      `🩹 Fixed: ${repairedCount} | 🧹 Deleted: ${deletedCount} | 📦 Quarantined: ${quarantined} | ⏳ Skipped: ${skippedCount}`
    )
  );

  return {
    repairedCount,
    deletedCount,
    skippedCount,
    quarantined,
    sessionsChecked: allTargets.length
  };
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * 🛠 CLI entry
 * Can be run manually or triggered automatically on startup.
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  repairSession(false)
    .then(() => console.log(chalk.green("✅ Miara session repair finished successfully.")))
    .catch((err) => console.error(chalk.red("❌ Session repair failed:"), err.message));
}
