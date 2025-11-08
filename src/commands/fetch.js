/**
 * 🌸 Miara Fetch+ — Celestial Edition
 * Author: MidKnightMantra
 * Refined by GPT-5
 *
 * ✨ Features:
 * 🪷 Auto media preview (YouTube, TikTok, Twitter, etc.)
 * 🌈 Unique emojis for each file type
 * 🧠 Auto mp3/mp4 conversion
 * 🪐 Graceful error handling
 * 🌷 Safe, polished, production-ready
 */

import moment from "moment-timezone";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import CONFIG from "../config.js";
import { getBuffer, detectFileType, isUrl, safeReact } from "../utils/helpers.js";

const TMP_DIR = path.resolve(".cache_fetch");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

export default {
  name: "fetch",
  description: "Fetch and transform media from any URL 🌸",
  category: "utility",
  usage: ".fetch <url> [mp3/mp4]",

  async execute(conn, m, args) {
    const prefix = CONFIG.PREFIX || ".";
    const url = args[0];
    const format = args[1]?.toLowerCase() || null;

    if (!url || !isUrl(url)) {
      await conn.sendMessage(m.chat, {
        text: `🌍 *Usage:* ${prefix}fetch <url> [mp3/mp4]\n\n🪷 Example:\n${prefix}fetch https://youtu.be/dQw4w9WgXcQ mp3`
      });
      return;
    }

    await conn.sendMessage(
      m.chat,
      { text: `🌠 Traversing the cosmos for:\n🔗 ${url}` },
      { quoted: m }
    );

    try {
      // 🔭 Detect platform
      const isYouTube = /youtu\.?be/.test(url);
      const isTwitter = /twitter\.com|x\.com/.test(url);
      const isTikTok = /tiktok\.com/.test(url);
      const isInstagram = /instagram\.com/.test(url);
      const isReddit = /reddit\.com/.test(url);
      const isGeneric = !(isYouTube || isTwitter || isTikTok || isInstagram || isReddit);

      // 🪐 Multi-source fallback APIs
      const FALLBACK_APIS = [
        `https://api.neoxr.eu/api/ytdl?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/download/ytv2?url=${encodeURIComponent(url)}`,
        `https://api.ryzendesu.vip/api/download/yta2?url=${encodeURIComponent(url)}`,
        `https://api.betabotz.eu.org/api/download/twitter?apikey=beta&url=${encodeURIComponent(url)}`,
        `https://api.betabotz.eu.org/api/download/tiktok?apikey=beta&url=${encodeURIComponent(url)}`,
        `https://api.betabotz.eu.org/api/download/instagram?apikey=beta&url=${encodeURIComponent(url)}`,
        `https://api.zahwazein.xyz/downloader/twitter?apikey=zenzkey&url=${encodeURIComponent(url)}`,
        `https://api.zahwazein.xyz/downloader/youtube?apikey=zenzkey&url=${encodeURIComponent(url)}`,
        `https://api.lolhuman.xyz/api/ytvideo?apikey=lolhuman&url=${encodeURIComponent(url)}`,
        `https://api.lolhuman.xyz/api/ytmusic?apikey=lolhuman&url=${encodeURIComponent(url)}`
      ];

      let mediaUrl = null,
        thumb = null,
        title = "Unnamed Artifact",
        duration = null;

      // 🔁 Try APIs sequentially until one works
      for (const api of FALLBACK_APIS) {
        try {
          const res = await fetch(api, { timeout: 10000 });
          if (!res.ok) continue;
          const data = await res.json();

          title = data.title || data.result?.title || data.data?.title || title;

          thumb = data.thumbnail || data.result?.thumbnail || data.data?.thumbnail || null;

          duration = data.duration || data.result?.duration || data.data?.duration || null;

          const urls = [
            data.url,
            data.result?.url,
            data.result?.video,
            data.result?.audio,
            data.data?.url,
            data.data?.video,
            data.data?.audio,
            data.downloadUrl
          ];

          mediaUrl = urls.find((u) => typeof u === "string" && isUrl(u));
          if (mediaUrl) break;
        } catch {
          continue;
        }
      }

      // 🛑 No valid media found
      if (!mediaUrl && !isGeneric) {
        await conn.sendMessage(
          m.chat,
          {
            text: `🪐 *Link not supported or unreachable.*\nTry again with YouTube, TikTok, or direct media URL.`
          },
          { quoted: m }
        );
        await safeReact(conn, m, "💫");
        return;
      }

      // 🎞️ Preview step
      if (!format && mediaUrl && thumb) {
        const caption = `
🌷 *${title}*
⌛ Duration: ${duration || "Unknown"}
✨ Choose your format:
        `.trim();

        await conn.sendMessage(
          m.chat,
          {
            image: { url: thumb },
            caption,
            footer: "🌸 Miara Media Gateway",
            buttons: [
              {
                buttonId: `${prefix}fetch ${url} mp3`,
                buttonText: { displayText: "🎼 Extract MP3" },
                type: 1
              },
              {
                buttonId: `${prefix}fetch ${url} mp4`,
                buttonText: { displayText: "🎬 Download MP4" },
                type: 1
              }
            ],
            headerType: 4
          },
          { quoted: m }
        );
        return;
      }

      // 📦 Download and buffer
      let buffer, mimeGuess, fileName;

      if (isGeneric) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        buffer = await res.buffer();

        const type = await detectFileType(buffer);
        mimeGuess = type?.mime || res.headers.get("content-type") || "application/octet-stream";
        fileName = path.basename(url.split("?")[0] || "artifact") || "file";
      } else {
        if (!mediaUrl) throw new Error("Media URL missing");
        buffer = await getBuffer(mediaUrl);

        const type = await detectFileType(buffer);
        mimeGuess = type?.mime || (format === "mp3" ? "audio/mpeg" : "video/mp4");
        const safeTitle = title.replace(/[^\w\s-]/g, "_").substring(0, 40);
        fileName = `${safeTitle}.${format || (mimeGuess.includes("audio") ? "mp3" : "mp4")}`;
      }

      // 🕒 Metadata
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
      const time = moment()
        .tz(CONFIG.TIMEZONE || "Africa/Nairobi")
        .format("HH:mm:ss");

      const emoji = mimeGuess.startsWith("audio/")
        ? "🎼"
        : mimeGuess.startsWith("video/")
          ? "🎬"
          : mimeGuess.includes("pdf")
            ? "📜"
            : mimeGuess.includes("zip") || mimeGuess.includes("rar")
              ? "💠"
              : "🌌";

      const caption = `
${emoji} *${title || "Unknown Artifact"}*
━━━━━━━━━━━━━━━
📄 *Type:* ${mimeGuess}
💾 *Size:* ${sizeMB} MB
🕰️ *Fetched:* ${time}
🌷 *${CONFIG.BOT_NAME}*
━━━━━━━━━━━━━━━
🌠 _Transmitted across galaxies by Miara._
      `.trim();

      // 💫 Send message
      const msg = mimeGuess.startsWith("audio/")
        ? { audio: buffer, mimetype: mimeGuess, fileName, caption, ptt: false }
        : mimeGuess.startsWith("video/")
          ? { video: buffer, mimetype: mimeGuess, fileName, caption, thumbnail: thumb }
          : { document: buffer, mimetype: mimeGuess, fileName, caption };

      await conn.sendMessage(m.chat, msg, { quoted: m });
      await safeReact(conn, m, "💫");
    } catch (err) {
      console.error("❌ Fetch error:", err);
      const message =
        err.name === "AbortError"
          ? "⏰ Connection timeout — star too distant."
          : /invalid|undefined|ENOTFOUND/.test(err.message.toLowerCase())
            ? "🌑 The portal link was invalid or unreachable."
            : "💥 Miara couldn’t retrieve that artifact.";

      await conn.sendMessage(m.chat, { text: `❌ ${message}` }, { quoted: m });
      await safeReact(conn, m, "💔");
    }
  }
};
