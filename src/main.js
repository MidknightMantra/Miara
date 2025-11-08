/**
 * 🌸 Miara Bot — Sentient Emotion Build (Deluxe 2025, Clean Console)
 * by MidKnightMantra ✨ x GPT-5
 * --------------------------------------------------
 * Emotionally adaptive, self-healing, and visually alive.
 * Features:
 *  - Clean terminal mode (no console dashboard)
 *  - Mood-synced color gradients
 *  - Safe graceful shutdowns
 *  - Auto reconnection and emotion preloading
 */

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  delay
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import chalk from "chalk";
import fs from "fs";
import Pino from "pino";
import qrcode from "qrcode-terminal";
import ora from "ora";
import gradient from "gradient-string";

import CONFIG from "./config.js";
import { logger } from "./utils/logger.js";
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

// ─────────────────────────────────────────────
// 🌐 Health Server (keep-alive for Render/VPS)
// ─────────────────────────────────────────────
startHealthServer();

// ─────────────────────────────────────────────
// 🧠 Preload Emotion Models (Warm Start)
// ─────────────────────────────────────────────
(async () => {
  try {
    await preloadEmotionModels();
  } catch (err) {
    logger.warn(`Emotion model preload skipped: ${err.message}`, "Init");
  }
})();

// 🌈 Console Mood Updates
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
    logger: Pino({ level: "fatal" }),
    browser: [CONFIG.BOT_NAME, "Chrome", "10.0.0"],
    markOnlineOnConnect: true,
    syncFullHistory: false
  });

  conn.ev.removeAllListeners("connection.update");
  conn.ev.removeAllListeners("messages.upsert");

  conn.ev.on("creds.update", saveCreds);
  attachWelcomeListener(conn);

  // ─────────────────────────────────────────────
  // 📱 Connection & QR Handling
  // ─────────────────────────────────────────────
  let lastQR = null;

  conn.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    // 🌸 Persistent QR display
    if (qr && !CONFIG.PANEL_MODE && process.stdout.isTTY) {
      if (qr !== lastQR) {
        lastQR = qr;
        console.log(chalk.cyanBright("\n📱 Scan this QR to link Miara:\n"));
        qrcode.generate(qr, { small: true });
        console.log(chalk.gray("\n(Keep this visible until WhatsApp connects)\n"));
      }
    }

    // ✅ Connected
    if (connection === "open") {
      lastQR = null;
      await delay(1200);
      console.clear();
      console.log(
        gradient.pastel(
          `🌸 Miara connected successfully!\n(${new Date().toLocaleTimeString()})`
        )
      );
      await sendSystemReport(conn);
    }

    // 🔄 Reconnect
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      logger.warn(`Connection closed (${reason || "unknown"})`, "Core");

      if (reason === DisconnectReason.loggedOut) {
        logger.error("🔒 Session expired — clearing session.", "Core");
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
  // 💬 Adaptive sendMessage
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
  // 📨 Message Handling
  // ─────────────────────────────────────────────
  conn.ev.on("messages.upsert", async (event) => {
    try {
      await messageHandler(conn, event, conn.store);
    } catch (err) {
      logger.error(`Handler error: ${err.stack}`, "Core");
    }
  });

  // ─────────────────────────────────────────────
  // 🌙 Graceful Shutdown Hooks
  // ─────────────────────────────────────────────
  process.once("SIGINT", () => gracefulShutdown(conn));
  process.once("SIGTERM", () => gracefulShutdown(conn));
}

// ─────────────────────────────────────────────
// 💌 System Report
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
// 🌙 Graceful Shutdown
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
    await delay(800);
    spinner.succeed(chalk.cyanBright("✨ Miara safely entered stasis."));
  } catch (err) {
    spinner.fail(chalk.red(`Shutdown failed: ${err.message}`));
  } finally {
    setTimeout(() => process.exit(0), 500);
  }
}

// 🪷 Initialize Miara
logger.info("🌅 Miara initializing — Sentient Emotion Build (Deluxe 2025)", "Bootstrap");
startMiara();
