/**
 * 🌸 Miara Helpers (Stable)
 * Utility functions for media, messages, and fetching.
 */

import fs from "fs/promises";
import path from "path";
import axios from "axios";
import https from "https";
import http from "http";
import PhoneNumber from "awesome-phonenumber";
import * as fileType from "file-type";
// Configuration constants (could be moved to a central config file if needed)
const FETCH_TIMEOUT = 90000; // 90 seconds
const FETCH_RETRY_DELAY = 1500; // 1.5 seconds
const FETCH_MAX_RETRIES = 1;
const AXIOS_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36";
const DEFAULT_MIME_TYPE = "application/octet-stream";
const DEFAULT_FILE_EXTENSION = "bin";

// ───────────────────────────────────────────────
// 🧠 Simplify Baileys Message
// ───────────────────────────────────────────────
/**
 * Processes a raw Baileys message object into a more accessible format.
 * @param {object} conn - The Baileys connection object (currently unused, might be for future expansion).
 * @param {object} m - The raw Baileys message event object.
 * @returns {object} A simplified message object.
 */
export const smsg = (conn, m) => {
  try {
    // Destructure the message object for clarity
    const M = m.messages?.[0] || m; // Handle both upsert event format and direct message object
    const { key, pushName } = M;
    const { id: msgId, remoteJid, participant } = key || {};
    const messageContent = M.message || {};
    const messageType = Object.keys(messageContent)[0];
    const content = messageContent[messageType] || {};
    const contextInfo = content.contextInfo || {};
    const quotedMessage = contextInfo.quotedMessage;

    // Determine sender (group participant or chat JID)
    const sender = participant || remoteJid;

    return {
      key,
      id: msgId,
      from: remoteJid,
      sender,
      isGroup: remoteJid?.endsWith("@g.us") || false,
      pushName: pushName || "",
      text: messageContent.conversation || content.caption || content.text || "",
      mime: content.mimetype || "",
      quoted: quotedMessage,
      message: M, // Include the original message object for flexibility
    };
  } catch (e) {
    console.error("⚠️ Error simplifying message object:", e);
    // Return a minimal object to prevent crashes downstream
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

// ───────────────────────────────────────────────
// 💤 Sleep helper
// ───────────────────────────────────────────────
/**
 * Asynchronously sleeps for a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>} A promise that resolves after the specified time.
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ───────────────────────────────────────────────
// 🌐 Smart Fetcher (Axios + Stream fallback + Retry)
// ───────────────────────────────────────────────
/**
 * Fetches data from a URL, attempting Axios first, then falling back to native streams.
 * Includes retry logic for Axios failures.
 * @param {string} url - The URL to fetch.
 * @param {object} options - Optional configuration (e.g., timeout).
 * @returns {Promise<Buffer>} A promise resolving to the fetched data as a Buffer.
 */
export const getBuffer = async (url, options = {}) => {
  const timeout = options.timeout || FETCH_TIMEOUT;
  const agent = url.startsWith("https://")
    ? new https.Agent({ rejectUnauthorized: false })
    : new http.Agent();

  for (let attempt = 1; attempt <= FETCH_MAX_RETRIES + 1; attempt++) { // +1 for initial try
    try {
      console.log(`Fetching (attempt ${attempt}): ${url}`); // Optional log for debugging
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: "arraybuffer",
        maxRedirects: 5,
        timeout: timeout,
        headers: {
          "User-Agent": AXIOS_USER_AGENT,
          "Accept": "application/pdf,video/*,image/*,audio/*,application/octet-stream,*/*",
          "Referer": "https://google.com/",
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
      console.warn(`⚠️ Axios attempt ${attempt} failed for ${url}:`, err.message);

      if (attempt > FETCH_MAX_RETRIES) { // After all retries, do fallback
        console.log(`Falling back to native stream for ${url}`); // Optional log
        try {
          return await new Promise((resolve, reject) => {
            const lib = url.startsWith("https://") ? https : http;
            const request = lib.get(url, { rejectUnauthorized: false }, (response) => {
              if (response.statusCode !== 200) {
                return reject(new Error(`Stream fetch failed with status code: ${response.statusCode}`));
              }
              const chunks = [];
              response.on("data", (chunk) => chunks.push(chunk));
              response.on("end", () => {
                const buffer = Buffer.concat(chunks);
                console.log(`Native stream fetch successful for ${url}`); // Optional log
                resolve(buffer);
              });
            });

            request.on("error", (error) => {
              console.error("Stream request error:", error);
              reject(error);
            });

            request.setTimeout(timeout, () => {
              console.warn(`Stream fetch timeout (${timeout}ms) for ${url}`);
              request.destroy();
              reject(new Error(`Stream fetch timeout after ${timeout / 1000}s for ${url}`));
            });
          });
        } catch (fallbackErr) {
          console.error(`❌ Native stream fallback failed for ${url}:`, fallbackErr.message);
          throw fallbackErr; // Propagate the error after fallback failure
        }
      }

      if (attempt <= FETCH_MAX_RETRIES) { // Wait before next retry
        console.log(`Retrying Axios in ${FETCH_RETRY_DELAY / 1000} seconds...`);
        await sleep(FETCH_RETRY_DELAY);
      }
    }
  }
};

// ───────────────────────────────────────────────
// 🧩 Twitter/X Media Extractor
// (Requires a 3rd-party API or scraper; fallback safe)
// ───────────────────────────────────────────────
/**
 * Extracts the primary media URL from a Twitter/X status URL.
 * Requires a 3rd-party API endpoint (example API URL might be unstable).
 * @param {string} url - The Twitter/X status URL.
 * @returns {Promise<string|null>} A promise resolving to the media URL or null.
 */
export async function extractTweetMedia(url) {
  try {
    // Corrected regex to capture the tweet ID more robustly
    const match = url.match(/https?:\/\/(?:www\.)?(?:x|twitter)\.com\/[^\/]+\/status\/(\d+)(?:\/[^\/]+)?(?:\?.*)?$/i);
    if (!match) {
      console.log("Input URL does not match Twitter/X status pattern:", url);
      return null;
    }

    const tweetId = match[1];
    console.log(`Extracting media from tweet ID: ${tweetId}`); // Optional log

    // Example API endpoint (replace with a reliable one if this becomes unstable)
    // Be cautious of API limits and terms of service for 3rd-party scrapers
    const apiUrl = `https://api.vxtwitter.com/TweetInfo/${tweetId}`; // Corrected URL format; note: this may not be a real API—replace with actual if needed

    const { data } = await axios.get(apiUrl, { timeout: 20000 });
    if (Array.isArray(data?.media) && data.media.length > 0) {
      // Prefer video if available, otherwise take the first media item
      const video = data.media.find(item => item.type === 'video');
      const mediaUrl = video ? video.url : data.media[0].url;
      console.log(`Extracted media URL: ${mediaUrl}`); // Optional log
      return mediaUrl;
    }
    console.log(`No media found in tweet ${tweetId} response.`);
    return null;
  } catch (err) {
    console.error(`❌ Error extracting tweet media from ${url}:`, err.message);
    // Return null on error to allow graceful handling by the caller
    return null;
  }
}

// ───────────────────────────────────────────────
// 📂 File Type + Metadata
// ───────────────────────────────────────────────
/**
 * Detects the file type (MIME and extension) from a Buffer.
 * @param {Buffer} buf - The file content as a Buffer.
 * @returns {Promise<object>} An object containing {mime, ext}.
 */
export const detectFileType = async (buf) => {
  try {
    const type = await fileType.fromBuffer(buf);
    return type || { mime: DEFAULT_MIME_TYPE, ext: DEFAULT_FILE_EXTENSION };
  } catch (e) {
    console.error("Error detecting file type:", e);
    // Return default type on failure
    return { mime: DEFAULT_MIME_TYPE, ext: DEFAULT_FILE_EXTENSION };
  }
};

// ───────────────────────────────────────────────
// 🔗 URL validator
// ───────────────────────────────────────────────
/**
 * Checks if a given string is a valid URL.
 * @param {string} text - The string to check.
 * @returns {boolean} True if the string is a URL, false otherwise.
 */
export const isUrl = (text) => {
  try {
    // Use the URL constructor for more robust validation
    new URL(text);
    return true;
  } catch {
    // If the constructor throws, it's not a valid URL
    return /^https?:\/\//i.test(text); // Fallback to regex check
  }
};

// ───────────────────────────────────────────────
// 📏 Buffer size (bytes)
// ───────────────────────────────────────────────
/**
 * Gets the size of a Buffer in bytes.
 * @param {Buffer} buf - The Buffer.
 * @returns {number} The size in bytes.
 */
export const getSizeMedia = (buf) => {
  if (!Buffer.isBuffer(buf)) {
    console.error("getSizeMedia: Input is not a Buffer");
    return 0;
  }
  return buf.length; // Buffer.length is the standard way
};

// ───────────────────────────────────────────────
// ☎️ Format WhatsApp number
// ───────────────────────────────────────────────
/**
 * Formats a WhatsApp JID into an international phone number string.
 * @param {string} jid - The WhatsApp JID (e.g., "1234567890@s.whatsapp.net").
 * @returns {string} The formatted phone number (e.g., "+1 234 567 890").
 */
export const formatNumber = (jid) => {
  try {
    // Remove the @s.whatsapp.net suffix and prepend +
    const number = jid.replace("@s.whatsapp.net", "").replace("@g.us", ""); // Handle group JIDs too if needed
    const pn = new PhoneNumber(`+${number}`); // Prepend + and parse without region (assumes international format)
    return pn.getNumber('international') || jid; // Fallback to original if invalid
  } catch (e) {
    console.error("Error formatting number:", jid, e.message);
    // Return the original JID if formatting fails
    return jid;
  }
};

// ───────────────────────────────────────────────
// 📁 Ensure directory exists
// ───────────────────────────────────────────────
/**
 * Ensures a directory exists, creating it recursively if necessary.
 * @param {string} dir - The directory path.
 * @returns {Promise<void>} A promise that resolves when the directory exists.
 */
export async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
    // console.log(`Directory ensured: ${dir}`); // Uncomment if needed for debugging
  } catch (e) {
    console.error(`Error ensuring directory ${dir}:`, e);
    throw e; // Re-throw to let the caller handle it if necessary
  }
}

// ───────────────────────────────────────────────
// ⏱️ Convert ms to HH:MM:SS
// ───────────────────────────────────────────────
/**
 * Converts a duration in milliseconds to a HH:MM:SS string format.
 * @param {number} ms - The duration in milliseconds.
 * @returns {string} The formatted time string.
 */
export const clockString = (ms) => {
  // Ensure input is a number
  if (typeof ms !== 'number' || isNaN(ms)) {
    return '--:--:--';
  }

  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);

  // Use String.padStart for cleaner zero-padding
  return [h, m, s].map(timeUnit => timeUnit.toString().padStart(2, '0')).join(':');
};