/**
 * 🪞 Miara Command: Image to URL — “Mirror of the Web” (2025)
 * ------------------------------------------------------------
 * Uploads an image or sticker to Telegra.ph and returns a public URL.
 * by MidKnightMantra 🌸
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
    const from = m.from;
    const key = m.key;

    try {
      // 🌸 Step 1: Aesthetic reaction
      await conn.sendMessage(from, { react: { text: "📸", key } });

      // 🧩 Step 2: Find valid image or sticker
      const target =
        m.message?.imageMessage ||
        m.message?.stickerMessage ||
        m.quoted?.message?.imageMessage ||
        m.quoted?.message?.stickerMessage
          ? m.message?.imageMessage
            ? m
            : m.quoted
          : null;

      if (!target) {
        await conn.sendMessage(
          from,
          {
            text: "🪞 Please *send or reply* to an *image or sticker* with `.imgurl` ✨"
          },
          { quoted: m }
        );
        return;
      }

      // 🧠 Step 3: Download media
      await conn.sendMessage(from, { react: { text: "⏳", key } });
      const buffer = await downloadMediaMessage(target, "buffer", {}, { logger: console });

      if (!buffer || buffer.length === 0)
        throw new Error("Empty buffer — could not download image.");

      // 💾 Step 4: Save temp file safely
      const tempDir = path.join(process.cwd(), "temp");
      await fs.promises.mkdir(tempDir, { recursive: true });
      const tempFile = path.join(tempDir, `${Date.now()}_miara.jpg`);
      await fs.promises.writeFile(tempFile, buffer);

      // 🌐 Step 5: Upload to Telegra.ph
      const formData = new FormData();
      formData.append("file", fs.createReadStream(tempFile));

      const res = await axios.post("https://telegra.ph/upload", formData, {
        headers: formData.getHeaders(),
        timeout: 20000
      });

      // ✨ Step 6: Parse upload result
      const uploaded = res.data?.[0]?.src;
      if (!uploaded) throw new Error("Invalid Telegra.ph response.");

      const finalUrl = `https://telegra.ph${uploaded}`;

      // 🌸 Step 7: Respond beautifully
      const replyText = `
🪞 *Miara’s Mirror of the Web*  
━━━━━━━━━━━━━━━━━━━  
✨ *Upload Complete!*  
📸 *Public URL:*  
${finalUrl}

💫 Your image now lives in the cloud — gracefully.  
🌸 _Whispered through Telegra.ph_
      `.trim();

      await conn.sendMessage(from, { text: replyText }, { quoted: m.message });
      await conn.sendMessage(from, { react: { text: "🌸", key } });

      // 🧹 Step 8: Cleanup
      try {
        await fs.promises.unlink(tempFile);
      } catch (e) {
        console.warn("Cleanup skipped:", e.message);
      }

      console.log(`✅ Uploaded image → ${finalUrl}`);
    } catch (err) {
      console.error("❌ Image Upload Error:", err.message);
      const errorMsg = `
💔 *Upload Failed!*  
━━━━━━━━━━━━━━━  
⚠️ ${err.message || "An unknown issue occurred."}  
Please try again with a valid image.

🌸 Miara will always try again — patiently.
      `.trim();

      await conn.sendMessage(from, { text: errorMsg }, { quoted: m.message });
      await conn.sendMessage(from, { react: { text: "💫", key: m.key } });
    }
  }
};
