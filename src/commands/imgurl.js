/**
 * 🪞 Miara Command: Image to URL — “Mirror of the Web” (2025)
 * ------------------------------------------------------------
 * Uploads an image or sticker to Telegra.ph (or fallback mirrors)
 * and returns a public URL.
 *
 * 💫 Features:
 * - Supports images & stickers (jpg, png, webp)
 * - Graceful Telegra.ph fallback to File.io and 0x0.st
 * - Temporary file cleanup and polite reactions
 *
 * by MidKnightMantra 🌸 | Refined by GPT-5
 */

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default {
  name: "imgurl",
  aliases: ["imageurl", "uploadimg", "mirror"],
  description: "Convert or mirror an image/sticker into a public URL 🌐",
  category: "tools",
  usage: ".imgurl (attach or reply to an image/sticker)",

  async execute(conn, m) {
    const from = m.chat || m.from;
    const key = m.key;

    try {
      // 🌸 Step 1: Initial Reaction
      await conn.sendMessage(from, { react: { text: "📸", key } });

      // 🧩 Step 2: Locate media (image/sticker or reply)
      const msg =
        m.message?.imageMessage ||
        m.message?.stickerMessage ||
        m.quoted?.message?.imageMessage ||
        m.quoted?.message?.stickerMessage
          ? m.message?.imageMessage || m.message?.stickerMessage
            ? m
            : m.quoted
          : null;

      if (!msg) {
        await conn.sendMessage(
          from,
          {
            text: "🪞 Please *send or reply* to an *image or sticker* with `.imgurl` ✨"
          },
          { quoted: m }
        );
        return;
      }

      // 🧠 Step 3: Download the media
      await conn.sendMessage(from, { react: { text: "⏳", key } });

      const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });
      if (!buffer?.length) throw new Error("Empty buffer — failed to fetch image data.");

      // 💾 Step 4: Temporary file
      const tempDir = path.join(process.cwd(), "temp");
      await fs.promises.mkdir(tempDir, { recursive: true });

      const ext = msg.message?.imageMessage ? "jpg" : "webp";
      const tempFile = path.join(tempDir, `${Date.now()}_miara.${ext}`);
      await fs.promises.writeFile(tempFile, buffer);

      // 🌐 Step 5: Attempt upload
      const uploaded = await uploadWithFallback(tempFile);
      if (!uploaded) throw new Error("Upload failed — no valid mirror responded.");

      const replyText = `
🪞 *Miara’s Mirror of the Web*  
━━━━━━━━━━━━━━━━━━━  
✨ *Upload Complete!*  
📸 *Public URL:*  
${uploaded}

💫 Your image now lives among the stars.  
🌸 _Whispered through the cosmic mirrors._
      `.trim();

      await conn.sendMessage(from, { text: replyText }, { quoted: m });
      await conn.sendMessage(from, { react: { text: "🌸", key } });

      // 🧹 Step 6: Cleanup
      try {
        await fs.promises.unlink(tempFile);
      } catch (e) {
        console.warn("Cleanup skipped:", e.message);
      }

      console.log(`✅ Uploaded successfully → ${uploaded}`);
    } catch (err) {
      console.error("❌ Image Upload Error:", err.message);

      const errorMsg = `
💔 *Upload Failed!*  
━━━━━━━━━━━━━━━  
⚠️ ${err.message || "An unknown issue occurred."}  
Please try again with a valid image or sticker.

🌸 Miara remains patient and ready to reflect again.
      `.trim();

      await conn.sendMessage(from, { text: errorMsg }, { quoted: m });
      await conn.sendMessage(from, { react: { text: "💫", key } });
    }
  }
};

// ─────────────────────────────────────────────
// 🪷 Helper: Multi-host upload with graceful fallback
// ─────────────────────────────────────────────
async function uploadWithFallback(filePath) {
  try {
    // 1️⃣ Try Telegra.ph
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    const res = await axios.post("https://telegra.ph/upload", formData, {
      headers: formData.getHeaders(),
      timeout: 20000
    });
    const src = res.data?.[0]?.src;
    if (src) return `https://telegra.ph${src}`;
  } catch (e) {
    console.warn("⚠️ Telegra.ph failed:", e.message);
  }

  try {
    // 2️⃣ Try File.io
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    const res = await axios.post("https://file.io", formData, {
      headers: formData.getHeaders(),
      timeout: 20000
    });
    if (res.data?.link) return res.data.link;
  } catch (e) {
    console.warn("⚠️ File.io failed:", e.message);
  }

  try {
    // 3️⃣ Try 0x0.st
    const res = await axios.post("https://0x0.st", fs.createReadStream(filePath), {
      headers: { "Content-Type": "application/octet-stream" },
      timeout: 20000
    });
    if (res.data?.startsWith("http")) return res.data.trim();
  } catch (e) {
    console.warn("⚠️ 0x0.st failed:", e.message);
  }

  return null;
}
