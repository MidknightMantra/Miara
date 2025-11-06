/**
 * 🕊️ Miara Command: Restart — Phoenix Protocol
 * --------------------------------------------
 * Gracefully restarts Miara within managed environments
 * (PM2, Docker, systemd, etc.) — self-resurrection sequence.
 *
 * 🌸 by MidKnightMantra | 2025
 */

import { config } from "../config.js";
import { sleep } from "../utils/helpers.js";
import moment from "moment-timezone";
import os from "os";
import process from "process";
import chalk from "chalk";

export default {
  name: "restart",
  aliases: ["reboot", "rebirth", "phoenix"],
  description: "Invoke Miara’s cosmic rebirth — safely restarts her process 🌌",
  category: "owner",
  usage: ".restart",

  async execute(conn, m) {
    const senderNum = m.sender.split("@")[0];
    const isOwner = Array.isArray(config.OWNER_NUMBER)
      ? config.OWNER_NUMBER.includes(senderNum)
      : config.OWNER_NUMBER === senderNum;

    if (!isOwner) {
      await conn.sendMessage(m.from, {
        text: "🚫 Only the Celestial Curator may trigger Miara’s rebirth 🌠",
      });
      return;
    }

    const BOT_NAME = config.BOT_NAME || "Miara 🌸";
    const time = moment().tz(config.TIMEZONE || "Africa/Nairobi").format("HH:mm:ss");
    const platform = os.platform().replace("linux", "🐧 Linux Realm").replace("darwin", "🍏 macOS Halo").replace("win32", "🪟 Windows Gate");

    const rebootMsg = `
🕊️ *${BOT_NAME} — Phoenix Rebirth Protocol*
──────────────────────────────
🌠 *Time:* ${time}
💻 *Platform:* ${platform}
⚙️ *Cycle:* Memory Purge → Heart Recalibration → Rebirth
💫 *Mode:* Graceful (Auto-Respawn Enabled)
──────────────────────────────
🌙 “Death is not the end. It’s just another heartbeat in the stars.”
    `.trim();

    // Send the message
    await conn.sendMessage(m.from, { text: rebootMsg }, { quoted: m.message });

    if (m?.key) {
      await conn.sendMessage(m.from, { react: { text: "🔥", key: m.key } });
    }

    console.log(chalk.magentaBright("🌌 Miara Phoenix Protocol engaged..."));
    console.log(chalk.cyan("⚙️ Preparing cosmic reset..."));

    // Give WhatsApp time to deliver messages before shutdown
    await sleep(2500);

    // Log shutdown info
    console.log(chalk.yellow(`💫 ${BOT_NAME} shutting down for rebirth.`));
    console.log(chalk.gray("System will auto-restart if managed by PM2/Docker."));

    // Signal PM2 or other process managers
    if (process.send) {
      process.send("restart");
    }

    // Exit gracefully
    process.exitCode = 0;
    process.exit(0);
  },
};
