/**
 * 🌸 Miara Helpers (2025)
 * Centralized utility collection for Miara Framework.
 * ----------------------------------------------------
 * by MidKnightMantra × GPT-5
 */

import fs from "fs/promises";
import path from "path";
import axios from "axios";
import https from "https";
import http from "http";
import os from "os";
import PhoneNumber from "awesome-phonenumber";
import * as fileType from "file-type";
import { logger } from "./logger.js";

// 🌐 Config constants
const FETCH_TIMEOUT = 90000;
const FETCH_RETRY_DELAY = 1500;
const FETCH_MAX_RETRIES = 1;
const AXIOS_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36";
const DEFAULT_MIME_TYPE = "application/octet-stream";
const DEFAULT_FILE_EXTENSION = "bin";

const DEBUG_HELPERS = process.env.DEBUG_HELPERS === "true";

// ──────────────────────────────
// 🧠 Simplify Baileys Message
// ──────────────────────────────
export function smsg(conn, m) {
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
    const text = messageContent.conversation || content.caption || content.text || "";

    if (DEBUG_HELPERS)
      logger.debug(`Simplified message from ${sender || "unknown"}: "${text.slice(0, 40)}"`);

    return {
      key,
      id: msgId,
      from: remoteJid,
      sender,
      isGroup: remoteJid?.endsWith("@g.us") || false,
      pushName: pushName || "",
      text,
      mime: content.mimetype || "",
      quoted: quotedMessage,
      message: M
    };
  } catch (e) {
    logger.warn(`Error simplifying message object: ${e.message}`, "smsg");
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
      message: m
    };
  }
}

// ──────────────────────────────
// 💤 Sleep Helper
// ──────────────────────────────
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ──────────────────────────────
// 🌐 Smart Fetcher (Axios + Stream Fallback)
// ──────────────────────────────
export async function getBuffer(url, options = {}) {
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
          "Accept": "application/pdf,video/*,image/*,audio/*,application/octet-stream,*/*",
          "Referer": "https://google.com/"
        },
        httpsAgent: agent,
        httpAgent: agent,
        validateStatus: (status) => status >= 200 && status < 400
      });

      if (response.status >= 200 && response.status < 300) {
        if (DEBUG_HELPERS) logger.debug(`Fetched buffer from ${url}`);
        return Buffer.from(response.data);
      }
      throw new Error(`HTTP Error ${response.status} ${response.statusText}`);
    } catch (err) {
      logger.warn(`Fetch attempt ${attempt} failed for ${url}: ${err.message}`);
      if (attempt > FETCH_MAX_RETRIES) {
        logger.error(`All fetch attempts failed for ${url}`);
        throw err;
      }
      await sleep(FETCH_RETRY_DELAY);
    }
  }
}

// ──────────────────────────────
// 📂 File Type Detector
// ──────────────────────────────
export async function detectFileType(buf) {
  try {
    const type = await fileType.fromBuffer(buf);
    return type || { mime: DEFAULT_MIME_TYPE, ext: DEFAULT_FILE_EXTENSION };
  } catch (e) {
    logger.error(`File type detection failed: ${e.message}`);
    return { mime: DEFAULT_MIME_TYPE, ext: DEFAULT_FILE_EXTENSION };
  }
}

// ──────────────────────────────
// 🔗 URL Validator
// ──────────────────────────────
export function isUrl(text) {
  try {
    new URL(text);
    return true;
  } catch {
    return /^https?:\/\//i.test(text);
  }
}

// ──────────────────────────────
// 📏 Buffer Size Helper
// ──────────────────────────────
export const getSizeMedia = (buf) => (Buffer.isBuffer(buf) ? buf.length : 0);

// ──────────────────────────────
// ☎️ WhatsApp Number Formatter
// ──────────────────────────────
export function formatNumber(jid) {
  try {
    const number = jid.replace("@s.whatsapp.net", "").replace("@g.us", "");
    const pn = new PhoneNumber(`+${number}`);
    return pn.getNumber("international") || jid;
  } catch {
    return jid;
  }
}

// ──────────────────────────────
// 📁 Ensure Directory Exists
// ──────────────────────────────
export async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    logger.error(`Failed to ensure directory ${dir}: ${e.message}`);
  }
}

// ──────────────────────────────
// ⏱️ Milliseconds → HH:MM:SS
// ──────────────────────────────
export function clockString(ms) {
  if (typeof ms !== "number" || isNaN(ms)) return "--:--:--";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map((t) => t.toString().padStart(2, "0")).join(":");
}

// ──────────────────────────────
// 💻 Platform Detector
// ──────────────────────────────
export function getPlatform() {
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
}

// ──────────────────────────────
// 🪷 Safe React & Quote Helpers
// ──────────────────────────────
export async function safeReact(conn, m, emoji) {
  try {
    if (m?.key?.remoteJid && m?.key?.id) {
      await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    } else {
      logger.debug(`Skipped reaction (invalid key): ${emoji}`);
    }
  } catch (err) {
    logger.warn(`safeReact error: ${err.message}`);
  }
}

export function safeQuoted(m) {
  try {
    return m?.message && m?.key?.remoteJid ? { quoted: m.message } : {};
  } catch {
    return {};
  }
}
