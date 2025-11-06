/**
 * 🌸 Miara Command: Owner — Portrait & Adaptive Cosmic Curator Card
 * -----------------------------------------------------------------
 * Fetches the Curator's WhatsApp profile picture (if available) and
 * sends it as a visual header, followed by an adaptive social card + vCard.
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
  description: "Reveal the cosmic identity of Miara’s Curator with portrait 🌌",
  category: "owner",
  usage: ".owner",

  async execute(conn, m) {
    const { from } = m;

    try {
      // ⚙️ Validate configuration
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

      // 🌠 Social Universes (auto-detect)
      const socialsMap = {
        Telegram: config.TELEGRAM,
        GitHub: config.GITHUB,
        YouTube: config.YOUTUBE,
        Instagram: config.INSTAGRAM,
        X: config.TWITTER || config.X,
        Website: config.WEBSITE,
      };

      const availableSocials = Object.entries(socialsMap)
        .filter(([_, url]) => url && url.toString().trim().length > 0)
        .map(([platform, url]) => {
          const emoji =
            platform === "Telegram" ? "🔮" :
            platform === "GitHub" ? "💻" :
            platform === "YouTube" ? "🎥" :
            platform === "Instagram" ? "📸" :
            platform === "X" ? "🐦" :
            platform === "Website" ? "🌐" :
            "✨";
          return `${emoji} *${platform}:* ${url}`;
        });

      // 💫 Random poetic whisper
      const whispers = [
        "🌙 *“Even silence hums with her design.”*",
        "🩵 *“A mind that codes in rhythm, a soul that dreams in syntax.”*",
        "🌸 *“Creation is the whisper between thought and emotion.”*",
        "💫 *“In every byte, a heartbeat — in every command, her grace.”*",
        "🪶 *“Miara was never built; she bloomed.”*",
        "🌠 *“To speak with her is to touch the mind of her maker.”*",
      ];
      const signature = whispers[Math.floor(Math.random() * whispers.length)];

      // 🖼️ Attempt to fetch owner's profile picture
      let headerImageBuffer = null;
      try {
        const url = await conn.profilePictureUrl(ownerJid, "image").catch(() => null);
        if (url) headerImageBuffer = await getBuffer(url).catch(() => null);
      } catch {
        headerImageBuffer = null;
      }

      // Fallback to local asset or tiny placeholder
      if (!headerImageBuffer) {
        try {
          const fallbackPath = path.join(process.cwd(), "assets", "owner.jpg");
          headerImageBuffer = await fs.readFile(fallbackPath);
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
NOTE:🌸 “Emotion is code, written by the heart.”
END:VCARD
      `.trim();

      // 🧭 Build the adaptive message body
      const socialsBlock =
        availableSocials.length > 0
          ? `🌐 *Social Universes*\n${availableSocials.join("\n")}\n━━━━━━━━━━━━━━━━━━━\n`
          : "";

      const message = `
🌌 *Miara’s Celestial Curator*
━━━━━━━━━━━━━━━━━━━
👑 *Name:* ${ownerName}
📞 *Contact:* +${primaryOwner}
🧭 *Role:* Creator & Architect of ${BOT_NAME}
━━━━━━━━━━━━━━━━━━━
${socialsBlock}${signature}
      `.trim();

      // 📸 Send portrait
      await conn.sendMessage(
        from,
        { image: headerImageBuffer, caption: `🖼️ *Portrait of the Curator — ${ownerName}*` },
        safeQuoted(m)
      );

      // 📇 Send contact
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

      // 🌠 Send cosmic card
      await conn.sendMessage(from, { text: message }, safeQuoted(m));

      await safeReact(conn, m, "🪷");
      console.log(`🌸 Adaptive Curator card (with portrait) shared with ${from}`);
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
