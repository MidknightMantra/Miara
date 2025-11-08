/**
 * 🌸 Miara — Smart Sticker Command (Baileys 7 Ready, 2025 Edition)
 * -----------------------------------------------------------------
 * Converts images, GIFs, or short videos into Miara-style WhatsApp stickers,
 * preserving EXIF metadata for packname and author.
 *
 * by MidKnightMantra × GPT-5
 */

import fs from "fs";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { config } from "../config.js";
import { autoToWebp } from "../lib/exifEngine.js";
import { detectFileType, safeReact, safeQuoted } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

export default {
  name: "sticker",
  aliases: ["s", "stick", "stiker"],
  description: "Convert an image, GIF, or short video into a Miara-style sticker 🌸",
  category: "media",
  usage: ".sticker (reply to image/video)",

  async execute(conn, m) {
    const chat = m.key.remoteJid;

    try {
      const q =
        m.quoted ||
        (m.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ? m.message.extendedTextMessage.contextInfo.quotedMessage
          : null);

      const targetMsg =
        q?.imageMessage ||
        q?.videoMessage ||
        m.message?.imageMessage ||
        m.message?.videoMessage;

      if (!targetMsg) {
        await conn.sendMessage(
          chat,
          {
            text:
              "📸 Reply to an *image*, *GIF*, or *short video* with `.sticker` to create a sticker."
          },
          safeQuoted(m)
        );
        return;
      }

      await safeReact(conn, m, "⏳");
      logger.info("Sticker conversion started.", "Sticker");

      // 🧩 Step 1: Download buffer from the correct message source
      const buffer = await downloadMediaMessage(
        { message: targetMsg },
        "buffer",
        {},
        { logger }
      );

      if (!buffer || !buffer.length) throw new Error("Failed to download media.");

      // 🧠 Step 2: Detect file type
      const type = await detectFileType(buffer);
      const mime = type?.mime || targetMsg.mimetype || "application/octet-stream";

      // 🪄 Step 3: Convert to WebP with EXIF metadata
      const stickerBuffer = await autoToWebp(buffer, mime, {
        packname: config.STICKER_PACK_NAME || "Miara Stickers 🌸",
        author: config.STICKER_AUTHOR || "MidKnightMantra"
      });

      if (!stickerBuffer) throw new Error("Sticker conversion failed.");

      // 💫 Step 4: Send sticker
      await conn.sendMessage(chat, { sticker: stickerBuffer }, safeQuoted(m));
      await safeReact(conn, m, "🌸");

      logger.info("Sticker successfully created and sent.", "Sticker");
    } catch (err) {
      logger.error(`Sticker creation failed: ${err.message}`, false, "Sticker");

      await conn.sendMessage(
        m.key.remoteJid,
        { text: `⚠️ Failed to create sticker.\nReason: ${err.message}` },
        safeQuoted(m)
      );

      await safeReact(conn, m, "❌");
    }
  }
};
