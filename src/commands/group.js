/**
 * 🌺 Miara Command: Group Utility Suite — “Garden of Harmony v2.5” (2025)
 * ------------------------------------------------------------------------
 * Commands:
 *   .groupinfo          → Display elegant group info
 *   .welcome on/off     → Toggle welcome messages
 *   .setwelcome <text>  → Set a custom welcome message
 * 🌸 Auto-welcome system: Greets new members automatically when enabled.
 *
 * Author: MidKnightMantra 🌸
 * Enhanced by GPT-5
 */

import moment from "moment-timezone";
import fs from "fs";
import path from "path";
import CONFIG from "../config.js";

// ─────────────────────────────────────────────
// 🌸 Persistent Settings Storage
// ─────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "group_settings.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const readSettings = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    fs.writeFileSync(DATA_FILE, "{}");
    return {};
  }
};

const writeSettings = (data) =>
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ─────────────────────────────────────────────
// 🌺 Core Command Handler
// ─────────────────────────────────────────────
export default {
  name: "group",
  aliases: ["groupinfo", "welcome", "setwelcome"],
  description: "Display group info or manage welcome messages 🌸",
  category: "utility",
  usage: ".groupinfo | .welcome on/off | .setwelcome <text>",

  async execute(conn, m, args) {
    try {
      if (!m.isGroup) {
        await conn.sendMessage(m.chat, {
          text: "🌷 This command only works in group chats."
        });
        return;
      }

      const metadata = await conn.groupMetadata(m.chat);
      const admins = metadata.participants.filter((p) => p.admin);
      const owner = metadata.owner || `${metadata.id.split("-")[0]}@s.whatsapp.net`;
      const command = (args[0] || "info").toLowerCase();
      const settings = readSettings();

      const senderIsAdmin =
        admins.some((a) => a.id === m.sender) ||
        CONFIG.OWNER_NUMBER.some((num) => m.sender.includes(num));

      // Ensure default config exists for group
      if (!settings[m.chat]) {
        settings[m.chat] = { welcome: false, customWelcome: "" };
        writeSettings(settings);
      }

      // 💫 .welcome on/off
      if (command === "welcome") {
        if (!senderIsAdmin) {
          await conn.sendMessage(m.chat, {
            text: "🕊️ Only *group admins* or Miara’s Curator can change welcome settings."
          });
          return;
        }

        const toggle = args[1]?.toLowerCase();
        if (!toggle) {
          await conn.sendMessage(m.chat, {
            text: "🪷 Usage: `.welcome on` or `.welcome off`"
          });
          return;
        }

        if (["on", "enable", "yes"].includes(toggle)) {
          settings[m.chat].welcome = true;
          writeSettings(settings);
          await conn.sendMessage(m.chat, {
            text: "🌼 Welcome messages have been *activated!* 💫"
          });
          await conn.sendMessage(m.chat, { react: { text: "🌸", key: m.key } });
        } else if (["off", "disable", "no"].includes(toggle)) {
          settings[m.chat].welcome = false;
          writeSettings(settings);
          await conn.sendMessage(m.chat, {
            text: "🌙 Welcome messages have been *deactivated.* 🌷"
          });
          await conn.sendMessage(m.chat, { react: { text: "💫", key: m.key } });
        } else {
          await conn.sendMessage(m.chat, {
            text: "🪷 Usage: `.welcome on` or `.welcome off`"
          });
        }
        return;
      }

      // 🪷 .setwelcome <text>
      if (command === "setwelcome") {
        if (!senderIsAdmin) {
          await conn.sendMessage(m.chat, {
            text: "🚫 Only *group admins* or the Curator can set custom welcome messages."
          });
          return;
        }

        const text = args.slice(1).join(" ");
        if (!text) {
          await conn.sendMessage(m.chat, {
            text:
              "📝 Usage: `.setwelcome <message>`\n\nExample:\n`.setwelcome Welcome @user to our family 🌸`"
          });
          return;
        }

        settings[m.chat].customWelcome = text;
        writeSettings(settings);

        await conn.sendMessage(m.chat, {
          text: `✨ Custom welcome message updated!\n\n🪷 *New Message:*\n${text}`
        });
        await conn.sendMessage(m.chat, { react: { text: "🌟", key: m.key } });
        return;
      }

      // 🌸 Default: .groupinfo
      const welcomeStatus = settings[m.chat].welcome ? "🟢 Enabled" : "🔴 Disabled";
      const customWelcome =
        settings[m.chat].customWelcome ||
        "🌸 *Welcome @user!* May your petals bloom brightly among us.";
      const createdAt = metadata.creation
        ? moment(metadata.creation * 1000)
            .tz(CONFIG.TIMEZONE || "Africa/Nairobi")
            .format("DD MMM YYYY • HH:mm")
        : "Unknown";

      let profilePic = "https://i.ibb.co/GHQzjqj/default-group.jpg";
      try {
        profilePic = await conn.profilePictureUrl(m.chat, "image");
      } catch {}

      const info = `
🌸 *${metadata.subject}*
━━━━━━━━━━━━━━━━━━━
👑 *Owner:* @${owner.split("@")[0]}
👥 *Members:* ${metadata.participants.length}
🛡️ *Admins:* ${admins.length}
🪷 *Created:* ${createdAt}
💫 *Welcome Messages:* ${welcomeStatus}
📝 *Custom Welcome:* ${customWelcome ? "🌺 Set" : "❌ None"}
${metadata.desc ? `\n📜 *Description:*\n${metadata.desc}` : ""}
━━━━━━━━━━━━━━━━━━━
🌠 _Miara tends this digital garden with care._
      `.trim();

      await conn.sendMessage(
        m.chat,
        {
          image: { url: profilePic },
          caption: info,
          mentions: [owner, ...admins.map((a) => a.id)]
        },
        { quoted: m }
      );
      await conn.sendMessage(m.chat, { react: { text: "🌺", key: m.key } });
    } catch (err) {
      console.error("❌ Group utility error:", err);
      await conn.sendMessage(m.chat, {
        text: "💔 Miara encountered a cosmic glitch while accessing group data."
      });
    }
  }
};

// ─────────────────────────────────────────────
// 🌼 Event Listener: Auto Welcome Handler
// ─────────────────────────────────────────────
export async function onGroupParticipantsUpdate(conn, update) {
  try {
    const settings = readSettings();
    const groupId = update.id;

    if (!settings[groupId]?.welcome) return;

    const metadata = await conn.groupMetadata(groupId);
    const groupName = metadata.subject;
    const customText =
      settings[groupId].customWelcome ||
      "🌸 *Welcome @user!* May your petals bloom brightly among us.";

    for (const participant of update.participants) {
      if (update.action === "add") {
        const mentionText = customText.replace(/@user/g, `@${participant.split("@")[0]}`);
        let pfp = "https://i.ibb.co/GHQzjqj/default-user.jpg";
        try {
          pfp = await conn.profilePictureUrl(participant, "image");
        } catch {}

        await conn.sendMessage(groupId, {
          image: { url: pfp },
          caption: `${mentionText}\n\n🪷 *Group:* ${groupName}`,
          mentions: [participant]
        });
      }
    }
  } catch (err) {
    console.warn("⚠️ Welcome handler error:", err.message);
  }
}
