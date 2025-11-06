/**
 * 🌺 Miara Command: Group Utility Suite — “Garden of Harmony v2” (2025)
 * -----------------------------------------------------------
 * Commands:
 *   .groupinfo          → Display elegant group info
 *   .welcome on/off     → Toggle welcome messages
 *   .setwelcome <text>  → Set a custom welcome message
 *
 * Author: MidKnightMantra 🌸
 * Enhanced by GPT-5
 */

import moment from "moment-timezone";
import fs from "fs";
import path from "path";
import { config } from "../config.js";

const DATA_FILE = path.join(process.cwd(), "data", "group_settings.json");

// 🌸 Ensure persistent data directory
if (!fs.existsSync("data")) fs.mkdirSync("data");
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");

const readSettings = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
const writeSettings = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

export default {
  name: "group",
  aliases: ["groupinfo", "welcome", "setwelcome"],
  description: "Display group info or manage welcome messages 🌸",
  category: "utility",
  usage: ".groupinfo | .welcome on/off | .setwelcome <text>",

  async execute(conn, m, args) {
    try {
      if (!m.isGroup) {
        await conn.sendMessage(m.chat, { text: "🌷 This command only works in group chats." }, { quoted: m });
        return;
      }

      const metadata = await conn.groupMetadata(m.chat);
      const admins = metadata.participants.filter((p) => p.admin);
      const owner = metadata.owner || metadata.subjectOwner || m.chat.split("-")[0] + "@s.whatsapp.net";
      const command = args[0]?.toLowerCase() || "info";
      const settings = readSettings();

      // Restrict management actions to owner/admins only
      const senderIsAdmin =
        admins.some((a) => a.id === m.sender) || config.OWNER_NUMBER.includes(m.sender.split("@")[0]);

      // Initialize group settings if missing
      if (!settings[m.chat]) {
        settings[m.chat] = {
          welcome: false,
          customWelcome: "",
        };
        writeSettings(settings);
      }

      // 💫 Handle `.welcome on/off`
      if (command === "welcome") {
        if (!senderIsAdmin) {
          await conn.sendMessage(m.chat, { text: "🕊️ Only *group admins* or the owner can change welcome settings." }, { quoted: m });
          return;
        }

        const toggle = args[1]?.toLowerCase();
        if (!toggle) {
          await conn.sendMessage(m.chat, { text: "🪷 Usage: `.welcome on` or `.welcome off`" }, { quoted: m });
          return;
        }

        if (["on", "enable", "yes"].includes(toggle)) {
          settings[m.chat].welcome = true;
          writeSettings(settings);
          await conn.sendMessage(m.chat, { text: "🌼 Welcome messages have been *activated!* 💫" }, { quoted: m });
          await conn.sendMessage(m.chat, { react: { text: "🌸", key: m.key } });
        } else if (["off", "disable", "no"].includes(toggle)) {
          settings[m.chat].welcome = false;
          writeSettings(settings);
          await conn.sendMessage(m.chat, { text: "🌙 Welcome messages have been *deactivated.* 🌷" }, { quoted: m });
          await conn.sendMessage(m.chat, { react: { text: "💫", key: m.key } });
        } else {
          await conn.sendMessage(m.chat, { text: "🪷 Usage: `.welcome on` or `.welcome off`" }, { quoted: m });
        }
        return;
      }

      // 🪷 Handle `.setwelcome <text>`
      if (command === "setwelcome") {
        if (!senderIsAdmin) {
          await conn.sendMessage(m.chat, { text: "🚫 Only *group admins* or the owner can set custom welcome messages." }, { quoted: m });
          return;
        }

        const text = args.slice(1).join(" ");
        if (!text) {
          await conn.sendMessage(m.chat, {
            text: "📝 Usage: `.setwelcome <message>`\n\nExample:\n`.setwelcome Welcome @user to our family 🌸`",
          }, { quoted: m });
          return;
        }

        settings[m.chat].customWelcome = text;
        writeSettings(settings);

        await conn.sendMessage(m.chat, {
          text: `✨ Custom welcome message updated!\n\n🪷 *New Message:*\n${text}`,
        }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "🌟", key: m.key } });
        return;
      }

      // 🌸 Default: Group Info
      const welcomeStatus = settings[m.chat]?.welcome ? "🟢 Enabled" : "🔴 Disabled";
      const customWelcome = settings[m.chat]?.customWelcome || "🌸 *Welcome @user!* May your petals bloom brightly among us.";
      const createdAt = metadata.creation
        ? moment(metadata.creation * 1000).tz("Africa/Nairobi").format("DD MMM YYYY • HH:mm")
        : "Unknown";

      let desc = metadata.desc || "";
      try {
        const descData = await conn.groupDescribe(m.chat);
        desc = descData?.desc || metadata.desc || "";
      } catch {}

      let profilePic;
      try {
        profilePic = await conn.profilePictureUrl(m.chat, "image");
      } catch {
        profilePic = "https://i.ibb.co/GHQzjqj/default-group.jpg";
      }

      const info = `
🌸 *${metadata.subject}*
━━━━━━━━━━━━━━━━━━━
👑 *Owner:* @${owner.split("@")[0]}
👥 *Members:* ${metadata.participants.length}
🛡️ *Admins:* ${admins.length}
🪷 *Created:* ${createdAt}
💫 *Welcome Messages:* ${welcomeStatus}
📝 *Custom Welcome:* ${customWelcome ? "🌺 Set" : "❌ None"}
${desc ? `\n📜 *Description:*\n${desc}` : ""}
━━━━━━━━━━━━━━━━━━━
🌠 _Miara tends this digital garden with care._
      `.trim();

      await conn.sendMessage(
        m.chat,
        {
          image: { url: profilePic },
          caption: info,
          mentions: [owner, ...admins.map((a) => a.id)],
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: "🌺", key: m.key } });
    } catch (err) {
      console.error("❌ Group utility error:", err);
      await conn.sendMessage(
        m.chat,
        { text: "💔 Miara encountered a cosmic glitch while accessing group data." },
        { quoted: m }
      );
    }
  },
};
