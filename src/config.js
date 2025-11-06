/**
 * 🌸 Miara 🌸
 * by MidKnightMantra — 2025
 */

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ─────────────────────────────────────────────
// 🧠 Utility Parsers
// ─────────────────────────────────────────────
function parseArrayEnv(envVar) {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i.length > 0);
}

function parseBooleanEnv(envVar, defaultValue = false) {
  if (envVar === undefined || envVar === null) return defaultValue;
  const val = envVar.toLowerCase();
  return ["true", "1", "yes", "on"].includes(val);
}

// ─────────────────────────────────────────────
// 🌸 Main Config Object
// ─────────────────────────────────────────────
export const config = {
  // Bot Identity
  BOT_NAME: process.env.BOT_NAME || "Miara Bot 🌸",
  BIO: process.env.BIO || "🌸 M I A R A 🌸",

  // Owner Information
  OWNER_NAME: process.env.OWNER_NAME || "MidKnightMantra",
  OWNER_NUMBER: parseArrayEnv(process.env.OWNER_NUMBER),
  DEFAULT_OWNER_JID:
    parseArrayEnv(process.env.OWNER_NUMBER)[0] || "2547XXXXXXX@s.whatsapp.net",

  // Core Behaviour
  PREFIX: process.env.PREFIX || ".",
  MODE: parseBooleanEnv(process.env.PRIVATE_MODE, false) ? "private" : "public",
  LANGUAGE: process.env.LANGUAGE || "en",
  REGION: process.env.REGION || "Unknown",
  TIMEZONE: process.env.TIMEZONE || "Africa/Nairobi",

  // Boot Message System
  BOOT_MESSAGE: parseBooleanEnv(process.env.BOOT_MESSAGE, true),
  BOOT_TARGET: process.env.BOOT_TARGET || process.env.OWNER_NUMBER,
  SHOW_CONSOLE_REPORT: parseBooleanEnv(process.env.SHOW_CONSOLE_REPORT, true),

  // Sticker Defaults
  STICKER_PACK_NAME: process.env.STICKER_PACK_NAME || "Miara Pack",
  STICKER_AUTHOR: process.env.STICKER_AUTHOR || "MidKnightMantra🌸",

  // Paths
  SESSION_PATH: path.resolve(process.env.SESSION_PATH || "./session"),
  STORE_PATH: path.resolve(process.env.STORE_PATH || "./src/database/baileys_store.json"),
  DATABASE_PATH: path.resolve(process.env.DATABASE_PATH || "./src/database/database.json"),

  // External Keys
  MONGO_URI: process.env.MONGO_URI || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",

  // Misc
  AUTO_STICKER: parseBooleanEnv(process.env.AUTO_STICKER, true),
  GREETING_MESSAGES: parseBooleanEnv(process.env.GREETING_MESSAGES, true),
  EMOTION_CAPTIONS: process.env.EMOTION_CAPTIONS === "true",

};

// ─────────────────────────────────────────────
// ⚠️ Startup Validation
// ─────────────────────────────────────────────
if (config.OWNER_NUMBER.length === 0) {
  console.warn("⚠️ OWNER_NUMBER not set. Owner-specific features may fail.");
}
if (!config.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_KEY not provided. OpenAI features disabled.");
}
if (!config.MONGO_URI) {
  console.info("ℹ️ Using local JSON store (no MongoDB URI set).");
}
