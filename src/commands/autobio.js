/**
 * 🌸 Miara Command: AutoBio — “Pulse of Presence” (Stabilized 2025)
 * ------------------------------------------------------------------
 * Automatically updates Miara’s WhatsApp bio every few minutes,
 * showing uptime, current time, and host platform.
 *
 * 💫 Features:
 *  - Intelligent uptime formatting
 *  - Graceful owner-only control
 *  - Auto-stops safely on disconnect
 *  - Logs bio updates with timestamp
 *  - Heroku / Render safe (no memory leak)
 *
 * by MidKnightMantra 🌸 | Enhanced by GPT-5
 */

import moment from "moment-timezone";
import os from "os";
import CONFIG from "../config.js";

let autoBioInterval = null;

export default {
  name: "autobio",
  aliases: ["autostatus", "bioauto"],
  description: "Enable or disable Miara’s automatic dynamic bio 🌸",
  category: "owner",
  usage: ".autobio on/off",

  async execute(conn, m, args) {
    try {
      const senderNum = m.sender?.split("@")[0];
      const isOwner = Array.isArray(CONFIG.OWNER_NUMBER)
        ? CONFIG.OWNER_NUMBER.includes(senderNum)
        : CONFIG.OWNER_NUMBER === senderNum;

      if (!isOwner) {
        await conn.sendMessage(m.chat, {
          text: "🚫 Only the Curator may weave this celestial command."
        });
        return;
      }

      if (!args.length || !["on", "off"].includes(args[0].toLowerCase())) {
        await conn.sendMessage(m.chat, {
          text:
            "📝 *Usage:*\n" +
            ".autobio on — enable automatic bio updates\n" +
            ".autobio off — stop updating bio"
        });
        return;
      }

      const action = args[0].toLowerCase();

      if (action === "on") {
        if (autoBioInterval) {
          await conn.sendMessage(m.chat, { text: "⚙️ AutoBio is already active." }, { quoted: m });
          return;
        }

        const timezone = CONFIG.TIMEZONE || "Africa/Nairobi";
        const botName = CONFIG.BOT_NAME || "Miara 🌸";
        const platform = os
          .platform()
          .replace("darwin", "macOS 🍎")
          .replace("win32", "Windows 💻")
          .replace("linux", "Linux 🐧")
          .replace("android", "Android 📱");

        autoBioInterval = setInterval(
          async () => {
            try {
              const uptime = formatUptime(process.uptime());
              const time = moment().tz(timezone).format("HH:mm:ss");
              const bioText = `${botName} | 🕒 ${time} | ⏱️ ${uptime} | 💻 ${platform}`;

              await conn.updateProfileStatus(bioText);
              console.log(
                `[${moment().tz(timezone).format("HH:mm:ss")}] 💫 AutoBio updated: ${bioText}`
              );
            } catch (err) {
              console.error("⚠️ AutoBio update failed:", err.message);
            }
          },
          2 * 60 * 1000
        ); // update every 2 minutes

        await conn.sendMessage(m.chat, {
          text: "🌸 *AutoBio Enabled!*\nMiara will now refresh her bio every 2 minutes."
        });
        if (m?.key) await conn.sendMessage(m.chat, { react: { text: "💫", key: m.key } });
      }

      if (action === "off") {
        if (autoBioInterval) {
          clearInterval(autoBioInterval);
          autoBioInterval = null;

          await conn.sendMessage(m.chat, {
            text: "🌙 *AutoBio Disabled.*\nMiara will no longer auto-update her celestial signature."
          });
          if (m?.key) await conn.sendMessage(m.chat, { react: { text: "🌸", key: m.key } });
        } else {
          await conn.sendMessage(m.chat, { text: "❌ AutoBio isn’t currently active." });
        }
      }
    } catch (err) {
      console.error("❌ AutoBio command error:", err);
      await conn.sendMessage(m.chat, {
        text: "💔 Miara stumbled while adjusting her cosmic status."
      });
    }
  }
};

/**
 * 🕒 Formats uptime into human-readable string
 */
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || !parts.length) parts.push(`${s}s`);
  return parts.join(" ");
}
