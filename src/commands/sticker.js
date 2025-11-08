/**
 * 🌸 Miara — Smart Sticker Command (2025 Edition)
 * ------------------------------------------------
 * Converts images, GIFs, or short videos into stylish WhatsApp stickers
 * using Miara’s Artistic EXIF Engine.
 *
 * by MidKnightMantra × GPT-5
 */

import fs from "fs";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { config } from "../config.js";
import { autoToWebp } from "../lib/exifEngine.js";
import { detectFileType } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

export default {
  name: "sticker",
  aliases: ["s", "stick", "stiker"],
  description: "Convert an image, GIF, or short video into a Miara-style sticker 🌸",
  category: "media",
  usage: ".sticker (reply to image/video)",

  async execute(conn, m) {
    const { from } = m;
    const quoted = m.quoted || m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const mediaMsg =
      quoted?.imageMessage ||
      quoted?.videoMessage ||
      m.message?.imageMessage ||
      m.message?.videoMessage;

    if (!mediaMsg) {
      await conn.sendMessage(from, {
        text: "📸 Reply to an *image*, *GIF*, or *short video* with `.sticker` to create a sticker."
      });
      return;
    }

    try {
      await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });
      logger.info("Sticker conversion started.", "Sticker");

      // download media
      const buffer = await downloadMediaMessage(m, "buffer", {}, { logger });
      if (!buffer) throw new Error("Failed to download media buffer.");

      // detect type
      const type = await detectFileType(buffer);
      const mime = type.mime || mediaMsg.mimetype || "application/octet-stream";

      // convert to WebP
      const stickerBuffer = await autoToWebp(buffer, mime, {
        packname: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR
      });

      // send sticker
      await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
      await conn.sendMessage(from, { react: { text: "🌸", key: m.key } });

      logger.info("Sticker successfully created and sent.", "Sticker");
    } catch (err) {
      logger.error(`Sticker creation failed: ${err.message}`, false, "Sticker");
      await conn.sendMessage(from, {
        text: `⚠️ Failed to create sticker.\nReason: ${err.message}`
      });
      await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    }
  }
};
