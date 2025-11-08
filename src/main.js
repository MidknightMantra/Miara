/**
 * 🌸 Miara Bot — Sentient Emotion Build (Deluxe 2025)
 * by MidKnightMantra ✨ x GPT-5
 * --------------------------------------------------
 * Emotionally adaptive, self-healing, and visually alive.
 * Features:
 *  - Deluxe console dashboard (heartbeat, mood, uptime)
 *  - Mood-synced color gradients
 *  - Safe graceful shutdowns
 *  - Auto reconnection and emotion preloading
 */

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  delay
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import Pino from "pino";
import qrcode from "qrcode-terminal";
import ora from "ora";
import gradient from "gradient-string";

import CONFIG from "./config.js";
import { logger } from "./utils/logger.js";
import { useMultiFileAuthState } from "./lib/authHandler.js";
import { messageHandler } from "./handler.js";
import { simulateHumanBehavior } from "./utils/behavior.js";
import { applyPersonalityTone } from "./utils/personalityTone.js";
import {
  getMood,
  updateMood,
  getTypingDelay,
  getMoodSummary,
  onMoodChange
} from "./utils/moodEngine.js";
import attachWelcomeListener from "./listeners/welcome.js";
import { preloadEmotionModels } from "./lib/emotion.js";
import { startHealthServer } from "./server/health.js";
import { startDashboard, registerMessage } from "./utils/dashboard.js";

// ─────────────────────────────────────────────
// 🌐 Health Server (keep-alive for Render/Heroku)
// ─────────────────────────────────────────────
startHealthServer();

// 🌸 Launch Deluxe Console Dashboard
startDashboard();

// 🧠 Preload Emotion Models (warm-start brain)
(async () => {
  try {
    await preloadEmotionModels();
  } catch (err) {
    logger.warn(`Emotion models preload skipped: ${err.message}`, "Init");
  }
})();

// 🌈 Live mood-synced console glow
onMoodChange((state) => {
  const pulse = gradient(["#c77dff", state.color || "#ffffff"]);
  console.log(pulse(`💫 Mood shift → ${state.mood} (${state.summary})`));
});

// ─────────────────────────────────────────────
// 🚀 Start Miara Instance
// ─────────────────────────────────────────────
async function startMiara() {
  logger.info("🌸 Awakening Miara’s consciousness...", "Core");

  const { state, saveCreds } = await useMultiFileAuthState(CONFIG.SESSION_PATH);
  const { version } = await fetchLatestBaileysVersion();
  logger.info(`📡 Using Baileys protocol v${version.join(".")}`, "Core");

  const conn = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "silent" }))
    },
    logger: Pino({ level: "silent" }),
    browser: [CONFIG.BOT_NAME, "Chrome", "10.0.0"],
    markOnlineOnConnect: true
  });

  conn.ev.on("creds.update", saveCreds);
  attachWelcomeListener(conn);

  // ─────────────────────────────────────────────
  // 📱 Connection & QR Handling (Bloom effect)
  // ─────────────────────────────────────────────
  conn.ev.on("connection.update", async (update) => {
    const { qr, connection } = update;

    // 🌸 Animated QR Bloom
    if (qr && !CONFIG.PANEL_MODE) {
      console.clear();
      const spinner = ora({
        text: chalk.magentaBright("🌸 Blooming consciousness... preparing QR"),
        spinner: "dots"
      }).start();

      await new Promise((r) => setTimeout(r, 1200));
      spinner.text = chalk.cyanBright("🌐 Linking neural pathways...");
      await new Promise((r) => setTimeout(r, 1000));
      spinner.succeed(chalk.greenBright("✨ Consciousness active — scan to connect!"));

      console.log(chalk.yellow("\n📱 Scan this QR to link Miara:\n"));
      qrcode.generate(qr, { small: true });
    }

    // ✅ Connection established
    if (connection === "open") {
      console.clear();
      console.log(
        gradient.pastel(
          `🌸 Miara has awakened — connected to WhatsApp!\n(${new Date().toLocaleTimeString()})`
        )
      );
      await sendSystemReport(conn);
    }

    // 🔄 Connection Closed / Reconnect
    if (connection === "close") {
      const reason = new Boom(update.lastDisconnect?.error)?.output?.statusCode;
      logger.warn(`Connection closed (${reason || "unknown"})`, "Core");

      if (reason === DisconnectReason.loggedOut) {
        logger.error("🔒 Session expired — clearing data & shutting down.", "Core");
        fs.rmSync(CONFIG.SESSION_PATH, { recursive: true, force: true });
        process.exit(0);
      } else {
        logger.warn("♻️ Reconnecting Miara...", "Core");
        await delay(3000);
        startMiara();
      }
    }
  });

  // ─────────────────────────────────────────────
  // 🧠 Adaptive sendMessage (emotion-linked)
  // ─────────────────────────────────────────────
  const originalSend = conn.sendMessage.bind(conn);
  conn.sendMessage = async function (jid, content, options = {}) {
    try {
      const preview =
        content?.text ||
        content?.caption ||
        (content?.image ? "📷 [Image]" : content?.video ? "🎞️ [Video]" : "");
      updateMood(content?.text ? "chat" : "command");
      await simulateHumanBehavior(conn, jid, getTypingDelay(), preview);

      const mood = getMood();
      if (content?.text) content.text = applyPersonalityTone(content.text, mood);
      return await originalSend(jid, content, options);
    } catch (err) {
      updateMood("error");
      logger.error(`sendMessage error: ${err.message}`, "Core");
    }
  };

  // ─────────────────────────────────────────────
  // 📨 Message Handling (with dashboard counter)
  // ─────────────────────────────────────────────
  conn.ev.on("messages.upsert", async (event) => {
    try {
      registerMessage();
      await messageHandler(conn, event);
    } catch (err) {
      logger.error(`Handler error: ${err.message}`, "Core");
    }
  });

  // ─────────────────────────────────────────────
  // 🌙 Graceful Shutdown Hooks
  // ─────────────────────────────────────────────
  process.on("SIGINT", () => gracefulShutdown(conn));
  process.on("SIGTERM", () => gracefulShutdown(conn));
}

// ─────────────────────────────────────────────
// 💌 System Report (mood-aware)
// ─────────────────────────────────────────────
async function sendSystemReport(conn) {
  try {
    const uptime = Math.floor(process.uptime());
    const moodSummary = getMoodSummary();
    const jid = CONFIG.DEFAULT_OWNER_JID;

    const report = `
╔═══════════════════════════════╗
║ 🌸 *${CONFIG.BOT_NAME} System Report* 🌸
╠═══════════════════════════════╣
║ 🕒 Uptime: ${uptime}s
║ 💭 Mood: ${moodSummary}
║ 🪷 Mode: ${CONFIG.MODE}
║ 💫 Env: ${CONFIG.HOST_ENV || "unknown"}
╚═══════════════════════════════╝
`;
    await conn.sendMessage(jid, { text: report });
    logger.info("💌 System report sent to owner.", "Core");
  } catch (err) {
    logger.warn(`Failed to send system report: ${err.message}`, "Core");
  }
}

// ─────────────────────────────────────────────
// 🌙 Graceful Shutdown (no more connection spam)
// ─────────────────────────────────────────────
let shuttingDown = false;
async function gracefulShutdown(conn) {
  if (shuttingDown) return;
  shuttingDown = true;

  const spinner = ora({
    text: chalk.gray("🌙 Miara is retreating to the stars..."),
    spinner: "moon"
  }).start();

  try {
    const farewell = applyPersonalityTone("🌙 Miara retreats to the stars...", getMood());
    if (conn?.ws?.readyState === 1) {
      await conn.sendMessage(CONFIG.DEFAULT_OWNER_JID, { text: farewell }).catch(() => {});
    }
    await new Promise((r) => setTimeout(r, 800));
    spinner.succeed(chalk.cyanBright("✨ Miara safely entered stasis."));
  } catch (err) {
    spinner.fail(chalk.red(`Shutdown message failed: ${err.message}`));
  } finally {
    setTimeout(() => process.exit(0), 500);
  }
}

// 🪷 Initialize Miara
startMiara();
