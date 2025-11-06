/**
 * 🌸 Miara Fetch+ — Smart Universal Media Downloader
 * Author: MidKnightMantra
 * Enhanced by GPT-5
 *
 * Features:
 * 🔗 Auto media preview (YouTube, Twitter, TikTok, etc.)
 * 🧠 Auto conversion to .mp3 or .mp4
 * 🌈 Unique emoji aesthetic & graceful fallback
 */

import moment from "moment-timezone";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { getBuffer, detectFileType, isUrl } from "../utils/helpers.js";
import { config } from "../config.js";

const TMP_DIR = "./.cache_fetch";
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

export default {
  name: "fetch",
  description: "Download and auto-convert media from any URL 🌸",
  category: "utility",
  usage: ".fetch <url> or .fetch <url> mp3/mp4",

  async execute(conn, m, args) {
    const prefix = config.PREFIX || ".";
    if (!args[0] || !isUrl(args[0])) {
      await conn.sendMessage(m.from, {
        text: `🌍 *Usage:* ${prefix}fetch <url> [mp3/mp4]\n\n_Example:_\n${prefix}fetch https://youtu.be/abc123 mp3`,
      });
      return;
    }

    const url = args[0];
    const format = args[1]?.toLowerCase() || null;
    await conn.sendMessage(m.from, { text: `🌸 Fetching media from:\n🔗 ${url}` });

    try {
      // ✨ Detect platform
      const isYouTube = /youtu\.?be/.test(url);
      const isTwitter = /twitter\.com|x\.com/.test(url);
      const isTikTok = /tiktok\.com/.test(url);
      const isInstagram = /instagram\.com/.test(url);
      const isReddit = /reddit\.com/.test(url);

      // 🎥 Universal Fallback APIs (with built-in conversion)
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
        `https://api.lolhuman.xyz/api/ytmusic?apikey=lolhuman&url=${encodeURIComponent(url)}`,
      ];

      let mediaUrl, thumb, title, mime, fileName;

      // 🧠 Smart API selection
      for (const api of FALLBACK_APIS) {
        try {
          const res = await fetch(api);
          const data = await res.json();

          // Normalize results
          title =
            data.title ||
            data.result?.title ||
            data.data?.title ||
            "Untitled Media";

          mediaUrl =
            (format === "mp3"
              ? data.audio || data.result?.audio || data.data?.audio
              : data.video || data.result?.video || data.data?.video) ||
            data.url ||
            data.result ||
            data.downloadUrl;

          thumb =
            data.thumbnail ||
            data.result?.thumbnail ||
            data.data?.thumbnail ||
            null;

          if (mediaUrl) break;
        } catch {
          continue;
        }
      }

      if (!mediaUrl) {
        throw new Error("❌ All media APIs failed or URL unsupported.");
      }

      // 🧾 Fetch buffer
      const buffer = await getBuffer(mediaUrl);
      const type = await detectFileType(buffer);
      mime = type?.mime || (format === "mp3" ? "audio/mpeg" : "video/mp4");
      fileName = `${title.replace(/[^\w\s]/gi, "_")}.${format || (mime.includes("audio") ? "mp3" : "mp4")}`;

      const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

      // 🌸 Unique Emojis
      const emoji = mime.includes("audio")
        ? "🎧"
        : mime.includes("video")
        ? "📽️"
        : "🪐";

      const caption = `
${emoji} *${title}*
━━━━━━━━━━━━━━━
📄 *Type:* ${mime}
💾 *Size:* ${sizeMB} MB
🕰️ *Fetched:* ${time}
🌷 *${config.BOT_NAME}*
━━━━━━━━━━━━━━━
✨ _Miara transformed this link for you._ 🌸
`.trim();

      const msg =
        mime.startsWith("audio/")
          ? { audio: buffer, mimetype: mime, fileName, caption, ptt: false }
          : { video: buffer, mimetype: mime, fileName, caption, thumbnail: thumb };

      await conn.sendMessage(m.from, msg, { quoted: m.message });
      await conn.sendMessage(m.from, { react: { text: "🌈", key: m.message.key } });
    } catch (err) {
      console.error("❌ Fetch+ error:", err);
      await conn.sendMessage(m.from, {
        text: `⚠️ Failed to process media.\n${err.message}`,
      });
      await conn.sendMessage(m.from, { react: { text: "💔", key: m.message.key } });
    }
  },
};
