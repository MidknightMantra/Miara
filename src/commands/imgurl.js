/**
 * 📸 Miara Command: Image to URL (Fixed)
 */

import axios from "axios";
import FormData from "form-data";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";

export default {
  name: "imgurl",
  aliases: ["imageurl", "uploadimg"],
  description: "Convert an uploaded image to a public URL.",
  category: "tools",
  usage: ".imgurl (attach or reply to an image)",

  async execute(conn, m) {
    const from = m.from;

    try {
      await conn.sendMessage(from, { react: { text: "📸", key: m.key } });

      const msg = m.message?.imageMessage
        ? m
        : m.quoted
        ? m.quoted
        : null;

      if (!msg) {
        await conn.sendMessage(
          from,
          {
            text: "🖼️ Please send or reply to an image with `.imgurl`",
          },
          { quoted: m }
        );
        return;
      }

      const buffer = await downloadMediaMessage(msg, "buffer", {}, { logger: console });

      const tempDir = "./temp";
      const tempFile = path.join(tempDir, `${Date.now()}.jpg`);
      fs.mkdirSync(tempDir, { recursive: true });
      fs.writeFileSync(tempFile, buffer);

      const formData = new FormData();
      formData.append("file", fs.createReadStream(tempFile));

      const uploadRes = await axios.post("https://telegra.ph/upload", formData, {
        headers: formData.getHeaders(),
        timeout: 15000,
      });

      if (uploadRes.data && Array.isArray(uploadRes.data) && uploadRes.data[0].src) {
        const imageUrl = "https://telegra.ph" + uploadRes.data[0].src;
        await conn.sendMessage(
          from,
          {
            text: `✅ *Image Uploaded Successfully!*\n\n📸 *URL:* ${imageUrl}`,
          },
          { quoted: m }
        );
      } else {
        throw new Error("Invalid Telegra.ph response");
      }

      fs.unlinkSync(tempFile);
    } catch (err) {
      console.error("❌ Image Upload Error:", err.response?.data || err.message);
      await conn.sendMessage(
        from,
        { text: "❌ Failed to upload image. Please try again later." },
        { quoted: m }
      );
    }
  },
};
