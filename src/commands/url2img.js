/**
 * 🌐 Miara Command: URL to Image — “The Web Seer” (2025)
 * ---------------------------------------------------------
 * Fetches an image from a URL, or captures a screenshot of a full webpage.
 * by MidKnightMantra 🌸 | Optimized for Baileys 7 and headless Puppeteer
 */

import puppeteer from "puppeteer";
import { isUrl, getBuffer } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

export default {
  name: "url2img",
  aliases: ["mirrorback", "getimg", "webshot"],
  description: "Retrieve an image or render a full webpage from a URL 🌌",
  category: "tools",
  usage: ".url2img <image_or_website_url>",

  async execute(conn, m, args) {
    const chat = m.key.remoteJid;
    const input = args.join(" ").trim();

    try {
      await conn.sendMessage(chat, { react: { text: "🪞", key: m.key } });

      // 🌸 Step 1: Validate input
      if (!input || !isUrl(input)) {
        await conn.sendMessage(
          chat,
          {
            text:
              "🌐 Please provide a valid *URL*.\n\nExamples:\n" +
              "• `.url2img https://example.com`\n" +
              "• `.url2img https://telegra.ph/file/xyz.jpg`"
          },
          { quoted: m }
        );
        await conn.sendMessage(chat, { react: { text: "💭", key: m.key } });
        return;
      }

      // Step 2: Determine content type
      const isImageLink = /\.(jpe?g|png|gif|webp|avif)$/i.test(input);
      await conn.sendMessage(chat, { text: "🔮 Reading the link’s essence..." }, { quoted: m });

      // 🧿 Step 3: Direct image fetch
      if (isImageLink) {
        const buffer = await getBuffer(input);
        if (!buffer?.length) throw new Error("Image not accessible or empty buffer.");

        await conn.sendMessage(
          chat,
          {
            image: buffer,
            caption: `🖼️ *Miara’s Reflection Manifested*  
━━━━━━━━━━━━━━━━━━━  
📡 *Source:* ${input}  
💫 “Captured straight from the digital stream.” 🌸`
          },
          { quoted: m }
        );

        await conn.sendMessage(chat, { react: { text: "🌸", key: m.key } });
        return;
      }

      // 🧠 Step 4: Treat as webpage
      await conn.sendMessage(
        chat,
        { text: "🖥️ This seems like a webpage... preparing snapshot 🪄" },
        { quoted: m }
      );

      // 🧩 Step 5: Launch Puppeteer safely
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--no-zygote",
          "--disable-dev-shm-usage"
        ],
        defaultViewport: { width: 1366, height: 768 }
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
      );

      await page.goto(input, { waitUntil: "networkidle2", timeout: 45000 });

      // Wait a moment for lazy-loaded content
      await page.waitForTimeout(1500);

      // 🌗 Step 6: Capture screenshot
      const screenshot = await page.screenshot({ fullPage: true, type: "jpeg", quality: 85 });
      await browser.close();

      // ✨ Step 7: Send result
      await conn.sendMessage(
        chat,
        {
          image: screenshot,
          caption: `🌐 *Miara’s Web Vision*  
━━━━━━━━━━━━━━━━━━━  
👁️ *Captured from:* ${input}  
💫 “She doesn’t just see links — she witnesses the web itself.” 🌸`
        },
        { quoted: m }
      );

      await conn.sendMessage(chat, { react: { text: "👁️", key: m.key } });
      logger.info(`📸 Webpage rendered successfully → ${input}`);
    } catch (err) {
      logger.error(`URL2IMG Error: ${err.message}`, "Webshot");

      const msg = `
💔 *Failed to mirror the digital reflection.*  
━━━━━━━━━━━━━━━  
⚠️ ${err.message || "Unknown cosmic interference."}  
💭 Tip: Try a valid image link or a simpler webpage.
      `.trim();

      await conn.sendMessage(chat, { text: msg }, { quoted: m });
      await conn.sendMessage(chat, { react: { text: "💫", key: m.key } });
    }
  }
};
