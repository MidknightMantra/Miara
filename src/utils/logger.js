/**
 * 🌸 Miara 🌸 — Deluxe Logger (2025, Sentient-Safe)
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * Colorized, timezone-aware, emotionally-styled structured logging.
 * Hardened for Baileys v7 and safe against malformed JIDs / undefined errors.
 */

import chalk from "chalk";
import moment from "moment-timezone";
import gradient from "gradient-string";
import { onMoodChange } from "./moodEngine.js";

const LOG_TIMEZONE = process.env.LOG_TIMEZONE || "Africa/Nairobi";
const LOG_TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";
const SILENT_MODE = process.env.SILENT_LOGS === "true";
const COLOR_ENABLED = chalk.supportsColor || process.stdout.isTTY;
const SILENT_UNKNOWN_ERRORS = true; // Prevent repeated undefined JID logs

// mood hues (used for INFO / DEBUG glow)
const moodGradient = gradient(["#b197fc", "#c77dff", "#ff8fab"]);

const LEVELS = {
  DEBUG: { color: chalk.gray, label: "DEBUG" },
  INFO: { color: (txt) => moodGradient(txt), label: "INFO" },
  WARN: { color: chalk.hex("#ffd166"), label: "WARN" },
  ERROR: { color: chalk.hex("#ff4d6d"), label: "ERROR" }
};

// 🧠 Safe stringify for weird Baileys errors
function safeStringify(input) {
  try {
    if (!input) return "undefined";
    if (typeof input === "string") return input;
    if (input instanceof Error) return input.message || input.toString();
    return JSON.stringify(input, null, 2);
  } catch {
    return "[Unstringifiable Error]";
  }
}

// 🕒 Format timestamped log entry
function format(level, message, context = "", showStack = false) {
  const cfg = LEVELS[level] || LEVELS.INFO;
  const ts = moment().tz(LOG_TIMEZONE).format(LOG_TIMESTAMP_FORMAT);
  const levelTag = COLOR_ENABLED ? cfg.color(`[${cfg.label}]`) : `[${cfg.label}]`;
  const timeTag = COLOR_ENABLED ? chalk.gray(ts) : ts;
  const ctxTag = context ? chalk.dim(`[${context}] `) : "";

  const msg = safeStringify(message);
  let output = `${levelTag} ${timeTag} - ${ctxTag}${msg}`;

  if (showStack && level === "ERROR") {
    const trace = new Error().stack?.split("\n").slice(2).join("\n");
    if (trace) output += `\n${chalk.dim(trace)}`;
  }
  return output;
}

// ✨ Optional persistent log target
function persist(level, line) {
  // Example: fs.appendFileSync("./logs/miara.log", `${line}\n`);
}

// 🌿 Unified dispatcher
function log(level, message, { context = "", stack = false } = {}) {
  if (SILENT_MODE) return;

  // Suppress repeating unknown stack traces (from jidDecode)
  const msgText = safeStringify(message);
  if (SILENT_UNKNOWN_ERRORS && msgText.includes("jidDecode") && level === "ERROR") {
    console.log(chalk.dim(`[IGNORED] Baileys jidDecode anomaly logged safely.`));
    return;
  }

  const line = format(level, msgText, context, stack);
  console.log(line);
  persist(level, line);

  if (message instanceof Error && stack && message.stack) {
    console.log(chalk.dim(message.stack));
  }
}

// 🌸 Exported interface
export const logger = {
  debug: (msg, ctx) => log("DEBUG", msg, { context: ctx }),
  info: (msg, ctx) => log("INFO", msg, { context: ctx }),
  warn: (msg, ctx) => log("WARN", msg, { context: ctx }),
  error: (msg, stack = true, ctx) => log("ERROR", msg, { context: ctx, stack })
};

// ─────────────────────────────────────────────
// 🧠 Global crash capture
// ─────────────────────────────────────────────
if (process.env.GLOBAL_LOG_ERRORS === "true") {
  process.on("uncaughtException", (err) => logger.error(err, true, "uncaught"));
  process.on("unhandledRejection", (reason) => logger.error(reason, true, "promise"));
}

// 🌈 Mood-reactive visual sync
onMoodChange((state) => {
  const glow = chalk.hex(state.color || "#fff");
  console.log(glow(`💫 Logger hue synced with mood: ${state.mood}`));
});

export default logger;
