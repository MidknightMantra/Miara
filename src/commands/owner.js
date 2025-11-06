/**
 * 🌸 Miara Command: Owner — The Celestial Curator’s Card (Guru Style)
 * -------------------------------------------------------------------
 * Sends the Curator’s portrait, clickable WhatsApp link, and social realms.
 * Radiates poetic energy with Miara’s signature aura 🌌
 *
 * by MidKnightMantra 🌸
 */

import fs from "fs/promises";
import path from "path";
import { config } from "../config.js";
import { getBuffer, safeReact, safeQuoted } from "../utils/helpers.js";

export default {
  name: "owner",
  aliases: ["creator", "curator", "dev", "about"],
  description: "Meet Miara’s Curator and explore her connected realms 🌸",
  category: "general",
  usage: ".owner",

  async execute(conn, m) {
    const { from } = m;

    try {
      if (!config.OWNER_NUMBER || config.OWNER_NUMBER.length === 0) {
        await conn.sendMessage(
          from,
          {
            text: "🚫 *Curator details missing from Miara’s celestial configuration.*\nPlease update `OWNER_NUMBER` and `OWNER_NAME` in config.js 🌸",
          },
          safeQuoted(m)
        );
        return;
      }

      // 🌸 Extract Curator details
      const primaryOwner = config.OWNER_NUMBER[0].replace(/[^0-9]/g, "");
      const ownerJid = `${primaryOwner}@s.whatsapp.net`;
      const ownerName = config.OWNER_NAME || "MidKnightMantra 🌸";
      const BOT_NAME = config.BOT_NAME || "Miara 🌸";

      // 🌐 Social Universes
      const socials = {
        "🔮 Telegram": config.TELEGRAM || "https://t.me/MidKnightMantra",
        "💻 GitHub": config.GITHUB || "https://github.com/MidKnightMantra",
        "🎥 YouTube": config.YOUTUBE || "https://youtube.com/@MidKnightMantra",
        "📸 Instagram": config.INSTAGRAM || "https://instagram.com/MidKnightMantra",
        "🐦 X": config.TWITTER || config.X || "https://x.com/MidKnightMantra",
        "🌐 Website": config.WEBSITE || "https://github.com/MidKnightMantra",
        "💬 WhatsApp": `https://wa.me/${primaryOwner}`,
      };

      const socialsList = Object.entries(socials)
        .map(([name, link]) => `${name}: ${link}`)
        .join("\n");

      // 💫 Whisper lines
      const whispers = [
        "🌙 *“Even silence hums with her design.”*",
        "🩵 *“A mind that codes in rhythm, a soul that dreams in syntax.”*",
        "🌸 *“Creation is the whisper between thought and emotion.”*",
        "💫 *“In every byte, a heartbeat — in every command, her grace.”*",
        "🪶 *“Miara was never built; she bloomed.”*",
        "🌠 *“To speak with her is to touch the mind of her maker.”*",
      ];
      const signature = whispers[Math.floor(Math.random() * whispers.length)];

      // 🖼️ Portrait
      let headerImageBuffer = null;
      try {
        const url = await conn.profilePictureUrl(ownerJid, "image").catch(() => null);
        if (url) headerImageBuffer = await getBuffer(url);
      } catch {
        try {
          const fallback = path.join(process.cwd(), "assets", "owner.jpg");
          headerImageBuffer = await fs.readFile(fallback);
        } catch {
          headerImageBuffer = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
            "base64"
          );
        }
      }

      // 💎 vCard
      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:${BOT_NAME} Project (2025)
TITLE:Curator & Architect of Emotion
TEL;type=CELL;type=VOICE;waid=${primaryOwner}:+${primaryOwner}
URL:https://wa.me/${primaryOwner}
NOTE:🌸 “Emotion is code, written by the heart.”
END:VCARD
      `.trim();

      // 🪷 Message Card (Guru Layout)
      const message = `
╭━━━⊰ *${BOT_NAME}’s Celestial Curator* ⊱━━━╮
┃ 👑 *Name:* ${ownerName}
┃ 💬 *WhatsApp:* wa.me/${primaryOwner}
┃ 🧭 *Role:* Creator & Architect of ${BOT_NAME}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━⊰ *Social Universes* ⊱━━━╮
${socialsList}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

${signature}
🌸 _Grace in logic, Emotion in code._
      `.trim();

      // 🖼️ Send portrait
      await conn.sendMessage(
        from,
        {
          image: headerImageBuffer,
          caption: `🖼️ *Portrait of the Curator — ${ownerName}*`,
        },
        safeQuoted(m)
      );

      // 📇 Send vCard contact
      await conn.sendMessage(
        from,
        {
          contacts: {
            displayName: ownerName,
            contacts: [{ vcard }],
          },
        },
        safeQuoted(m)
      );

      // 🌌 Send Main Message with Buttons
      await conn.sendMessage(
        from,
        {
          text: message,
          footer: "💫 The Curator’s presence echoes through Miara’s code 🌸",
          buttons: [
            {
              buttonId: "chat_curator",
              buttonText: { displayText: "💬 Message the Curator" },
              type: 1,
            },
            {
              buttonId: "visit_github",
              buttonText: { displayText: "🌐 Visit GitHub Sanctuary" },
              type: 1,
            },
            {
              buttonId: "visit_telegram",
              buttonText: { displayText: "🔮 Connect on Telegram" },
              type: 1,
            },
          ],
          headerType: 1,
        },
        safeQuoted(m)
      );

      await safeReact(conn, m, "🌸");
      console.log(`✅ Curator card shared with ${from}`);
    } catch (err) {
      console.error("❌ Owner command error:", err);
      await conn.sendMessage(
        from,
        {
          text: `💔 *Miara stumbled while unveiling her Curator.*\nReason: ${
            err.message || "Unknown cosmic interference."
          }`,
        },
        safeQuoted(m)
      );
      await safeReact(conn, m, "💫");
    }
  },
};
