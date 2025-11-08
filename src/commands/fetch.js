/**
 * 🌸 Miara Fetch+ — Hybrid Celestial Edition (2025)
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * Universal downloader for YouTube, TikTok, Twitter, Instagram, Reddit, and any media URL.
 * - YouTube handled locally via ytdl-core (no API dependency)
 * - Other platforms use smart multi-API fallback
 * - Direct links fetched natively
 * - Fully async, graceful error handling
 */

import moment from "moment-timezone";
import fetch from "node-fetch";
import ytdl from "ytdl-core";
import CONFIG from "../config.js";
import { getBuffer, detectFileType, isUrl, safeReact } from "../utils/helpers.js";

export default {
  name: "fetch",
  description: "Retrieve or convert media from any link 🌸",
  category: "utility",
  usage: ".fetch <url> [mp3/mp4]",

  async execute(conn, m, args) {
    const prefix = CONFIG.PREFIX || ".";
    const url = args[0];
    const requestedFormat = args[1]?.toLowerCase();

    if (!url || !isUrl(url)) {
      await conn.sendMessage(m.chat, {
        text: `🌍 *Usage:* ${prefix}fetch <url> [mp3/mp4]\n\n🪷 Example:\n${prefix}fetch https://youtu.be/dQw4w9WgXcQ mp3`
      });
      return;
    }

    await conn.sendMessage(
      m.chat,
      { text: `🌠 Reaching across the digital cosmos...\n🔗 ${url}` },
      { quoted: m }
    );

    let buffer = null,
      mime = null,
      title = "Unnamed Artifact",
      fileName = "artifact.bin",
      isFallback = false;

    try {
      const isYouTube = /youtu\.?be/.test(url);
      const isTikTok = /tiktok\.com/.test(url);
      const isInstagram = /instagram\.com/.test(url);
      const isTwitter = /twitter\.com|x\.com/.test(url);
      const isReddit = /reddit\.com/.test(url);
      const isGeneric = !(isYouTube || isTikTok || isInstagram || isTwitter || isReddit);

      // ───────────────────────────────────────────────
      // 🎬 YouTube (Local Fetch with ytdl-core)
      // ───────────────────────────────────────────────
      if (isYouTube) {
        try {
          const info = await ytdl.getInfo(url);
          title = info.videoDetails.title || "YouTube Video";

          const format =
            requestedFormat === "mp4"
              ? ytdl.chooseFormat(info.formats, { quality: "highestvideo" })
              : ytdl.chooseFormat(info.formats, { quality: "highestaudio" });

          const streamUrl = format.url;
          const arr = await (await fetch(streamUrl)).arrayBuffer();
          buffer = Buffer.from(arr);

          const type = await detectFileType(buffer);
          mime =
            type?.mime ||
            (requestedFormat === "mp3" ? "audio/mpeg" : "video/mp4");
          const ext = requestedFormat || type?.ext || "mp4";
          const safeTitle = title.replace(/[^\w\s-]/g, "_").substring(0, 40);
          fileName = `${safeTitle}.${ext}`;

          await safeReact(conn, m, "🎵");
        } catch (err) {
          console.warn("⚠️ Local YouTube fetch failed:", err.message);
        }
      }

      // ───────────────────────────────────────────────
      // 🪄 TikTok / Instagram / Twitter / Reddit (API Fallbacks)
      // ───────────────────────────────────────────────
      if (
        (!buffer || buffer.length < 1024) &&
        (isTikTok || isInstagram || isTwitter || isReddit)
      ) {
        isFallback = true;
        const fallbackAPIs = [
          // Universal APIs with overlapping coverage
          `https://api.neoxr.eu/api/ytdl?url=${encodeURIComponent(url)}`,
          `https://api.ryzendesu.vip/api/download/yta2?url=${encodeURIComponent(url)}`,
          `https://api.ryzendesu.vip/api/download/ytv2?url=${encodeURIComponent(url)}`,
          `https://api.betabotz.eu.org/api/download/tiktok?apikey=beta&url=${encodeURIComponent(url)}`,
          `https://api.betabotz.eu.org/api/download/twitter?apikey=beta&url=${encodeURIComponent(url)}`,
          `https://api.betabotz.eu.org/api/download/instagram?apikey=beta&url=${encodeURIComponent(url)}`,
          `https://api.zahwazein.xyz/downloader/twitter?apikey=zenzkey&url=${encodeURIComponent(url)}`,
          `https://api.zahwazein.xyz/downloader/tiktok?apikey=zenzkey&url=${encodeURIComponent(url)}`,
          `https://api.zahwazein.xyz/downloader/instagram?apikey=zenzkey&url=${encodeURIComponent(url)}`
        ];

        for (const api of fallbackAPIs) {
          try {
            const res = await fetch(api, { timeout: 10000 });
            const text = await res.text();
            if (text.startsWith("<!DOCTYPE")) continue;

            const data = JSON.parse(text);
            title =
              data.title ||
              data.result?.title ||
              data.data?.title ||
              "Fetched Artifact";

            const mediaUrl =
              data.url ||
              data.result?.url ||
              data.result?.video ||
              data.result?.audio ||
              data.data?.url ||
              data.data?.video ||
              data.data?.audio;

            if (mediaUrl && isUrl(mediaUrl)) {
              buffer = await getBuffer(mediaUrl);
              const type = await detectFileType(buffer);
              mime = type?.mime || "video/mp4";
              const ext = type?.ext || "mp4";
              const safeTitle = title
                .replace(/[^\w\s-]/g, "_")
                .substring(0, 40);
              fileName = `${safeTitle}.${ext}`;
              break;
            }
          } catch (err) {
            console.warn(`⚠️ Fallback ${api.split("/")[2]} failed: ${err.message}`);
            continue;
          }
        }
      }

      // ───────────────────────────────────────────────
      // 🧩 Direct fetch for generic URLs
      // ───────────────────────────────────────────────
      if (!buffer && isGeneric) {
        try {
          const res = await fetch(url, { timeout: 15000 });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const arr = await res.arrayBuffer();
          buffer = Buffer.from(arr);

          const type = await detectFileType(buffer);
          mime =
            type?.mime ||
            res.headers.get("content-type") ||
            "application/octet-stream";
          const ext = type?.ext || "bin";
          fileName = url.split("/").pop().split("?")[0] || `artifact.${ext}`;
        } catch (err) {
          console.warn("⚠️ Direct fetch failed:", err.message);
        }
      }

      // ───────────────────────────────────────────────
      // 🛑 Validation
      // ───────────────────────────────────────────────
      if (!buffer || buffer.length < 1024) {
        await conn.sendMessage(
          m.chat,
          { text: "🌑 I couldn’t retrieve anything from that link — no portal responded." },
          { quoted: m }
        );
        await safeReact(conn, m, "💔");
        return;
      }

      // ───────────────────────────────────────────────
      // 🕒 Metadata + Presentation
      // ───────────────────────────────────────────────
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
      const time = moment()
        .tz(CONFIG.TIMEZONE || "Africa/Nairobi")
        .format("HH:mm:ss");

      const emoji = mime.startsWith("audio/")
        ? "🎼"
        : mime.startsWith("video/")
        ? "🎬"
        : mime.includes("pdf")
        ? "📜"
        : mime.includes("zip") || mime.includes("rar")
        ? "💠"
        : "🌌";

      const caption = `
${emoji} *${title}*
━━━━━━━━━━━━━━━
📄 *File:* ${fileName}
💾 *Size:* ${sizeMB} MB
📦 *Type:* ${mime}
🕰️ *Fetched:* ${time}
${isFallback ? "🌐 *Mode:* API Fallback" : isYouTube ? "⚡ *Mode:* Local YouTube Fetch" : "🔗 *Mode:* Direct"}
━━━━━━━━━━━━━━━
🌸 _Delivered through starlight by Miara._
      `.trim();

      // ───────────────────────────────────────────────
      // 💫 Delivery
      // ───────────────────────────────────────────────
      const msg =
        mime.startsWith("audio/")
          ? { audio: buffer, mimetype: mime, fileName, caption, ptt: false }
          : mime.startsWith("video/")
          ? { video: buffer, mimetype: mime, fileName, caption }
          : { document: buffer, mimetype: mime, fileName, caption };

      await conn.sendMessage(m.chat, msg, { quoted: m });
      await safeReact(conn, m, "💫");
    } catch (err) {
      console.error("❌ Fetch error:", err);
      const message = /timeout/i.test(err.message)
        ? "⏰ Timeout — connection faded among the stars."
        : /invalid|undefined|ENOTFOUND|ECONNRESET/i.test(err.message)
        ? "🌑 That link was unreachable or invalid."
        : "💥 Something went wrong retrieving the artifact.";

      await conn.sendMessage(m.chat, { text: `❌ ${message}` }, { quoted: m });
      await safeReact(conn, m, "💔");
    }
  }
};
