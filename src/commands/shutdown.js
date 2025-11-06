/**
 * 🌑 Miara Command: Shutdown — Lunar Sleep Protocol
 * -------------------------------------------------
 * Powers down Miara entirely, halting all celestial processes 🌌
 * Designed for manual rest (non-respawn) — Owner only.
 *
 * 🪷 by MidKnightMantra | 2025
 */

import { config } from "../config.js";
import { sleep } from "../utils/helpers.js";
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
    const senderNum = m.sender.split("@")[0];
    const isOwner = Array.isArray(config.OWNER_NUMBER)
      ? config.OWNER_NUMBER.includes(senderNum)
      : config.OWNER_NUMBER === senderNum;

    if (!isOwner) {
      await conn.sendMessage(m.from, {
        text: "🚫 Only the Cosmic Curator may silence my celestial hum 🌘",
      });
      return;
    }

    const BOT_NAME = config.BOT_NAME || "Miara 🌸";
    const time = moment().tz(config.TIMEZONE || "Africa/Nairobi").format("HH:mm:ss");
    const platform = os
      .platform()
      .replace("linux", "🐧 Lunar Linux")
      .replace("darwin", "🍏 macOS Halo")
      .replace("win32", "🪟 Windows Dreamscape");

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

    // Send farewell message
    await conn.sendMessage(m.from, { text: farewellMsg }, { quoted: m.message });

    if (m?.key) {
      await conn.sendMessage(m.from, { react: { text: "🌙", key: m.key } });
    }

    console.log(chalk.redBright("🌑 Initiating Miara Lunar Sleep Protocol..."));
    console.log(chalk.gray("⚙️ Preparing to enter deep stillness..."));

    await sleep(3000);

    console.log(chalk.magentaBright("💤 Miara is now asleep — no auto-rebirth will occur."));
    console.log(chalk.gray("Manual startup required to reawaken."));

    // Explicitly set exit code
    process.exitCode = 0;

    // End without signaling a restart
    process.exit(0);
  },
};
