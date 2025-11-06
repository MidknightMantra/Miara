/**
 * 🌸 Miara Helpers (2025)
 * Centralized utility collection for Miara Framework.
 * -----------------------------------------------
 * by MidKnightMantra x GPT-5
 */

import fs from "fs/promises";
import path from "path";
import axios from "axios";
import https from "https";
import http from "http";
import os from "os";
import PhoneNumber from "awesome-phonenumber";
import * as fileType from "file-type";

// 🌐 Constants
const FETCH_TIMEOUT = 90000;
const FETCH_RETRY_DELAY = 1500;
const FETCH_MAX_RETRIES = 1;
const AXIOS_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36";
const DEFAULT_MIME_TYPE = "application/octet-stream";
const DEFAULT_FILE_EXTENSION = "bin";

// ──────────────────────────────
// 🧠 Simplify Baileys Message
// ──────────────────────────────
export const smsg = (conn, m) => {
  try {
    const M = m.messages?.[0] || m;
    const { key, pushName } = M;
    const { id: msgId, remoteJid, participant } = key || {};
    const messageContent = M.message || {};
    const messageType = Object.keys(messageContent)[0];
    const content = messageContent[messageType] || {};
    const contextInfo = content.contextInfo || {};
    const quotedMessage = contextInfo.quotedMessage;

    const sender = participant || remoteJid;

    return {
      key,
      id: msgId,
      from: remoteJid,
      sender,
      isGroup: remoteJid?.endsWith("@g.us") || false,
      pushName: pushName || "",
      text:
        messageContent.conversation ||
        content.caption ||
        content.text ||
        "",
      mime: content.mimetype || "",
      quoted: quotedMessage,
      message: M,
    };
  } catch (e) {
    console.error("⚠️ Error simplifying message object:", e);
    return {
      key: {},
      id: "",
      from: "",
      sender: "",
      isGroup: false,
      pushName: "",
      text: "",
      mime: "",
      quoted: null,
      message: m,
    };
  }
};

// ──────────────────────────────
// 💤 Sleep Helper
// ──────────────────────────────
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ──────────────────────────────
// 🌐 Smart Fetcher (Axios + Stream Fallback)
// ──────────────────────────────
export const getBuffer = async (url, options = {}) => {
  const timeout = options.timeout || FETCH_TIMEOUT;
  const agent = url.startsWith("https://")
    ? new https.Agent({ rejectUnauthorized: false })
    : new http.Agent();

  for (let attempt = 1; attempt <= FETCH_MAX_RETRIES + 1; attempt++) {
    try {
      const response = await axios({
        method: "GET",
        url,
        responseType: "arraybuffer",
        maxRedirects: 5,
        timeout,
        headers: {
          "User-Agent": AXIOS_USER_AGENT,
          Accept:
            "application/pdf,video/*,image/*,audio/*,application/octet-stream,*/*",
          Referer: "https://google.com/",
        },
        httpsAgent: agent,
        httpAgent: agent,
        validateStatus: (status) => status >= 200 && status < 400,
      });
      if (response.status >= 200 && response.status < 300) {
        return Buffer.from(response.data);
      } else {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.warn(`⚠️ Fetch attempt ${attempt} failed for ${url}:`, err.message);
      if (attempt > FETCH_MAX_RETRIES) {
        console.error(`❌ All fetch attempts failed for ${url}`);
        throw err;
      }
      await sleep(FETCH_RETRY_DELAY);
    }
  }
};

// ──────────────────────────────
// 📂 File Type Detector
// ──────────────────────────────
export const detectFileType = async (buf) => {
  try {
    const type = await fileType.fromBuffer(buf);
    return type || { mime: DEFAULT_MIME_TYPE, ext: DEFAULT_FILE_EXTENSION };
  } catch (e) {
    console.error("Error detecting file type:", e);
    return { mime: DEFAULT_MIME_TYPE, ext: DEFAULT_FILE_EXTENSION };
  }
};

// ──────────────────────────────
// 🔗 URL Validator
// ──────────────────────────────
export const isUrl = (text) => {
  try {
    new URL(text);
    return true;
  } catch {
    return /^https?:\/\//i.test(text);
  }
};

// ──────────────────────────────
// 📏 Buffer Size Helper
// ──────────────────────────────
export const getSizeMedia = (buf) =>
  Buffer.isBuffer(buf) ? buf.length : 0;

// ──────────────────────────────
// ☎️ WhatsApp Number Formatter
// ──────────────────────────────
export const formatNumber = (jid) => {
  try {
    const number = jid.replace("@s.whatsapp.net", "").replace("@g.us", "");
    const pn = new PhoneNumber(`+${number}`);
    return pn.getNumber("international") || jid;
  } catch {
    return jid;
  }
};

// ──────────────────────────────
// 📁 Ensure Directory Exists
// ──────────────────────────────
export async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    console.error(`Error ensuring directory ${dir}:`, e);
  }
}

// ──────────────────────────────
// ⏱️ Milliseconds → HH:MM:SS
// ──────────────────────────────
export const clockString = (ms) => {
  if (typeof ms !== "number" || isNaN(ms)) return "--:--:--";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map((t) => t.toString().padStart(2, "0")).join(":");
};

// ──────────────────────────────
// 💻 Platform Detector
// ──────────────────────────────
export const getPlatform = () => {
  const platform = os.platform();
  switch (platform) {
    case "win32":
      return "🪟 Windows";
    case "linux":
      return "🐧 Linux";
    case "darwin":
      return "🍎 macOS";
    default:
      return platform.toUpperCase();
  }
};

// ──────────────────────────────
// 🪷 Safe React & Safe Quote Helpers
// (Prevents Baileys crash when key is null)
// ──────────────────────────────

/**
 * React safely to a message without crashing Baileys if key is null.
 */
export async function safeReact(conn, m, emoji) {
  try {
    if (m?.key?.remoteJid && m?.key?.id) {
      await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    } else {
      console.log(`⚙️ Skipped reaction (invalid key): ${emoji}`);
    }
  } catch (err) {
    console.warn(`⚠️ safeReact error: ${err.message}`);
  }
}

/**
 * Wrap message quoting safely to avoid remoteJid null errors.
 */
export function safeQuoted(m) {
  try {
    return m?.message && m?.key?.remoteJid ? { quoted: m.message } : {};
  } catch {
    return {};
  }
}
