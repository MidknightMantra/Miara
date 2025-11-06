/**
 * 🌸 Miara — Smart Sticker Command (2025 Edition)
 * ------------------------------------------------
 * Converts images, GIFs, or short videos into stylish WhatsApp stickers
 * with EXIF metadata and quality optimization.
 *
 * by MidKnightMantra + GPT-5
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import webp from "node-webpmux";
import crypto from "crypto";
import { config } from "../config.js";

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
        text: "📸 Reply to an *image*, *GIF*, or *short video* with `.sticker` to create a sticker.",
      });
      return;
    }

    try {
      // ⏳ React to show processing
      await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

      // 📥 Download media
      const buffer = await downloadMediaMessage(m, "buffer", {}, { logger: console });
      if (!buffer) throw new Error("Failed to download media.");

      const tmpDir = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const inputPath = path.join(tmpDir, `input_${Date.now()}.tmp`);
      const outputPath = path.join(tmpDir, `sticker_${Date.now()}.webp`);

      fs.writeFileSync(inputPath, buffer);

      // 🎞️ FFmpeg conversion
      const isAnimated =
        mediaMsg.mimetype?.includes("gif") || mediaMsg.mimetype?.includes("video");

      const ffmpegCmd = isAnimated
        ? `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${outputPath}"`
        : `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 80 -compression_level 6 "${outputPath}"`;

      await new Promise((resolve, reject) => {
        exec(ffmpegCmd, (err) => (err ? reject(err) : resolve()));
      });

      const stickerBuffer = fs.readFileSync(outputPath);

      // 🖋️ Embed metadata
      const img = new webp.Image();
      await img.load(stickerBuffer);
      const exif = {
        "sticker-pack-id": crypto.randomBytes(16).toString("hex"),
        "sticker-pack-name": config.STICKER_PACK_NAME || "Miara Pack 🌸",
        "sticker-pack-publisher": config.STICKER_AUTHOR || "MidKnightMantra",
      };

      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);

      const jsonBuf = Buffer.from(JSON.stringify(exif), "utf8");
      const finalExif = Buffer.concat([exifAttr, jsonBuf]);
      finalExif.writeUIntLE(jsonBuf.length, 14, 4);
      img.exif = finalExif;

      const finalSticker = await img.save(null);

      // 🌸 Send the sticker
      await conn.sendMessage(from, { sticker: finalSticker }, { quoted: m });
      await conn.sendMessage(from, { react: { text: "🌸", key: m.key } });

      // 🧹 Cleanup
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    } catch (err) {
      console.error("❌ Sticker Error:", err);
      await conn.sendMessage(from, {
        text: `⚠️ Failed to create sticker.\nReason: ${err.message}`,
      });
      await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    }
  },
};
