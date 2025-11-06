/**
 * 🌸 Miara Command: AutoBio (Stabilized Edition)
 * ----------------------------------------------
 * Automatically updates Miara’s WhatsApp bio every few minutes,
 * showing uptime, current time, and host platform.
 *
 * Safely handles missing message keys & reacts gracefully 💫
 */

import moment from "moment-timezone";
import os from "os";
import { config } from "../config.js";

let autoBioInterval = null;

export default {
  name: "autobio",
  aliases: ["autostatus", "bioauto"],
  description: "Enable or disable Miara’s automatic dynamic bio 🌸",
  category: "owner",
  usage: ".autobio on/off",

  async execute(conn, m, args) {
    const senderNum = m.sender?.split("@")[0];
    const isOwner = Array.isArray(config.OWNER_NUMBER)
      ? config.OWNER_NUMBER.includes(senderNum)
      : config.OWNER_NUMBER === senderNum;

    if (!isOwner) {
      await conn.sendMessage(m.from, { text: "🚫 Only the curator may weave that command." });
      return;
    }

    if (!args.length || !["on", "off"].includes(args[0].toLowerCase())) {
      await conn.sendMessage(m.from, {
        text: "📝 Usage:\n.autobio on — enable automatic bio updates\n.autobio off — stop updating bio",
      });
      return;
    }

    const action = args[0].toLowerCase();

    if (action === "on") {
      if (autoBioInterval) {
        await conn.sendMessage(m.from, { text: "⚙️ AutoBio is already active." });
        return;
      }

      // 🌸 Enable autobio updater
      autoBioInterval = setInterval(async () => {
        try {
          const uptime = formatUptime(process.uptime());
          const time = moment().tz(config.TIMEZONE || "Africa/Nairobi").format("HH:mm:ss");
          const botName = config.BOT_NAME || "Miara 🌸";
          const platform = os.platform()
            .replace("darwin", "macOS")
            .replace("win32", "Windows")
            .replace("linux", "Linux 🐧");

          const bioText = `${botName} | 🕒 ${time} | ⏱️ Uptime: ${uptime} | 💻 ${platform}`;
          await conn.updateProfileStatus(bioText);
          console.log(`💫 [AutoBio] Updated: ${bioText}`);
        } catch (err) {
          console.error("⚠️ AutoBio update failed:", err.message);
        }
      }, 60 * 1000); // every 1 minute

      await conn.sendMessage(m.from, {
        text: "🌸 *AutoBio Enabled!*\nMiara will now refresh her bio every minute.",
      });

      // React safely if message key exists
      if (m?.key) {
        await conn.sendMessage(m.from, { react: { text: "💫", key: m.key } });
      }
    } else if (action === "off") {
      if (autoBioInterval) {
        clearInterval(autoBioInterval);
        autoBioInterval = null;
        await conn.sendMessage(m.from, {
          text: "🌙 *AutoBio Disabled.*\nMiara will no longer auto-update her bio.",
        });

        if (m?.key) {
          await conn.sendMessage(m.from, { react: { text: "🌸", key: m.key } });
        }
      } else {
        await conn.sendMessage(m.from, { text: "❌ AutoBio isn’t running." });
      }
    }
  },
};

/**
 * 🕒 Format uptime nicely
 */
function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}
