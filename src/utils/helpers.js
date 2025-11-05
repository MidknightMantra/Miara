/**
 * 🌸 Miara Helpers (Stable)
 * Utility functions for media, messages, and fetching.
 */

import fs from "fs";
import path from "path";
import axios from "axios";
import https from "https";
import http from "http";
import PhoneNumber from "awesome-phonenumber";
import * as fileType from "file-type";

// ───────────────────────────────────────────────
// 🧠 Simplify Baileys Message
// ───────────────────────────────────────────────
export const smsg = (conn, m) => {
  try {
    const M = m.messages ? m.messages[0] : m;
    const msg = M.message || {};
    const messageType = Object.keys(msg)[0];
    const content = msg[messageType] || {};
    const quoted =
      content.contextInfo && content.contextInfo.quotedMessage
        ? content.contextInfo.quotedMessage
        : null;

    return {
      key: M.key,
      id: M.key.id,
      from: M.key.remoteJid,
      sender: M.key.participant || M.key.remoteJid,
      isGroup: M.key.remoteJid.endsWith("@g.us"),
      pushName: M.pushName || "",
      text: msg.conversation || content.caption || content.text || "",
      mime: content.mimetype || "",
      quoted,
      message: M,
    };
  } catch (e) {
    console.error("⚠️ smsg error:", e);
    return {};
  }
};

// ───────────────────────────────────────────────
// 💤 Sleep helper
// ───────────────────────────────────────────────
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────────────────────────────
// 🌐 Smart Fetcher (Axios + Stream fallback + Retry)
// ───────────────────────────────────────────────
export const getBuffer = async (url, options = {}) => {
  const timeout = options.timeout || 90000; // 90s
  const agent = url.startsWith("https://")
    ? new https.Agent({ rejectUnauthorized: false })
    : new http.Agent();

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        maxRedirects: 5,
        timeout,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
          Accept:
            "application/pdf,video/*,image/*,audio/*,application/octet-stream,*/*",
          Referer: "https://google.com",
        },
        httpsAgent: agent,
        httpAgent: agent,
        validateStatus: (status) => status >= 200 && status < 400,
      });

      return Buffer.from(response.data);
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${err.message}`);

      if (attempt === 2) {
        // Fallback to native stream fetch
        return await new Promise((resolve, reject) => {
          const lib = url.startsWith("https") ? https : http;
          const req = lib.get(url, { rejectUnauthorized: false }, (res) => {
            if (res.statusCode !== 200) {
              return reject(new Error(`Status Code: ${res.statusCode}`));
            }
            const chunks = [];
            res.on("data", (chunk) => chunks.push(chunk));
            res.on("end", () => resolve(Buffer.concat(chunks)));
          });
          req.on("error", reject);
          req.setTimeout(timeout, () => {
            req.destroy();
            reject(new Error(`Timeout after ${timeout / 1000}s`));
          });
        });
      }
      await sleep(1500); // brief retry delay
    }
  }
};

// ───────────────────────────────────────────────
// 🧩 Twitter/X Media Extractor
// (Requires a 3rd-party API or scraper; fallback safe)
// ───────────────────────────────────────────────
export async function extractTweetMedia(url) {
  try {
    const match = url.match(
      /https?:\/\/(?:x|twitter)\.com\/[^\/]+\/status\/(\d+)/i
    );
    if (!match) return null;

    // Use your preferred scraping API (example: twdown, tweetpik, etc.)
    const apiUrl = `https://api.vxtwitter.com/TweetInfo/${match[1]}`;
    const { data } = await axios.get(apiUrl, { timeout: 20000 });
    if (data?.mediaUrls?.length) {
      // choose first media (image/video)
      return data.mediaUrls[0];
    }
    return null;
  } catch (err) {
    console.error("❌ extractTweetMedia error:", err.message);
    return null;
  }
}

// ───────────────────────────────────────────────
// 📂 File Type + Metadata
// ───────────────────────────────────────────────
export const detectFileType = async (buf) => {
  const type = await fileType.fileTypeFromBuffer(buf);
  return type || { mime: "application/octet-stream", ext: "bin" };
};

// ───────────────────────────────────────────────
// 🔗 URL validator
// ───────────────────────────────────────────────
export const isUrl = (text) => /^https?:\/\//i.test(text);

// ───────────────────────────────────────────────
// 📏 Buffer size (bytes)
// ───────────────────────────────────────────────
export const getSizeMedia = (buf) => Buffer.byteLength(buf);

// ───────────────────────────────────────────────
// ☎️ Format WhatsApp number
// ───────────────────────────────────────────────
export const formatNumber = (jid) => {
  try {
    return new PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
      "international"
    );
  } catch {
    return jid;
  }
};

// ───────────────────────────────────────────────
// 📁 Ensure directory exists
// ───────────────────────────────────────────────
export async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

// ───────────────────────────────────────────────
// ⏱️ Convert ms to HH:MM:SS
// ───────────────────────────────────────────────
export const clockString = (ms) => {
  const h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? "--" : Math.floor((ms / 60000) % 60);
  const s = isNaN(ms) ? "--" : Math.floor((ms / 1000) % 60);
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
};
