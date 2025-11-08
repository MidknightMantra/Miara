/**
 * 🌸 Miara 🌸 — Deluxe Logger (2025)
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * Colorized, timezone-aware, emotionally-styled structured logging.
 * Beautiful console experience with graceful fallbacks for panels.
 */

import chalk from "chalk";
import moment from "moment-timezone";
import gradient from "gradient-string";

const LOG_TIMEZONE = process.env.LOG_TIMEZONE || "Africa/Nairobi";
const LOG_TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";
const SILENT_MODE = process.env.SILENT_LOGS === "true";
const COLOR_ENABLED = chalk.supportsColor || process.stdout.isTTY;

// mood hues (used for INFO / DEBUG glow)
const moodGradient = gradient(["#b197fc", "#c77dff", "#ff8fab"]);

// level color palette
const LEVELS = {
  DEBUG: { color: chalk.gray, label: "DEBUG" },
  INFO: { color: (txt) => moodGradient(txt), label: "INFO" },
  WARN: { color: chalk.hex("#ffd166"), label: "WARN" },
  ERROR: { color: chalk.hex("#ff4d6d"), label: "ERROR" }
};

/**
 * 🕒 Format timestamped log entry
 */
function format(level, message, context = "", showStack = false) {
  const cfg = LEVELS[level] || LEVELS.INFO;
  const ts = moment().tz(LOG_TIMEZONE).format(LOG_TIMESTAMP_FORMAT);
  const levelTag = COLOR_ENABLED ? cfg.color(`[${cfg.label}]`) : `[${cfg.label}]`;
  const timeTag = COLOR_ENABLED ? chalk.gray(ts) : ts;
  const ctxTag = context ? chalk.dim(`[${context}] `) : "";
  let output = `${levelTag} ${timeTag} - ${ctxTag}${message}`;

  if (showStack && level === "ERROR") {
    const trace = new Error().stack?.split("\n").slice(2).join("\n");
    output += `\n${chalk.dim(trace)}`;
  }
  return output;
}

/**
 * ✨ Optional persistent log target
 */
function persist(level, line) {
  // hook for file or DB logging
  // fs.appendFileSync("./logs/miara.log", `${line}\n`);
}

/**
 * 🌿 Unified dispatcher
 */
function log(level, message, { context = "", stack = false } = {}) {
  if (SILENT_MODE) return;

  const msg = message instanceof Error ? message.message : message;
  const line = format(level, msg, context, stack);
  console.log(line);
  persist(level, line);

  if (message instanceof Error && stack && message.stack) {
    console.log(chalk.dim(message.stack));
  }
}

/**
 * 🌸 Exported interface
 */
export const logger = {
  debug: (msg, ctx) => log("DEBUG", msg, { context: ctx }),
  info: (msg, ctx) => log("INFO", msg, { context: ctx }),
  warn: (msg, ctx) => log("WARN", msg, { context: ctx }),
  error: (msg, stack = true, ctx) => log("ERROR", msg, { context: ctx, stack })
};

// ─────────────────────────────────────────────
// 🧠 Optional global crash capture
// ─────────────────────────────────────────────
if (process.env.GLOBAL_LOG_ERRORS === "true") {
  process.on("uncaughtException", (err) => logger.error(err, true, "uncaught"));
  process.on("unhandledRejection", (reason) => logger.error(reason, true, "promise"));
}

import { onMoodChange } from "./moodEngine.js";

onMoodChange((state) => {
  const glow = chalk.hex(state.color || "#fff");
  console.log(glow(`💫 Logger hue synced with mood: ${state.mood}`));
});

export default logger;
