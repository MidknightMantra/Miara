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
import { getBuffer, detectFileType, isUrl } from "../utils/helpers.js";
import { config } from "../config.js";

const TMP_DIR = "./.cache_fetch";
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

export default {
  name: "fetch",
  description: "Fetch and transform media from any URL 🌸",
  category: "utility",
  usage: ".fetch <url> [mp3/mp4]",

  async execute(conn, m, args) {
    const prefix = config.PREFIX || ".";
    const url = args[0];
    const format = args[1]?.toLowerCase() || null;

    if (!url || !isUrl(url)) {
      await conn.sendMessage(m.from, {
        text: `🌍 *Usage:* ${prefix}fetch <url> [mp3/mp4]\n\n🪷 _Example:_\n${prefix}fetch https://youtu.be/dQw4w9WgXcQ mp3`,
      });
      return;
    }

    await conn.sendMessage(m.from, { text: `🌠 Traversing the cosmos for:\n🔗 ${url}` });

    try {
      // 🔭 Platform detection
      const isYouTube = /youtu\.?be/.test(url);
      const isTwitter = /twitter\.com|x\.com/.test(url);
      const isTikTok = /tiktok\.com/.test(url);
      const isInstagram = /instagram\.com/.test(url);
      const isReddit = /reddit\.com/.test(url);
      const isGeneric =
        !isYouTube && !isTwitter && !isTikTok && !isInstagram && !isReddit;

      // 🌐 Multi-API fallback
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

      let mediaUrl, thumb, title, duration;

      // 🌟 Try all sources until a valid URL appears
      for (const api of FALLBACK_APIS) {
        try {
          const res = await fetch(api);
          const data = await res.json();

          title =
            data.title ||
            data.result?.title ||
            data.data?.title ||
            "Unnamed Celestial Artifact";

          thumb =
            data.thumbnail ||
            data.result?.thumbnail ||
            data.data?.thumbnail ||
            null;

          duration =
            data.duration ||
            data.result?.duration ||
            data.data?.duration ||
            null;

          const possibleUrls = [
            data.audio,
            data.video,
            data.result?.audio,
            data.result?.video,
            data.data?.audio,
            data.data?.video,
            data.url,
            data.result,
            data.downloadUrl,
          ];

          mediaUrl = possibleUrls.find(
            (u) => typeof u === "string" && isUrl(u)
          );

          if (mediaUrl) break;
        } catch {
          continue;
        }
      }

      // 🛑 No valid link found
      if (!mediaUrl && !isGeneric) {
        await conn.sendMessage(m.from, {
          text: `🪐 *Link not supported or invalid.*\nMiara could not retrieve this star's data.\nTry again with a YouTube, TikTok, or direct media link.`,
        });
        return;
      }

      // 🎞️ Preview if no format chosen
      if (!format && !isGeneric && mediaUrl && thumb) {
        const caption = `
🌷 *${title}*
⌛ Duration: ${duration || "Unknown"}
✨ Choose your destiny:
`.trim();

        await conn.sendMessage(
          m.from,
          {
            image: { url: thumb },
            caption,
            footer: "🌸 Miara Media Gateway",
            buttons: [
              {
                buttonId: `${prefix}fetch ${url} mp3`,
                buttonText: { displayText: "🎼 Extract MP3" },
                type: 1,
              },
              {
                buttonId: `${prefix}fetch ${url} mp4`,
                buttonText: { displayText: "🎬 Download MP4" },
                type: 1,
              },
            ],
            headerType: 4,
          },
          { quoted: m }
        );
        return;
      }

      // 📦 Download
      let buffer, mimeGuess, fileName;
      if (isGeneric) {
        const res = await fetch(url);
        if (!res.ok)
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        buffer = await res.buffer();
        const type = await detectFileType(buffer);
        mimeGuess =
          type?.mime ||
          res.headers.get("content-type") ||
          "application/octet-stream";
        fileName =
          url.split("/").pop().split("?")[0] ||
          `artifact.${mimeGuess.split("/")[1] || "bin"}`;
      } else {
        if (!mediaUrl || !isUrl(mediaUrl)) {
          await conn.sendMessage(m.from, {
            text: `⚠️ The cosmic link returned by APIs was invalid.\nMiara suggests trying another format.`,
          });
          return;
        }

        buffer = await getBuffer(mediaUrl);
        const type = await detectFileType(buffer);
        mimeGuess =
          type?.mime ||
          (format === "mp3" ? "audio/mpeg" : "video/mp4");
        fileName = `${title.replace(/[^\w\s]/gi, "_")}.${format || (mimeGuess.includes("audio") ? "mp3" : "mp4")}`;
      }

      // 🕒 Metadata and emoji theme
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
      const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");

      const emoji =
        mimeGuess.startsWith("audio/")
          ? "🎼" // melody for audio
          : mimeGuess.startsWith("video/")
          ? "🎬" // film slate for video
          : mimeGuess.includes("pdf")
          ? "📜" // scroll for docs
          : mimeGuess.includes("zip") || mimeGuess.includes("rar")
          ? "💠" // crystal for archives
          : "🌌"; // cosmic default

      const caption = `
${emoji} *${title || "Unknown Artifact"}*
━━━━━━━━━━━━━━━
📄 *Type:* ${mimeGuess}
💾 *Size:* ${sizeMB} MB
🕰️ *Fetched:* ${time}
🌷 *${config.BOT_NAME}*
━━━━━━━━━━━━━━━
🌠 _Transmitted across galaxies by Miara._ ✨
`.trim();

      // 💫 Send the right format
      const msg =
        mimeGuess.startsWith("audio/")
          ? {
              audio: buffer,
              mimetype: mimeGuess,
              fileName,
              caption,
              ptt: false,
            }
          : mimeGuess.startsWith("video/")
          ? {
              video: buffer,
              mimetype: mimeGuess,
              fileName,
              caption,
              thumbnail: thumb,
            }
          : {
              document: buffer,
              mimetype: mimeGuess,
              fileName,
              caption,
            };

      await conn.sendMessage(m.from, msg, { quoted: m.message });
      await conn.sendMessage(m.from, {
        react: { text: "💫", key: m.message.key },
      });
    } catch (err) {
      console.error("❌ Fetch error:", err);

      const errMsg =
        err.message.includes("Invalid URL") ||
        err.message.includes("undefined")
          ? "🌑 The portal link was invalid or unreachable."
          : err.name === "AbortError"
          ? "⏰ Connection timeout — star too distant."
          : "💥 Miara couldn’t retrieve that artifact.";

      await conn.sendMessage(m.from, { text: `❌ ${errMsg}` }, { quoted: m.message });
      await conn.sendMessage(m.from, {
        react: { text: "💔", key: m.message.key },
      });
    }
  },
};
