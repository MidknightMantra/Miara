/**
 * sticker command
 * Usage: reply to an image/video with: !sticker
 */

import { imageToWebp, videoToWebp, writeExifImg, writeExifVid } from "../utils/exif.js";

export default async function (Miara, m, args) {
  try {
    const quoted = m.quoted;
    if (!quoted) return Miara.sendMessage(m.chat, { text: "Reply to an image or short video with !sticker" }, { quoted: m });

    // simple cases: image or video
    const messageType = Object.keys(quoted)[0];
    let buffer;
    if (messageType === "imageMessage") {
      const stream = await Miara.downloadMediaMessage({ msg: quoted });
      buffer = Buffer.from(stream);
      const webp = await imageToWebp(buffer);
      await Miara.sendMessage(m.chat, { sticker: { url: webp } }, { quoted: m });
    } else if (messageType === "videoMessage") {
      const stream = await Miara.downloadMediaMessage({ msg: quoted });
      buffer = Buffer.from(stream);
      const webp = await videoToWebp(buffer);
      await Miara.sendMessage(m.chat, { sticker: { url: webp } }, { quoted: m });
    } else {
      return Miara.sendMessage(m.chat, { text: "Unsupported media type for sticker." }, { quoted: m });
    }
  } catch (e) {
    console.error("sticker error", e);
    await Miara.sendMessage(m.chat, { text: "Failed to create sticker." }, { quoted: m });
  }
}
