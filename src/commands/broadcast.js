/**
 * 🌸 Miara Command: Broadcast (Owner Only)
 * Author: MidKnightMantra
 * Enhanced by GPT-5
 */

import { sleep } from "../utils/helpers.js";
import { config } from "../config.js";

export default {
  name: "broadcast",
  aliases: ["bc"],
  description: "Send a message or media to all chats (owner only).",
  category: "owner",
  usage: ".bc <text> | reply to a media message",

  async execute(conn, m, args, commands, store) {
    try {
      const sender = m.sender.split("@")[0];
      if (!config.OWNER_NUMBER.includes(sender)) {
        await conn.sendMessage(
          m.from,
          { text: "❌ Only the bot owner can use this command." },
          { quoted: m }
        );
        return;
      }

      const quoted = m.quoted || m.message?.extendedTextMessage?.contextInfo;
      const text = args.join(" ").trim();

      if (!text && !quoted) {
        await conn.sendMessage(
          m.from,
          {
            text: "📢 Usage: `.bc <text>` or reply to an image/video/document with `.bc <caption>`"
          },
          { quoted: m }
        );
        return;
      }

      // Fetch all chats
      const chats = [...store.data.chats.keys()];
      const total = chats.length;
      let count = 0;
      const startTime = Date.now();

      await conn.sendMessage(
        m.from,
        {
          text: `📣 *Broadcast started!*\n\nSending to ${total} chats... This may take a while.`
        },
        { quoted: m }
      );

      for (const jid of chats) {
        try {
          count++;

          // Adaptive throttling
          if (count % 25 === 0) await sleep(1200);
          else await sleep(250);

          if (quoted && quoted.message) {
            // Forward media with caption
            const media = await conn.downloadMediaMessage(quoted);
            const mime = quoted.mimetype || "application/octet-stream";

            await conn.sendMessage(jid, {
              [mime.startsWith("image")
                ? "image"
                : mime.startsWith("video")
                  ? "video"
                  : mime.startsWith("audio")
                    ? "audio"
                    : "document"]: media,
              caption: text || "📢 *Broadcast Message*",
              mimetype: mime
            });
          } else {
            await conn.sendMessage(jid, {
              text: `📢 *Broadcast Message*\n\n${text}\n\n— 🌸 _Miara Bot_`
            });
          }

          if (count % 10 === 0) {
            console.log(`✅ Sent ${count}/${total}`);
          }
        } catch (err) {
          console.warn(`⚠️ Failed to send to ${jid}:`, err.message);
          await sleep(500);
        }
      }

      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
      await conn.sendMessage(m.from, {
        text: `✅ *Broadcast complete!*\n\n📤 Sent to: ${count}/${total} chats\n🕒 Duration: ${timeTaken}s`
      });
    } catch (err) {
      console.error("❌ Broadcast Error:", err);
      await conn.sendMessage(
        m.from,
        {
          text: "❌ An error occurred while sending broadcast."
        },
        { quoted: m }
      );
    }
  }
};
