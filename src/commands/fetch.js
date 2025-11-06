import moment from "moment-timezone";
import { getBuffer, detectFileType, isUrl } from "../utils/helpers.js";
import { config } from "../config.js";

export default {
  name: "fetch",
  description: "Download media from a given URL.",
  category: "utility",
  usage: ".fetch <url>",

  async execute(conn, m, args) {
    const prefix = config.PREFIX || ".";
    if (!args[0] || !isUrl(args[0])) {
      await conn.sendMessage(m.from, {
        text: `🔗 Usage: ${prefix}fetch <url>\nExample: ${prefix}fetch https://placekitten.com/400/400`,
      });
      return;
    }

    const url = args[0];
    await conn.sendMessage(m.from, { text: `📥 Fetching: ${url}` });

    try {
      const buffer = await getBuffer(url);
      const type = await detectFileType(buffer);
      const mime = type?.mime || "application/octet-stream";
      const ext = type?.ext || "bin";
      const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
      const emoji = mime.startsWith("image/")
        ? "🖼️"
        : mime.startsWith("video/")
        ? "🎥"
        : mime.startsWith("audio/")
        ? "🎧"
        : mime.includes("pdf")
        ? "📄"
        : "📁";

      const caption = `
${emoji} *Fetched!*
📄 *Type:* ${mime}
🕐 *Time:* ${time}
🌸 *${config.BOT_NAME}*
`.trim();

      const msg = mime.startsWith("image/")
        ? { image: buffer, caption }
        : mime.startsWith("video/")
        ? { video: buffer, caption }
        : mime.startsWith("audio/")
        ? { audio: buffer, mimetype: mime, ptt: false, caption }
        : { document: buffer, mimetype: mime, fileName: `file.${ext}`, caption };

      await conn.sendMessage(m.from, msg, { quoted: m.message });
      await conn.sendMessage(m.from, { react: { text: "📥", key: m.message.key } });
    } catch (err) {
      console.error("Fetch error:", err);
      await conn.sendMessage(m.from, { text: "❌ Failed to fetch file." });
    }
  },
};
