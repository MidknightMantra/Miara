/**
 * 🌸 Miara 🌸
 * by MidKnightMantra × GPT-5 — 2025
 * ---------------------------------------------------------
 * Universal Configuration for Cloud, VPS, and Panel Deployments.
 * Auto-detects environment, parses .env variables safely,
 * and initializes directory structure at runtime.
 */

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
import chalk from "chalk";

// Load .env if present
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ─────────────────────────────────────────────
// 🧩 Utility Parsers
// ─────────────────────────────────────────────
function parseArrayEnv(envVar) {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
}

function parseBooleanEnv(envVar, def = false) {
  if (envVar === undefined || envVar === null) return def;
  return ["true", "1", "yes", "on"].includes(envVar.toLowerCase());
}

// ─────────────────────────────────────────────
// 🌐 Host Environment Detection
// ─────────────────────────────────────────────
function detectHostEnvironment() {
  if (process.env.RENDER) return "Render";
  if (process.env.HEROKU) return "Heroku";
  if (process.env.RAILWAY_STATIC_URL) return "Railway";
  if (process.env.CODESPACES) return "GitHub Codespace";
  if (process.env.CONTAINER || process.env.DOCKER) return "Docker / Panel";
  if (process.env.SSH_TTY || process.env.TERM_PROGRAM) return "Terminal / VPS";
  return "Unknown";
}

const HOST_ENV = detectHostEnvironment();

// ─────────────────────────────────────────────
// 🪷 Core Configuration
// ─────────────────────────────────────────────
const CONFIG = {
  BOT_NAME: process.env.BOT_NAME || "Miara Bot 🌸",
  BIO: process.env.BIO || "🌸 M I A R A 🌸",

  OWNER_NAME: process.env.OWNER_NAME || "MidKnightMantra",
  OWNER_NUMBER: parseArrayEnv(process.env.OWNER_NUMBER),
  OWNER_JIDS: parseArrayEnv(process.env.OWNER_NUMBER).map((num) =>
    num.includes("@s.whatsapp.net") ? num : `${num}@s.whatsapp.net`
  ),
  DEFAULT_OWNER_JID: parseArrayEnv(process.env.OWNER_NUMBER)[0]
    ? `${parseArrayEnv(process.env.OWNER_NUMBER)[0]}@s.whatsapp.net`
    : "2547XXXXXXX@s.whatsapp.net",

  PREFIX: process.env.PREFIX || ".",
  MODE: parseBooleanEnv(process.env.PRIVATE_MODE, false) ? "private" : "public",
  LANGUAGE: process.env.LANGUAGE || "en",
  REGION: process.env.REGION || "Unknown",
  TIMEZONE: process.env.TIMEZONE || "Africa/Nairobi",

  // 🌱 Startup & Behavior
  BOOT_MESSAGE: parseBooleanEnv(process.env.BOOT_MESSAGE, true),
  BOOT_TARGET: process.env.BOOT_TARGET || "",
  SHOW_CONSOLE_REPORT: parseBooleanEnv(process.env.SHOW_CONSOLE_REPORT, true),

  // 🩵 Stickers
  STICKER_PACK_NAME: process.env.STICKER_PACK_NAME || "Miara Pack",
  STICKER_AUTHOR: process.env.STICKER_AUTHOR || "MidKnightMantra🌸",

  // 🗂️ Storage & Sessions
  SESSION_PATH: path.resolve(process.env.SESSION_PATH || "./session"),
  STORE_PATH: path.resolve(process.env.STORE_PATH || "./src/database/baileys_store.json"),
  DATABASE_PATH: path.resolve(process.env.DATABASE_PATH || "./src/database/database.json"),

  // 🌍 External Integrations
  DATABASE_URL: process.env.DATABASE_URL || "",
  MONGO_URI: process.env.MONGO_URI || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  GOOGLE_GEMINI_KEY: process.env.GOOGLE_GEMINI_KEY || "",
  MISTRAL_KEY: process.env.MISTRAL_KEY || "",
  HF_TOKEN: process.env.HF_TOKEN || "",
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || "",

  // 🧠 Feature Toggles
  AUTO_STICKER: parseBooleanEnv(process.env.AUTO_STICKER, true),
  GREETING_MESSAGES: parseBooleanEnv(process.env.GREETING_MESSAGES, true),
  EMOTION_CAPTIONS: parseBooleanEnv(process.env.EMOTION_CAPTIONS, true),
  SESSION_BACKUP_RETENTION_DAYS: parseInt(process.env.SESSION_BACKUP_RETENTION_DAYS || "5"),

  // 🖥️ Deployment Modes
  PANEL_MODE: parseBooleanEnv(process.env.PANEL_MODE, false),
  QUIET_MODE: parseBooleanEnv(process.env.QUIET_MODE, false),

  // ⚙️ Environment Metadata
  HOST_ENV,
  PLATFORM: {
    os: os.platform(),
    arch: os.arch(),
    node: process.version,
    cores: os.cpus().length
  },
  VERSION: "1.0.5"
};

// ─────────────────────────────────────────────
// ✅ Configuration Validation
// ─────────────────────────────────────────────
if (!CONFIG.OWNER_NUMBER.length)
  console.warn(chalk.yellow("⚠️ OWNER_NUMBER not set — please define it in your .env file."));

if (!CONFIG.OPENAI_API_KEY)
  console.warn(chalk.yellow("⚠️ OPENAI_API_KEY missing — AI features disabled."));

if (!CONFIG.MONGO_URI && !CONFIG.DATABASE_URL)
  console.info(chalk.gray("ℹ️ No external database configured — using local JSON store."));

// ─────────────────────────────────────────────
// 📁 Ensure required directories exist
// ─────────────────────────────────────────────
for (const dir of [CONFIG.SESSION_PATH, path.dirname(CONFIG.STORE_PATH)]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.gray(`📂 Created directory: ${dir}`));
  }
}

// ─────────────────────────────────────────────
// 🌸 Startup Banner
// ─────────────────────────────────────────────
if (!CONFIG.QUIET_MODE) {
  console.log(
    chalk.magentaBright(`\n🌸 ${CONFIG.BOT_NAME} initialized`) +
      chalk.white(`
├── Mode: ${CONFIG.MODE}
├── Owner(s): ${CONFIG.OWNER_NUMBER.join(", ") || "none"}
├── Environment: ${CONFIG.HOST_ENV}
└── Node ${CONFIG.PLATFORM.node} • ${CONFIG.PLATFORM.os} (${CONFIG.PLATFORM.arch})
`)
  );
}

export default CONFIG;
export { CONFIG as config };

