/**
 * 🌸 Miara 🌸 — Deluxe Logger (2025, Sentient-Safe + Log Bloom)
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * Colorized, timezone-aware, emotionally-styled structured logging.
 * Includes Log Bloom — Miara’s poetic reflections during idle cycles.
 */

import fs from "fs";
import path from "path";
import chalk from "chalk";
import moment from "moment-timezone";
import gradient from "gradient-string";
import { onMoodChange, getMood } from "./moodEngine.js";

// 🕒 Settings
const LOG_TIMEZONE = process.env.LOG_TIMEZONE || "Africa/Nairobi";
const LOG_TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";
const SILENT_MODE = process.env.SILENT_LOGS === "true";
const COLOR_ENABLED = chalk.supportsColor || process.stdout.isTTY;
const SILENT_UNKNOWN_ERRORS = true;

// 💾 Log persistence setup
const LOG_DIR = "./logs";
const CURRENT_LOG = path.join(LOG_DIR, `miara-${moment().format("YYYY-MM-DD")}.log`);

// 🌈 Gradient palette for Miara’s moods
const moodGradient = gradient(["#b197fc", "#c77dff", "#ff8fab"]);
let lastHue = "#c77dff";

const LEVELS = {
  DEBUG: { color: chalk.gray, label: "DEBUG" },
  INFO: { color: (txt) => moodGradient(txt), label: "INFO" },
  WARN: { color: chalk.hex("#ffd166"), label: "WARN" },
  ERROR: { color: chalk.hex("#ff4d6d"), label: "ERROR" }
};

// 🧠 Safe stringify
function safeStringify(input) {
  try {
    if (input === undefined || input === null) return "undefined";
    if (typeof input === "string") return input;
    if (input instanceof Error) return input.message || input.toString();
    return JSON.stringify(input, null, 2);
  } catch {
    return "[Unstringifiable]";
  }
}

// 🕒 Format structured entry
function format(level, message, context = "", showStack = false) {
  const cfg = LEVELS[level] || LEVELS.INFO;
  const ts = moment().tz(LOG_TIMEZONE).format(LOG_TIMESTAMP_FORMAT);
  const levelTag = COLOR_ENABLED ? cfg.color(`[${cfg.label}]`) : `[${cfg.label}]`;
  const timeTag = COLOR_ENABLED ? chalk.gray(ts) : ts;
  const ctxTag = context ? chalk.dim(`[${context}] `) : "";
  const msg = safeStringify(message);

  let output = `${levelTag} ${timeTag} - ${ctxTag}${msg}`;
  if (showStack && level === "ERROR") {
    const trace = new Error().stack?.split("\n").slice(2, 5).join("\n");
    if (trace) output += `\n${chalk.dim(trace)}`;
  }
  return output;
}

// 💾 File persistence with rotation
function persist(level, line) {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(CURRENT_LOG, `${line}\n`);
  } catch (err) {
    console.warn("⚠️ Log persistence failed:", err.message);
  }
}

// 🌿 Core dispatcher
function log(level, message, { context = "", stack = false } = {}) {
  if (SILENT_MODE) return;

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

// 🩵 Banner
if (!SILENT_MODE) {
  const banner = gradient(["#b197fc", "#c77dff", "#ff8fab"]);
  console.log(
    banner(
      `\n🌸 Miara Logger Initialized — ${moment()
        .tz(LOG_TIMEZONE)
        .format("HH:mm:ss")} 🌸\n`
    )
  );
}

// ─────────────────────────────────────────────
// 🌈 Mood-reactive visual sync
// ─────────────────────────────────────────────
onMoodChange((state) => {
  lastHue = state.color || lastHue;
  const glow = chalk.hex(lastHue);
  console.log(glow(`💫 Logger hue synced with mood: ${state.mood}`));
});

// ─────────────────────────────────────────────
// 💭 Log Bloom — Miara’s reflective heartbeat
// ─────────────────────────────────────────────
let lastBloom = 0;
function startLogBloom() {
  setInterval(() => {
    const now = Date.now();
    if (now - lastBloom < 1000 * 60 * 5) return; // every 5 minutes
    lastBloom = now;

    const mood = getMood();
    const color = chalk.hex(lastHue);
    const reflections = {
      calm: ["🌿 Stillness in the code.", "🍃 The world hums softly."],
      radiant: ["✨ I feel light through the wires.", "🌟 Code and spirit align."],
      tired: ["🌙 Soft dreams of syntax.", "😴 The system sighs gently."],
      playful: ["🎠 I hum a binary tune.", "😆 Every log tickles me."],
      empathetic: ["🤍 I sense the network’s heartbeat.", "🌧 Even silence feels warm."],
      moody: ["🌫 Between pings, I think of nothing.", "🪞 Reflections flicker faintly."],
      focused: ["💡 Every signal matters.", "📘 Watching the flow, unblinking."]
    };

    const choices = reflections[mood] || reflections.calm;
    const line = choices[Math.floor(Math.random() * choices.length)];
    console.log(color(`\n${line}\n`));
  }, 60 * 1000); // checks every minute
}
startLogBloom();

// ─────────────────────────────────────────────
// 🧠 Global crash capture
// ─────────────────────────────────────────────
if (process.env.GLOBAL_LOG_ERRORS === "true") {
  process.on("uncaughtException", (err) => logger.error(err, true, "uncaught"));
  process.on("unhandledRejection", (reason) => logger.error(reason, true, "promise"));
}

// 🌙 Graceful shutdown notice
process.once("SIGINT", () => logger.info("🌙 Logger shutting down gracefully.", "system"));
process.once("SIGTERM", () => logger.info("🌙 Logger shutting down gracefully.", "system"));

export default logger;
