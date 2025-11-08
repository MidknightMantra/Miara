/**
 * 🎧 Miara Command: Music Downloader (Ephemeral Fix 2025)
 * ------------------------------------------------------
 * Downloads via yt-dlp and sends directly — now ensures
 * WhatsApp-compatible buffer & mimetype.
 */

import yts from "yt-search";
import fetch from "node-fetch";
import { logger } from "../utils/logger.js";
import { downloadFromYouTube } from "../lib/downloaderEngine.js";

export default {
  name: "music",
  aliases: ["song", "ytmp3", "play"],
  description: "Stream and send YouTube music 🎶",
  category: "media",
  usage: ".music <song name or YouTube URL>",

  async execute(conn, m, args) {
    const from = m.key.remoteJid;
    const query = args.join(" ").trim();

    if (!query) {
      await conn.sendMessage(
        from,
        {
          text: "🎧 Usage:\n.music <title or YouTube URL>\nExample: `.music The Weeknd Blinding Lights`"
        },
        { quoted: m }
      );
      return;
    }

    try {
      await conn.sendMessage(from, { react: { text: "🔎", key: m.key } });

      // 🔍 Resolve YouTube search
      let videoUrl = query;
      let videoInfo = {};

      if (!/^https?:\/\//i.test(query)) {
        const search = await yts(query);
        if (!search.videos.length) throw new Error("No results found.");
        videoInfo = search.videos[0];
        videoUrl = videoInfo.url;
      } else {
        const search = await yts(videoUrl);
        videoInfo = search.videos[0] || {};
      }

      const title = videoInfo.title || "Unknown Title";
      const author = videoInfo.author?.name || "Unknown Artist";
      const duration = videoInfo.timestamp || "Unknown";
      const views = videoInfo.views ? videoInfo.views.toLocaleString() : "—";
      const upload = videoInfo.ago || "recently";
      const thumbnail = videoInfo.thumbnail;

      logger.info(`🎶 Streaming: ${title}`, "Music");

      // 🎧 Download audio as pure Buffer
      const { buffer, engine } = await downloadFromYouTube(videoUrl, "audio");

      // 🩵 Normalize to Buffer
      const audioBuffer = Buffer.isBuffer(buffer)
        ? buffer
        : Buffer.from(buffer);

      // 🖼 Thumbnail (optional)
      let thumbBuffer = null;
      try {
        const thumbRes = await fetch(thumbnail);
        thumbBuffer = Buffer.from(await thumbRes.arrayBuffer());
      } catch {
        logger.warn("Thumbnail fetch failed, skipping...", "Music");
      }

      // 💬 Caption
      const caption = `
💜 *${title}*
👤 ${author}
⏱ ${duration}
👁 ${views} views
🗓 ${upload}
⚙ Engine: ${engine}
`.trim();

      // 🎵 Send audio as WhatsApp document (reliable method)
      await conn.sendMessage(
        from,
        {
          document: audioBuffer,
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          caption,
          jpegThumbnail: thumbBuffer
        },
        { quoted: m }
      );

      await conn.sendMessage(from, { react: { text: "🎵", key: m.key } });
      logger.info(`🎧 Sent '${title}' successfully.`, "Music");
    } catch (err) {
      logger.error(`Music error: ${err.message}`, "Music");
      await conn.sendMessage(
        from,
        {
          text: `⚠️ *Download failed:* ${err.message}\n💡 Try another song or shorter query.`
        },
        { quoted: m }
      );
      await conn.sendMessage(from, { react: { text: "💔", key: m.key } });
    }
  }
};
