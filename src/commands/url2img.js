/**
 * 🌐 Miara Command: URL to Image — “The Web Seer” (2025)
 * ---------------------------------------------------------
 * Fetches an image from a URL, or captures a screenshot of a full webpage.
 * by MidKnightMantra 🌸
 */

import axios from "axios";
import puppeteer from "puppeteer";
import { isUrl, getBuffer } from "../utils/helpers.js";

export default {
  name: "url2img",
  aliases: ["mirrorback", "getimg", "webshot"],
  description: "Retrieve an image or render a full webpage from a URL 🌌",
  category: "tools",
  usage: ".url2img <image_or_website_url>",

  async execute(conn, m, args) {
    const from = m.from;
    const key = m.key;
    const input = args.join(" ").trim();

    try {
      await conn.sendMessage(from, { react: { text: "🪞", key } });

      // 🌸 Step 1: Validate input
      if (!input || !isUrl(input)) {
        await conn.sendMessage(
          from,
          {
            text: "🌐 Please provide a valid *URL*.\n\nExamples:\n• .url2img https://example.com\n• .url2img https://telegra.ph/file/xyz.jpg",
          },
          { quoted: m }
        );
        await conn.sendMessage(from, { react: { text: "💭", key } });
        return;
      }

      // Step 2: Determine content type (basic heuristic)
      const isImageLink = /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(input);

      await conn.sendMessage(from, { text: "🔮 Reading the link’s essence..." }, { quoted: m });

      // 🧿 Step 3: Handle image URLs directly
      if (isImageLink) {
        const buffer = await getBuffer(input);
        if (!buffer || buffer.length === 0) throw new Error("Image not accessible or empty buffer.");
        await conn.sendMessage(
          from,
          {
            image: buffer,
            caption: `
🖼️ *Miara’s Reflection Manifested*  
━━━━━━━━━━━━━━━━━━━  
📡 *Source:* ${input}  
💫 “Captured straight from the digital stream.” 🌸`,
          },
          { quoted: m.message }
        );
        await conn.sendMessage(from, { react: { text: "🌸", key } });
        return;
      }

      // 🧠 Step 4: If not an image → treat as webpage
      await conn.sendMessage(from, { text: "🖥️ This seems like a webpage... preparing snapshot 🪄" }, { quoted: m });

      const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: "new",
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });
      await page.goto(input, { waitUntil: "networkidle2", timeout: 30000 });

      // 🪩 Step 5: Take screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      await browser.close();

      // ✨ Step 6: Send screenshot as image
      await conn.sendMessage(
        from,
        {
          image: screenshot,
          caption: `
🌐 *Miara’s Web Vision*  
━━━━━━━━━━━━━━━━━━━  
👁️ *Captured from:* ${input}  
💫 “She doesn’t just see links — she witnesses the web itself.” 🌸`,
        },
        { quoted: m.message }
      );

      await conn.sendMessage(from, { react: { text: "👁️", key } });
      console.log(`📸 Webpage rendered successfully → ${input}`);

    } catch (err) {
      console.error("❌ URL2IMG Error:", err.message);
      await conn.sendMessage(
        from,
        {
          text: `
💔 *Failed to mirror the digital reflection.*  
━━━━━━━━━━━━━━━  
⚠️ ${err.message || "Unknown cosmic interference."}  
Try again with a valid image or webpage link.`,
        },
        { quoted: m.message }
      );
      await conn.sendMessage(from, { react: { text: "💫", key } });
    }
  },
};
