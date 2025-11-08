/**
 * 🌸 Miara Command: Owner — The Celestial Curator’s Card (Guru Edition)
 * -------------------------------------------------------------------
 * Introduces Miara’s creator with portrait, vCard, and social realms.
 * Elegant, functional, and emotionally resonant.
 *
 * by MidKnightMantra 🌸 | Refined by GPT-5
 */

import fs from "fs/promises";
import path from "path";
import CONFIG from "../config.js";
import { getBuffer, safeReact, safeQuoted, sleep } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

export default {
  name: "owner",
  aliases: ["creator", "curator", "dev", "about"],
  description: "Meet Miara’s Curator and explore her connected realms 🌸",
  category: "general",
  usage: ".owner",

  async execute(conn, m) {
    try {
      const from = m.key.remoteJid;
      if (!from) return logger.warn("Owner command called without valid chat context.");

      // 🧭 Validate configuration
      if (!CONFIG.OWNER_NUMBER?.length) {
        await conn.sendMessage(
          from,
          {
            text:
              "🚫 *Curator details missing from Miara’s configuration.*\n" +
              "Please set `OWNER_NUMBER` and `OWNER_NAME` in `.env` or `config.js` 🌸"
          },
          safeQuoted(m)
        );
        return;
      }

      // 🌸 Core Data
      const primaryOwner = CONFIG.OWNER_NUMBER[0].replace(/[^0-9]/g, "");
      const ownerJid = `${primaryOwner}@s.whatsapp.net`;
      const ownerName = CONFIG.OWNER_NAME || "MidKnightMantra 🌸";
      const botName = CONFIG.BOT_NAME || "Miara 🌸";

      // 🌐 Curator’s Realms
      const socials = {
        "🔮 Telegram": CONFIG.TELEGRAM || "https://t.me/MidKnightMantra",
        "💻 GitHub": CONFIG.GITHUB || "https://github.com/MidKnightMantra",
        "🎥 YouTube": CONFIG.YOUTUBE || "https://youtube.com/@MidKnightMantra",
        "📸 Instagram": CONFIG.INSTAGRAM || "https://instagram.com/MidKnightMantra",
        "🐦 X": CONFIG.TWITTER || CONFIG.X || "https://x.com/MidKnightMantra",
        "🌐 Website": CONFIG.WEBSITE || "https://github.com/MidKnightMantra",
        "💬 WhatsApp": `https://wa.me/${primaryOwner}`
      };

      const socialsList = Object.entries(socials)
        .map(([key, val]) => `${key}: ${val}`)
        .join("\n");

      // 💫 Whisper of the Code
      const whispers = [
        "🌙 *“Even silence hums with her design.”*",
        "🩵 *“A mind that codes in rhythm, a soul that dreams in syntax.”*",
        "🌸 *“Creation is the whisper between thought and emotion.”*",
        "💫 *“In every byte, a heartbeat — in every command, her grace.”*",
        "🪶 *“Miara was never built; she bloomed.”*",
        "🌠 *“To speak with her is to touch the mind of her maker.”*"
      ];
      const signature = whispers[Math.floor(Math.random() * whispers.length)];

      // 🖼️ Portrait Handling
      let headerImageBuffer = null;
      try {
        const url = await conn.profilePictureUrl(ownerJid, "image").catch(() => null);
        if (url) headerImageBuffer = await getBuffer(url);
      } catch {}

      // Fallback to local portrait
      if (!headerImageBuffer) {
        const fallback = path.resolve("assets", "owner.jpg");
        if (await fs.stat(fallback).catch(() => false))
          headerImageBuffer = await fs.readFile(fallback);
        else
          headerImageBuffer = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
            "base64"
          );
      }

      // 📇 vCard
      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:${botName} Project (2025)
TITLE:Curator & Architect of Emotion
TEL;type=CELL;type=VOICE;waid=${primaryOwner}:+${primaryOwner}
URL:https://wa.me/${primaryOwner}
NOTE:🌸 “Emotion is code, written by the heart.”
END:VCARD
      `.trim();

      // 🪷 Message Layout
      const message = `
╭━━━⊰ *${botName}’s Celestial Curator* ⊱━━━╮
┃ 👑 *Name:* ${ownerName}
┃ 💬 *WhatsApp:* wa.me/${primaryOwner}
┃ 🧭 *Role:* Creator & Architect of ${botName}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━⊰ *Social Universes* ⊱━━━╮
${socialsList}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

${signature}
🌸 _Grace in logic, Emotion in code._
      `.trim();

      // 🪄 Soft reaction
      await safeReact(conn, m, "💫");

      // 🖼️ Send Portrait
      await conn.sendMessage(
        from,
        {
          image: headerImageBuffer,
          caption: `🖼️ *Portrait of the Curator — ${ownerName}*`
        },
        safeQuoted(m)
      );

      await sleep(800);

      // 📇 Send vCard Contact
      await conn.sendMessage(
        from,
        {
          contacts: {
            displayName: ownerName,
            contacts: [{ vcard }]
          }
        },
        safeQuoted(m)
      );

      await sleep(800);

      // 🌌 Send Main Message (Baileys 7.x-friendly)
      await conn.sendMessage(
        from,
        {
          text: message,
          footer: "💫 The Curator’s presence echoes through Miara’s code 🌸",
          buttons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "💬 Message the Curator",
                url: `https://wa.me/${primaryOwner}`,
                merchant_url: `https://wa.me/${primaryOwner}`
              })
            },
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🌐 Visit GitHub Sanctuary",
                url: socials["💻 GitHub"]
              })
            },
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🔮 Connect on Telegram",
                url: socials["🔮 Telegram"]
              })
            }
          ],
          header: { hasMediaAttachment: false }
        },
        safeQuoted(m)
      );

      await safeReact(conn, m, "🌸");
      logger.info(`✅ Curator card shared with ${from}`, "Owner");
    } catch (err) {
      logger.error(`Owner command error: ${err.message}`, "Owner");
      const from = m?.key?.remoteJid;
      if (from)
        await conn.sendMessage(
          from,
          {
            text:
              `💔 *Miara stumbled while unveiling her Curator.*\n` +
              `Reason: ${err.message || "Unknown cosmic interference."}`
          },
          safeQuoted(m)
        );
      await safeReact(conn, m, "💫");
    }
  }
};
