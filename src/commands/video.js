/**
 * 🎬 Miara Command: Video Downloader (Ephemeral Fix 2025)
 * ------------------------------------------------------
 * Downloads YouTube video → sends as WhatsApp document.
 */

import yts from "yt-search";
import fetch from "node-fetch";
import { logger } from "../utils/logger.js";
import { downloadFromYouTube } from "../lib/downloaderEngine.js";

export default {
  name: "video",
  aliases: ["ytmp4", "vid", "movie"],
  description: "Stream and send YouTube video 🎥",
  category: "media",
  usage: ".video <title or YouTube URL>",

  async execute(conn, m, args) {
    const from = m.key.remoteJid;
    const query = args.join(" ").trim();

    if (!query) {
      await conn.sendMessage(
        from,
        {
          text: "🎥 Usage:\n.video <title or URL>\nExample: `.video The Weeknd Blinding Lights`"
        },
        { quoted: m }
      );
      return;
    }

    try {
      await conn.sendMessage(from, { react: { text: "📹", key: m.key } });

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
      const author = videoInfo.author?.name || "Unknown Channel";
      const duration = videoInfo.timestamp || "Unknown";
      const views = videoInfo.views ? videoInfo.views.toLocaleString() : "—";
      const upload = videoInfo.ago || "recently";
      const thumbnail = videoInfo.thumbnail;

      logger.info(`🎬 Streaming: ${title}`, "Video");

      const { buffer, engine } = await downloadFromYouTube(videoUrl, "video");
      const videoBuffer = Buffer.isBuffer(buffer)
        ? buffer
        : Buffer.from(buffer);

      let thumbBuffer = null;
      try {
        const thumbRes = await fetch(thumbnail);
        thumbBuffer = Buffer.from(await thumbRes.arrayBuffer());
      } catch {
        logger.warn("Thumbnail fetch failed, skipping...", "Video");
      }

      const caption = `
💜 *${title}*
👤 ${author}
⏱ ${duration}
👁 ${views} views
🗓 ${upload}
⚙ Engine: ${engine}
`.trim();

      await conn.sendMessage(
        from,
        {
          document: videoBuffer,
          mimetype: "video/mp4",
          fileName: `${title}.mp4`,
          caption,
          jpegThumbnail: thumbBuffer
        },
        { quoted: m }
      );

      await conn.sendMessage(from, { react: { text: "🎞️", key: m.key } });
      logger.info(`🎞️ Sent '${title}' successfully.`, "Video");
    } catch (err) {
      logger.error(`Video error: ${err.message}`, "Video");
      await conn.sendMessage(
        from,
        { text: `❌ *Video download failed:* ${err.message}` },
        { quoted: m }
      );
      await conn.sendMessage(from, { react: { text: "💔", key: m.key } });
    }
  }
};
