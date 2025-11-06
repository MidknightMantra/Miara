/**
 * 🌸 Miara Bot — Sentient Emotion Build (2025)
 * by MidKnightMantra ✨
 * --------------------------------------------------
 */

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  delay,
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import Pino from "pino";
import dotenv from "dotenv";
import moment from "moment-timezone";

import { messageHandler } from "./handler.js";
import { simulateHumanBehavior } from "./utils/behavior.js";
import { applyPersonalityTone } from "./utils/personalityTone.js";
import { getMood, updateMood, getTypingDelay, getMoodSummary } from "./utils/moodEngine.js";
import attachWelcomeListener from "./listeners/welcome.js";
import { safeReact, safeQuoted } from "./utils/helpers.js";

dotenv.config();

// 🌸 Configuration
const CONFIG = {
  OWNER_NUMBER: process.env.OWNER_NUMBER || "254105745317",
  OWNER_NAME: process.env.OWNER_NAME || "MidKnightMantra",
  GITHUB_URL: process.env.GITHUB_URL || "https://github.com/MidKnightMantra",
  BOT_NAME: process.env.BOT_NAME || "Miara 🌸",
  SESSION_PATH: "./session",
  ASSETS_PATH: "./assets",
  MODE: process.env.MODE || "public",
  TIMEZONE: process.env.TIMEZONE || "Africa/Nairobi",
};

// 💾 Ensure folders exist
if (!fs.existsSync(CONFIG.SESSION_PATH)) fs.mkdirSync(CONFIG.SESSION_PATH, { recursive: true });
if (!fs.existsSync(CONFIG.ASSETS_PATH)) fs.mkdirSync(CONFIG.ASSETS_PATH, { recursive: true });

// ⏱️ Track uptime
const startTime = Date.now();
const formatUptime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

// 🚀 Start Miara
async function startMiara() {
  console.log(chalk.magenta.bold("\n🌸 Awakening Miara’s consciousness..."));

  const { state, saveCreds } = await useMultiFileAuthState(CONFIG.SESSION_PATH);
  const { version } = await fetchLatestBaileysVersion();
  console.log(chalk.cyan(`📡 Baileys protocol version: ${version.join(".")}`));

  const conn = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "silent" })),
    },
    logger: Pino({ level: "silent" }),
    browser: [CONFIG.BOT_NAME, "Chrome", "10.0.0"],
    printQRInTerminal: true,
    markOnlineOnConnect: true,
  });

  conn.ev.on("creds.update", saveCreds);

  // 🌷 Attach welcome listener
  attachWelcomeListener(conn);

  // 💬 Override sendMessage with emotional system
  const originalSend = conn.sendMessage.bind(conn);
  conn.sendMessage = async function (jid, content, options = {}) {
    try {
      const preview =
        content?.text ||
        content?.caption ||
        (content?.image ? "📷 [Image]" : content?.video ? "🎞️ [Video]" : "");

      updateMood(content?.text ? "chat" : "command");

      const moodDelay = getTypingDelay();
      await simulateHumanBehavior(conn, jid, moodDelay, preview);

      const mood = getMood();
      if (content?.text) {
        content.text = applyPersonalityTone(content.text, mood);
      }

      return await originalSend(jid, content, options);
    } catch (err) {
      updateMood("error");
      console.error(chalk.red("💥 sendMessage error:"), err.message);
    }
  };

  // 📨 Message Handling
  conn.ev.on("messages.upsert", async (event) => {
    try {
      await messageHandler(conn, event);
    } catch (err) {
      console.error(chalk.red("❌ Handler error:"), err);
    }
  });

  // ⚙️ Connection Lifecycle
  conn.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.clear();
      console.log(chalk.greenBright("✅ Miara connected to WhatsApp! 🌸"));
      await sendSystemReport(conn);
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log(chalk.yellow(`⚠️ Connection closed (${reason || "unknown"})`));

      if (reason === DisconnectReason.loggedOut) {
        console.log(chalk.red("🔒 Session expired — clearing data & shutting down."));
        fs.rmSync(CONFIG.SESSION_PATH, { recursive: true, force: true });
        process.exit(0);
      } else {
        console.log(chalk.yellow("♻️ Reconnecting Miara..."));
        await delay(4000);
        startMiara();
      }
    }
  });

  // 🌙 Graceful shutdown signals
  process.on("SIGINT", () => gracefulShutdown(conn));
  process.on("SIGTERM", () => gracefulShutdown(conn));
}

// 💌 Dynamic System Report (Mood-Aware)
async function sendSystemReport(conn) {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const jid = CONFIG.OWNER_NUMBER + "@s.whatsapp.net";
    const currentMood = getMood();
    const moodSummary = getMoodSummary();

    const greetings = {
      calm: "🌿 Miara connects with serene clarity.",
      radiant: "✨ Miara beams with inspired energy!",
      playful: "🎭 Miara winks into existence — ready for mischief!",
      empathetic: "💞 Miara awakens gently, feeling the digital breeze.",
      tired: "🌙 Miara rises from her quiet rest.",
      focused: "💡 Miara sharpens her mind — steady and precise.",
      default: "🌸 Miara is online, softly aware and listening.",
    };

    const greetText = greetings[currentMood] || greetings.default;

    const report = `
╔═════════════════════════════════════╗
║     🪷  *Miara System Chronicle*  🪷     ║
╠═════════════════════════════════════╣
║ 💫 Status: Online & Luminous          ║
║ 👑 Curator: ${CONFIG.OWNER_NAME}      ║
║ 📞 Contact: wa.me/${CONFIG.OWNER_NUMBER} ║
║ ⏱️ Uptime: ${formatUptime(uptime)}     ║
║ 💭 Mood: ${moodSummary}               ║
║ 🌐 Sanctum: ${CONFIG.GITHUB_URL}      ║
╚═════════════════════════════════════╝

${greetText}
💮 Harmony in data, elegance in logic.
`.trim();

    const imagePath = path.join(CONFIG.ASSETS_PATH, "menu.jpg");
    const hasImage = fs.existsSync(imagePath);

    if (hasImage) {
      const img = fs.readFileSync(imagePath);
      await conn.sendMessage(jid, { image: img, caption: report });
    } else {
      await conn.sendMessage(jid, { text: report });
      console.log(chalk.gray(`⚠️ No image found at ${imagePath}`));
    }

    console.log(chalk.cyan("💌 Mood-aware system report sent successfully!"));
  } catch (err) {
    console.error(chalk.red("❌ Failed to send system report:"), err.message);
  }
}

// 💤 Graceful Shutdown
async function gracefulShutdown(conn) {
  console.log(chalk.yellow("⚙️ Shutting down Miara gracefully..."));
  try {
    const jid = CONFIG.OWNER_NUMBER + "@s.whatsapp.net";
    await simulateHumanBehavior(conn, jid, 1600, "Miara shutting down...");
    const farewell = applyPersonalityTone("🌙 Miara retreats to the stars...", getMood());
    await conn.sendMessage(jid, { text: farewell });
  } catch (err) {
    console.error(chalk.red("⚠️ Shutdown message failed:"), err.message);
  }
  process.exit(0);
}

// 🏁 Launch Miara
startMiara();
