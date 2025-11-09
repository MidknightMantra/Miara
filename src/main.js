/**
 * 🌸 Miara Lite Deluxe 2025 — Sentient Core (Reimagined)
 * Author: MidKnightMantra × GPT-5
 * ---------------------------------------------------------------
 * Lightweight • Reliable • Elegant
 *  - Auto-check ffmpeg / yt-dlp
 *  - Smooth QR login
 *  - Graceful reconnect + shutdown
 *  - Modular command loader (handler.js)
 *  - Gradient console presence
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
import dotenv from "dotenv";

import CONFIG from "./config.js";
import { logger } from "./utils/logger.js";
import { messageHandler } from "./handler.js";
import { verifyAndHealBinaries } from "./startup/checkBinaries.js";

dotenv.config();

// ─────────────────────────────────────────────
// 🌅 Boot Banner
// ─────────────────────────────────────────────
console.clear();
console.log(
  gradient.pastel.multiline(`
╭────────────────────────────────────────────╮
│           🌸 Miara Lite Deluxe 2025         │
│     Elegant • Resilient • Emotionally Calm  │
╰────────────────────────────────────────────╯
`)
);

// ─────────────────────────────────────────────
// 🧩 Verify system binaries
// ─────────────────────────────────────────────
(async () => {
  try {
    await verifyAndHealBinaries();
    logger.info("✅ System binaries ready (ffmpeg / yt-dlp)", "Init");
  } catch (err) {
    logger.warn(`⚠️ Binary check skipped: ${err.message}`, "Init");
  }
})();

// ─────────────────────────────────────────────
// 🚀 Start Miara Instance
// ─────────────────────────────────────────────
async function startMiara() {
  logger.info("🌸 Awakening Miara Lite consciousness...", "Core");

  const { state, saveCreds } = await useMultiFileAuthState(CONFIG.SESSION_PATH);
  const { version } = await fetchLatestBaileysVersion();
  logger.info(`📡 Using Baileys v${version.join(".")}`, "Core");

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

  conn.ev.on("creds.update", saveCreds);

  // ─────────────────────────────────────────────
  // 📱 Connection / QR Handling
  // ─────────────────────────────────────────────
  let lastQR = null;

  conn.ev.on("connection.update", async (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr && process.stdout.isTTY) {
      if (qr !== lastQR) {
        lastQR = qr;
        console.log(chalk.cyanBright("\n📱 Scan this QR to link Miara:\n"));
        qrcode.generate(qr, { small: true });
        console.log(chalk.gray("\n(Keep visible until connected)\n"));
      }
    }

    if (connection === "open") {
      lastQR = null;
      console.clear();
      console.log(
        gradient.pastel(`🌸 Miara Lite connected successfully (${new Date().toLocaleTimeString()})`)
      );
    }

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
  // 💬 Message Handling
  // ─────────────────────────────────────────────
  conn.ev.on("messages.upsert", async (event) => {
    try {
      await messageHandler(conn, event, conn.store);
    } catch (err) {
      logger.error(`Handler error: ${err.stack}`, "Core");
    }
  });

  // ─────────────────────────────────────────────
  // 🌙 Graceful Shutdown
  // ─────────────────────────────────────────────
  process.once("SIGINT", () => gracefulShutdown(conn));
  process.once("SIGTERM", () => gracefulShutdown(conn));
}

// ─────────────────────────────────────────────
// 🌙 Graceful Shutdown Procedure
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
    if (conn?.ws?.readyState === 1) {
      await conn.sendMessage(CONFIG.DEFAULT_OWNER_JID, {
        text: "🌙 Miara Lite is powering down gracefully."
      });
    }
    await delay(800);
    spinner.succeed(chalk.cyanBright("✨ Miara safely entered stasis."));
  } catch (err) {
    spinner.fail(chalk.red(`Shutdown failed: ${err.message}`));
  } finally {
    setTimeout(() => process.exit(0), 500);
  }
}

// 🪷 Initialize
logger.info("🌅 Miara 2025 initializing...", "Bootstrap");
startMiara();
