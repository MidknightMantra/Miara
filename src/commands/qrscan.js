/**
 * 🌙 Miara Command: QRScan — Celestial Decoder
 * --------------------------------------------
 * Decodes QR codes from images, revealing the hidden sigil message.
 * by MidKnightMantra 🌸 — “To see is to understand the unspoken code.”
 */

import * as JimpModule from "jimp";
import QrCode from "qrcode-reader";

const Jimp = JimpModule.Jimp || JimpModule.default || JimpModule;

export default {
  name: "qrscan",
  aliases: ["decode", "readqr", "sigilscan"],
  description: "Read or decode QR codes from images 🌌",
  category: "tools",
  usage: ".qrscan (reply to an image)",

  async execute(conn, m) {
    const { from, quoted } = m;

    // 🪬 Step 1: Check if user replied to an image
    const q = quoted || m.quoted;
    const mime = q?.mimetype || q?.msg?.mimetype || m?.message?.imageMessage?.mimetype || "";

    if (!/image/.test(mime)) {
      await conn.sendMessage(from, {
        text: "🪬 Please reply to an *image containing a QR code* with `.qrscan`.\n\nExample:\n.qrscan (reply to image)"
      });
      return;
    }

    try {
      // 🩵 Step 2: Download image as buffer
      await conn.sendMessage(from, { react: { text: "🔍", key: m.key } });
      const buffer = await conn.downloadMediaMessage(q, "buffer", {}, { logger: console });
      if (!buffer || buffer.length === 0) throw new Error("Failed to download image.");

      // 🪶 Step 3: Load and decode using Jimp + qrcode-reader
      const image = await Jimp.read(buffer);
      const qr = new QrCode();

      const decoded = await new Promise((resolve, reject) => {
        qr.callback = (err, value) => (err ? reject(err) : resolve(value?.result || null));
        qr.decode(image.bitmap);
      });

      if (!decoded) {
        await conn.sendMessage(from, {
          text: "⚠️ I couldn’t read that sigil... Try sending a clearer QR image."
        });
        await conn.sendMessage(from, { react: { text: "💔", key: m.key } });
        return;
      }

      // 🌠 Step 4: Prepare response
      const emoji = /^https?:\/\//.test(decoded) ? "🌐" : decoded.length > 50 ? "📜" : "💎";

      const caption = `
${emoji} *Decoded Sigil Revealed!*
───────────────────────
🔓 *Hidden Message:* 
\`\`\`${decoded}\`\`\`
🧿 *Decoded by:* Miara 🌸
🌠 *Status:* Successfully unveiled
      `.trim();

      await conn.sendMessage(from, { text: caption }, { quoted: m.message });
      await conn.sendMessage(from, { react: { text: "✨", key: m.key } });

      console.log(`🪷 QR Decoded → ${decoded}`);
    } catch (err) {
      console.error("❌ QRScan error:", err);
      await conn.sendMessage(from, {
        text: `🚨 *QRScan Failed:*\n${err.message || "Unknown decoding error"}\nTry again with a higher-resolution QR image.`
      });
      await conn.sendMessage(from, { react: { text: "💔", key: m.key } });
    }
  }
};
