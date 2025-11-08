/**
 * 🌸 Miara Helpers (2025 Deluxe Edition – Baileys 7.x Compatible)
 * ---------------------------------------------------------------
 * Core utilities for Miara Framework — stable, modern & resilient.
 * by MidKnightMantra × GPT-5
 */

import fs from "fs/promises";
import path from "path";
import axios from "axios";
import https from "https";
import http from "http";
import os from "os";
import PhoneNumber from "awesome-phonenumber";
import { fileTypeFromBuffer } from "file-type";
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
// 🧠 Simplify Baileys Message (7.x safe)
// ──────────────────────────────
export function smsg(conn, m) {
  try {
    const M = m.messages?.[0] || m; // upsert or proto event
    if (!M?.message) return null;

    const { key, pushName } = M;
    const { id: msgId, remoteJid, participant } = key || {};
    const msg = M.message || {};
    const messageType = Object.keys(msg)[0];
    const content = msg[messageType] || {};
    const contextInfo = content.contextInfo || {};
    const quotedMessage =
      contextInfo?.quotedMessage ||
      msg.extendedTextMessage?.contextInfo?.quotedMessage ||
      null;

    const sender = participant || remoteJid;
    const text =
      msg.conversation ||
      content.caption ||
      content.text ||
      msg.extendedTextMessage?.text ||
      "";

    if (DEBUG_HELPERS)
      safeLog("debug", `Simplified message from ${sender || "unknown"}: "${text.slice(0, 40)}"`);

    return {
      key,
      id: msgId,
      chat: remoteJid,
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
    safeLog("warn", `Error simplifying message object: ${e.message}`, "smsg");
    return null;
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
          Accept:
            "application/pdf,video/*,image/*,audio/*,application/octet-stream,*/*",
          Referer: "https://google.com/"
        },
        httpsAgent: agent,
        httpAgent: agent,
        transitional: { forcedJSONParsing: false, silentJSONParsing: false },
        decompress: true,
        validateStatus: (status) => status >= 200 && status < 400
      });

      if (response.status >= 200 && response.status < 300) {
        if (DEBUG_HELPERS) safeLog("debug", `Fetched buffer from ${url}`);
        return Buffer.from(response.data);
      }
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    } catch (err) {
      safeLog("warn", `Fetch attempt ${attempt} failed for ${url}: ${err.message}`);
      if (attempt > FETCH_MAX_RETRIES) {
        safeLog("error", `All fetch attempts failed for ${url}`);
        throw err;
      }
      await sleep(FETCH_RETRY_DELAY);
    }
  }
}

// ──────────────────────────────
// 📂 File Type Detector (robust)
// ──────────────────────────────
export async function detectFileType(buf) {
  try {
    if (!Buffer.isBuffer(buf) || !buf.length) {
      throw new Error("Invalid or empty buffer");
    }

    let type = await fileTypeFromBuffer(buf);

    // Fallback heuristics for unknown signatures
    if (!type) {
      const header = buf.slice(0, 12).toString("hex");
      if (header.startsWith("474946")) type = { mime: "image/gif", ext: "gif" };
      else if (header.includes("66747970")) type = { mime: "video/mp4", ext: "mp4" };
      else if (header.startsWith("89504e47")) type = { mime: "image/png", ext: "png" };
    }

    return type || { mime: DEFAULT_MIME_TYPE, ext: DEFAULT_FILE_EXTENSION };
  } catch (e) {
    safeLog("error", `File type detection failed: ${e.message}`, "detectFileType");
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
    safeLog("error", `Failed to ensure directory ${dir}: ${e.message}`);
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
    case "android":
      return "📱 Android";
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
      await conn.sendMessage(m.key.remoteJid, { react: { text: emoji, key: m.key } });
    } else {
      safeLog("debug", `Skipped reaction (invalid key): ${emoji}`);
    }
  } catch (err) {
    safeLog("warn", `safeReact error: ${err.message}`);
  }
}

export function safeQuoted(m) {
  try {
    return m?.message && m?.key?.remoteJid ? { quoted: m.message } : {};
  } catch {
    return {};
  }
}

// ──────────────────────────────
// 🪶 Safe Logger Wrapper
// ──────────────────────────────
function safeLog(level, message) {
  try {
    if (logger && typeof logger[level] === "function") logger[level](message);
    else console.log(`[${level.toUpperCase()}] ${message}`);
  } catch {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}
