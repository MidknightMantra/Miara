/**
 * 🌸 Miara Configuration Core — Deluxe 2025
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * Smart configuration loader for multi-environment deployment.
 * Safely parses .env, detects runtime host, and ensures directories.
 */

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
import chalk from "chalk";

// ─────────────────────────────────────────────
// 🧩 Load Environment
// ─────────────────────────────────────────────
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// ─────────────────────────────────────────────
// 🧠 Utility Parsers
// ─────────────────────────────────────────────
function parseArrayEnv(envVar) {
  if (!envVar) return [];
  return [...new Set(envVar.split(",").map((i) => i.trim()).filter(Boolean))];
}

function parseBooleanEnv(envVar, def = false) {
  if (envVar === undefined || envVar === null) return def;
  return ["true", "1", "yes", "on"].includes(envVar.toLowerCase());
}

// ─────────────────────────────────────────────
// 🌍 Host Environment Detection
// ─────────────────────────────────────────────
function detectHostEnvironment() {
  if (process.env.RENDER) return "Render";
  if (process.env.HEROKU) return "Heroku";
  if (process.env.RAILWAY_STATIC_URL) return "Railway";
  if (process.env.CODESPACES) return "GitHub Codespace";
  if (process.env.DOCKER || process.env.CONTAINER) return "Docker / Panel";
  if (process.env.SSH_TTY || process.env.TERM_PROGRAM) return "VPS / Terminal";
  if (process.env.VERCEL) return "Vercel";
  if (process.env.AWS_EXECUTION_ENV) return "AWS Lambda / EC2";
  return "Unknown";
}

const HOST_ENV = detectHostEnvironment();

// ─────────────────────────────────────────────
// 🌸 Core Configuration Object
// ─────────────────────────────────────────────
const CONFIG = {
  // Basic Identity
  BOT_NAME: process.env.BOT_NAME || "Miara Bot 🌸",
  BIO: process.env.BIO || "Emotion in motion — the code dreams.",

  // Ownership
  OWNER_NAME: process.env.OWNER_NAME || "MidKnightMantra",
  OWNER_NUMBER: parseArrayEnv(process.env.OWNER_NUMBER || "2547XXXXXXX"),
  OWNER_JIDS: parseArrayEnv(process.env.OWNER_NUMBER || "2547XXXXXXX").map((num) =>
    num.includes("@s.whatsapp.net") ? num : `${num}@s.whatsapp.net`
  ),
  DEFAULT_OWNER_JID: (() => {
    const first = parseArrayEnv(process.env.OWNER_NUMBER || "2547XXXXXXX")[0];
    return first?.includes("@s.whatsapp.net") ? first : `${first}@s.whatsapp.net`;
  })(),

  // Bot Behavior
  PREFIX: process.env.PREFIX || ".",
  MODE: parseBooleanEnv(process.env.PRIVATE_MODE, false) ? "private" : "public",
  LANGUAGE: process.env.LANGUAGE || "en",
  REGION: process.env.REGION || "Unknown",
  TIMEZONE: process.env.TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",

  // Runtime Options
  BOOT_MESSAGE: parseBooleanEnv(process.env.BOOT_MESSAGE, true),
  BOOT_TARGET: process.env.BOOT_TARGET || "",
  SHOW_CONSOLE_REPORT: parseBooleanEnv(process.env.SHOW_CONSOLE_REPORT, true),
  PANEL_MODE: parseBooleanEnv(process.env.PANEL_MODE, false),
  QUIET_MODE: parseBooleanEnv(process.env.QUIET_MODE, false),

  // Stickers
  STICKER_PACK_NAME: process.env.STICKER_PACK_NAME || "Miara Pack",
  STICKER_AUTHOR: process.env.STICKER_AUTHOR || "MidKnightMantra🌸",

  // File Storage
  SESSION_PATH: path.resolve(process.env.SESSION_PATH || "./session"),
  STORE_PATH: path.resolve(process.env.STORE_PATH || "./src/database/baileys_store.json"),
  DATABASE_PATH: path.resolve(process.env.DATABASE_PATH || "./src/database/database.json"),

  // External Integrations
  DATABASE_URL: process.env.DATABASE_URL || "",
  MONGO_URI: process.env.MONGO_URI || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  GOOGLE_GEMINI_KEY: process.env.GOOGLE_GEMINI_KEY || "",
  MISTRAL_KEY: process.env.MISTRAL_KEY || "",
  HF_TOKEN: process.env.HF_TOKEN || "",
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || "",

  // Feature Toggles
  AUTO_STICKER: parseBooleanEnv(process.env.AUTO_STICKER, true),
  GREETING_MESSAGES: parseBooleanEnv(process.env.GREETING_MESSAGES, true),
  EMOTION_CAPTIONS: parseBooleanEnv(process.env.EMOTION_CAPTIONS, true),
  SESSION_BACKUP_RETENTION_DAYS: parseInt(process.env.SESSION_BACKUP_RETENTION_DAYS || "5", 10),

  // Environment Metadata
  HOST_ENV,
  PLATFORM: {
    os: os.platform(),
    arch: os.arch(),
    node: process.version,
    cores: os.cpus().length,
    memory: Math.round(os.totalmem() / 1024 / 1024) + "MB"
  },
  VERSION: "1.0.6"
};

// ─────────────────────────────────────────────
// ✅ Validation & Directory Setup
// ─────────────────────────────────────────────
if (!CONFIG.OWNER_NUMBER.length) {
  console.warn(
    chalk.yellow("⚠️ OWNER_NUMBER not set — please define it in your .env file.")
  );
  console.warn(chalk.gray("Example: OWNER_NUMBER=254712345678"));
}

if (!CONFIG.OPENAI_API_KEY)
  console.warn(chalk.yellow("⚠️ OPENAI_API_KEY missing — AI features disabled."));

if (!CONFIG.MONGO_URI && !CONFIG.DATABASE_URL)
  console.info(chalk.gray("ℹ️ No external database configured — using local JSON store."));

for (const dir of [CONFIG.SESSION_PATH, path.dirname(CONFIG.STORE_PATH)]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(chalk.gray(`📂 Created directory: ${dir}`));
  }
}

// ─────────────────────────────────────────────
// 🎨 Startup Banner
// ─────────────────────────────────────────────
if (!CONFIG.QUIET_MODE) {
  const modeColor = CONFIG.MODE === "private" ? chalk.redBright : chalk.greenBright;
  console.log(
    chalk.magentaBright(`\n🌸 ${CONFIG.BOT_NAME} initialized 🌸`) +
      chalk.white(`
├── Mode: `) +
      modeColor(CONFIG.MODE) +
      chalk.white(`
├── Owner(s): ${CONFIG.OWNER_NUMBER.join(", ") || "none"}
├── Environment: ${CONFIG.HOST_ENV}
├── Node: ${CONFIG.PLATFORM.node}
├── Platform: ${CONFIG.PLATFORM.os} (${CONFIG.PLATFORM.arch})
└── Cores: ${CONFIG.PLATFORM.cores} • RAM: ${CONFIG.PLATFORM.memory}
`)
  );
}

export default CONFIG;
export { CONFIG as config };
