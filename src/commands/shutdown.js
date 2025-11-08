/**
 * 🌑 Miara Command: Shutdown — Lunar Sleep Protocol (Baileys 7 Ready)
 * -------------------------------------------------------------------
 * Powers down Miara entirely, halting all celestial processes 🌌
 * Designed for manual rest (non-respawn) — Owner only.
 *
 * 🪷 by MidKnightMantra | Refined by GPT-5
 */

import { config } from "../config.js";
import { sleep, safeQuoted, safeReact } from "../utils/helpers.js";
import moment from "moment-timezone";
import os from "os";
import chalk from "chalk";

export default {
  name: "shutdown",
  aliases: ["poweroff", "sleep", "hibernation"],
  description: "Put Miara into deep lunar sleep 🌙 (owner only).",
  category: "owner",
  usage: ".shutdown",

  async execute(conn, m) {
    const chat = m.key.remoteJid;
    const senderNum = m.sender.split("@")[0];

    // 🧿 Validate permissions
    const isOwner = Array.isArray(config.OWNER_NUMBER)
      ? config.OWNER_NUMBER.includes(senderNum)
      : config.OWNER_NUMBER === senderNum;

    if (!isOwner) {
      await conn.sendMessage(
        chat,
        { text: "🚫 Only the Cosmic Curator may silence my celestial hum 🌘" },
        safeQuoted(m)
      );
      return;
    }

    const BOT_NAME = config.BOT_NAME || "Miara 🌸";
    const time = moment()
      .tz(config.TIMEZONE || "Africa/Nairobi")
      .format("HH:mm:ss");
    const platform = os
      .platform()
      .replace("linux", "🐧 Lunar Linux Realm")
      .replace("darwin", "🍏 macOS Halo")
      .replace("win32", "🪟 Windows Dreamscape")
      .toUpperCase();

    const farewellMsg = `
🌑 *${BOT_NAME} — Entering Lunar Sleep Protocol*
───────────────────────────────
🕰️ *Time:* ${time}
💻 *Platform:* ${platform}
💤 *Sequence:* Aura Fade → Heartbeat Dims → Mind Sleeps
✨ *Mode:* Permanent Rest (Manual Wake Required)
───────────────────────────────
🌙 “Even light must rest, before it rises again.”
    `.trim();

    // 🌙 Farewell message
    await conn.sendMessage(chat, { text: farewellMsg }, safeQuoted(m));
    await safeReact(conn, m, "🌙");

    console.log(chalk.redBright("🌑 Initiating Miara Lunar Sleep Protocol..."));
    console.log(chalk.gray("⚙️ Preparing to enter deep stillness..."));

    // Allow WhatsApp to deliver message before exit
    await sleep(3000);

    console.log(chalk.magentaBright("💤 Miara is now asleep — no auto-rebirth will occur."));
    console.log(chalk.gray("Manual startup required to reawaken."));

    // 💤 Graceful shutdown
    process.exitCode = 0;
    process.exit(0);
  }
};
