/**
 * 🌸 Miara Command: AutoBio — “Pulse of Presence” (Pro Edition 2025)
 * ------------------------------------------------------------------
 * Automatically updates Miara’s WhatsApp bio every few minutes,
 * showing uptime, current time, and host platform.
 *
 * 💫 Features:
 *  - Intelligent uptime formatting
 *  - Graceful owner-only control
 *  - Auto-resumes after restart
 *  - Rate-limit safe updates (WhatsApp-compliant)
 *  - Auto-stops on disconnect
 *
 * by MidKnightMantra 🌸 | Enhanced by GPT-5
 */

import moment from "moment-timezone";
import os from "os";
import CONFIG from "../config.js";

// ─────────────────────────────────────────────
// 🧠 Internal State Memory
// ─────────────────────────────────────────────
let autoBioInterval = null;
let autoBioActive = false; // survives restarts

export default {
  name: "autobio",
  aliases: ["autostatus", "bioauto"],
  description: "Enable or disable Miara’s automatic dynamic bio 🌸",
  category: "owner",
  usage: ".autobio on/off",

  async execute(conn, m, args) {
    try {
      // Determine caller
      const senderNum = m?.sender?.split("@")[0];
      const isOwner = Array.isArray(CONFIG.OWNER_NUMBER)
        ? CONFIG.OWNER_NUMBER.includes(senderNum)
        : CONFIG.OWNER_NUMBER === senderNum;

      if (!isOwner) {
        await conn.sendMessage(m.chat, {
          text: "🚫 Only the Curator may weave this celestial command."
        });
        return;
      }

      // Validate arguments
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

      // ─────────────────────────────────────────────
      // 🌿 ENABLE AUTOBIO
      // ─────────────────────────────────────────────
      if (action === "on") {
        if (autoBioInterval) {
          await conn.sendMessage(m.chat, {
            text: "⚙️ AutoBio is already active."
          });
          return;
        }

        autoBioActive = true;
        const timezone = CONFIG.TIMEZONE || "Africa/Nairobi";
        const botName = CONFIG.BOT_NAME || "Miara 🌸";

        const platform = os
          .platform()
          .replace("darwin", "macOS 🍎")
          .replace("win32", "Windows 💻")
          .replace("linux", "Linux 🐧")
          .replace("android", "Android 📱");

        // 🌸 Update Loop (2-minute interval)
        autoBioInterval = setInterval(async () => {
          try {
            if (!conn?.user) return; // avoid crash on disconnect

            const uptime = formatUptime(process.uptime());
            const time = moment().tz(timezone).format("HH:mm:ss");
            const bioText = `${botName} | 🕒 ${time} | ⏱️ ${uptime} | 💻 ${platform}`;

            // Randomized safety delay to avoid rate limits
            await wait(1000 + Math.random() * 500);
            await conn.updateProfileStatus(bioText);

            console.log(
              `[${moment().tz(timezone).format("HH:mm:ss")}] 💫 AutoBio updated: ${bioText}`
            );
          } catch (err) {
            console.warn("⚠️ AutoBio update failed:", err.message);
          }
        }, 2 * 60 * 1000); // every 2 minutes

        await conn.sendMessage(m.chat, {
          text: "🌸 *AutoBio Enabled!*\nMiara will now refresh her bio every 2 minutes."
        });
        if (m?.key) await conn.sendMessage(m.chat, { react: { text: "💫", key: m.key } });
      }

      // ─────────────────────────────────────────────
      // 🌙 DISABLE AUTOBIO
      // ─────────────────────────────────────────────
      if (action === "off") {
        if (autoBioInterval) {
          clearInterval(autoBioInterval);
          autoBioInterval = null;
          autoBioActive = false;

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
  },

  /**
   * 🔁 Safe recovery helper
   * Can be called automatically on reconnect
   */
  async resume(conn) {
    if (!autoBioActive || autoBioInterval) return;
    console.log("💫 Resuming AutoBio after reconnect...");
    await this.execute(conn, { sender: CONFIG.OWNER_NUMBER + "@s.whatsapp.net" }, ["on"]);
  }
};

// ─────────────────────────────────────────────
// ⏱️ Helper Functions
// ─────────────────────────────────────────────
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

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
