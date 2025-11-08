/**
 * 🌙 Miara Command: QRScan — Celestial Decoder (Baileys 7-Ready)
 * --------------------------------------------------------------
 * Decodes QR codes from images, revealing the hidden sigil message.
 * by MidKnightMantra 🌸 — “To see is to understand the unspoken code.”
 */

import * as JimpModule from "jimp";
import QrCode from "qrcode-reader";
import { safeReact, safeQuoted } from "../utils/helpers.js";

const Jimp = JimpModule.Jimp || JimpModule.default || JimpModule;

export default {
  name: "qrscan",
  aliases: ["decode", "readqr", "sigilscan"],
  description: "Read or decode QR codes from images 🌌",
  category: "tools",
  usage: ".qrscan (reply to an image)",

  async execute(conn, m) {
    const chat = m.key.remoteJid;
    const quoted = m.quoted || m.msg?.contextInfo?.quotedMessage;

    try {
      // 🪬 Step 1: Ensure an image is provided
      const mime =
        quoted?.mimetype ||
        quoted?.msg?.mimetype ||
        m?.message?.imageMessage?.mimetype ||
        "";

      if (!/image/.test(mime)) {
        await conn.sendMessage(
          chat,
          {
            text:
              "🪬 Please *reply to an image containing a QR code* with `.qrscan`.\n\nExample:\n.qrscan (reply to image)"
          },
          safeQuoted(m)
        );
        return;
      }

      // 🩵 Step 2: Download the image
      await safeReact(conn, m, "🔍");
      const buffer = await conn.downloadMediaMessage(quoted || m, "buffer", {}, { logger: console });
      if (!buffer || buffer.length === 0)
        throw new Error("Failed to download image data.");

      // 🪶 Step 3: Decode via Jimp + qrcode-reader
      const image = await Jimp.read(buffer);
      const qr = new QrCode();
      const decoded = await new Promise((resolve, reject) => {
        qr.callback = (err, value) => (err ? reject(err) : resolve(value?.result || null));
        qr.decode(image.bitmap);
      });

      if (!decoded) {
        await conn.sendMessage(
          chat,
          { text: "⚠️ I couldn’t read that sigil... Try sending a clearer QR image." },
          safeQuoted(m)
        );
        await safeReact(conn, m, "💔");
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

      await conn.sendMessage(chat, { text: caption }, safeQuoted(m));
      await safeReact(conn, m, "✨");
      console.log(`🪷 QR Decoded → ${decoded}`);
    } catch (err) {
      console.error("❌ QRScan error:", err);
      await conn.sendMessage(
        chat,
        {
          text:
            `🚨 *QRScan Failed:*\n${err.message || "Unknown decoding error."}\n` +
            `Try again with a higher-resolution QR image.`
        },
        safeQuoted(m)
      );
      await safeReact(conn, m, "💔");
    }
  }
};
