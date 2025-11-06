/**
 * 🌸 Miara 🌸— Session Repair Utility
 * Automatically heals corrupted or stale Signal sessions (Bad MAC / Buffer issues)
 */

import fs from "fs";
import path from "path";
import { BufferJSON } from "@whiskeysockets/baileys";

const SESSION_DIR = "./src/session";
const BACKUP_DIR = "./src/session_backups";

export async function repairSession() {
  console.log("🔧 Running session integrity check...");

  if (!fs.existsSync(SESSION_DIR)) {
    console.log("ℹ️ No session folder found, skipping repair.");
    return;
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const allFiles = fs.readdirSync(SESSION_DIR);
  let repairedCount = 0, deletedCount = 0;

  for (const file of allFiles) {
    const filePath = path.join(SESSION_DIR, file);

    try {
      const content = fs.readFileSync(filePath, "utf8");

      // Backup original file before modifying
      const backupPath = path.join(BACKUP_DIR, `${file}.${Date.now()}.bak`);
      fs.copyFileSync(filePath, backupPath);

      const parsed = JSON.parse(content);

      // Fix Buffer objects like { type: "Buffer", data: [...] }
      const revived = JSON.parse(content, BufferJSON.reviver);

      if (JSON.stringify(parsed) !== JSON.stringify(revived)) {
        fs.writeFileSync(filePath, JSON.stringify(revived, BufferJSON.replacer, 2));
        repairedCount++;
        console.log(`✅ Repaired corrupted session file: ${file}`);
      }

    } catch (err) {
      console.warn(`⚠️ Broken session file detected: ${file} — ${err.message}`);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`🗑️ Deleted corrupted session file: ${file}`);
      } catch (deleteErr) {
        console.error(`❌ Failed to delete broken session ${file}: ${deleteErr.message}`);
      }
    }
  }

  console.log(`✨ Session repair complete!`);
  console.log(`🩹 Fixed: ${repairedCount} | 🧹 Deleted: ${deletedCount}`);
}
