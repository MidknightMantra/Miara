/**
 * 🌸 Miara Bot — Stable Build (Baileys 7.x RC)
 * by MidKnight — 2025
 */

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { useMultiFileAuthState } from "./lib/auth.js";
import { messageHandler } from "./handler.js";
import qrcode from "qrcode-terminal";
import Pino from "pino";
import chalk from "chalk";
import fs from "fs";
import path from "path";

// ─────────────────────────────────────────────
// ⚙️ Configuration
// ─────────────────────────────────────────────
const SESSION_PATH = "./session";
const STORE_PATH = "./src/database/baileys_store.json";
const BOT_NAME = "Miara Bot 🌸";

// ─────────────────────────────────────────────
// 🧠 Simple Local JSON Store
// ─────────────────────────────────────────────
function createSimpleStore() {
  let data = { chats: {}, contacts: {}, messages: {} };
  return {
    bind: () => {},
    readFromFile(file) {
      try {
        if (fs.existsSync(file))
          data = JSON.parse(fs.readFileSync(file, "utf8"));
      } catch (e) {
        console.error("⚠️ Failed to load store:", e);
      }
    },
    writeToFile(file) {
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
      } catch (e) {
        console.error("⚠️ Failed to write store:", e);
      }
    },
    get data() {
      return data;
    },
  };
}

const logger = Pino({ level: "silent" });
const store = createSimpleStore();
store.readFromFile(STORE_PATH);
setInterval(() => store.writeToFile(STORE_PATH), 10_000);

// ─────────────────────────────────────────────
// 🚀 Start Miara
// ─────────────────────────────────────────────
async function startMiara() {
  console.log(chalk.magenta.bold("🌸 Initializing Miara..."));
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH);
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    logger,
    browser: [BOT_NAME, "Chrome", "7.0.0"],
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    generateHighQualityLinkPreview: true,
  });

  console.log(chalk.green("✅ Miara initialized successfully."));

  // ─────────────────────────────────────────────
  // 🔐 QR Handling with Animation + Cooldown
  // ─────────────────────────────────────────────
  const credsPath = path.join(SESSION_PATH, "creds.json");
  let qrTimeout = null;
  let waitingDots = null;
  let dotCount = 0;
  let showWaiting = false;
  let lastQRTime = 0;
  const QR_DISPLAY_INTERVAL = 60_000; // 1 minute cooldown

  function startWaitingAnimation() {
    if (waitingDots) clearInterval(waitingDots);
    waitingDots = setInterval(() => {
      if (!showWaiting) return;
      dotCount = (dotCount + 1) % 4;
      const dots = ".".repeat(dotCount);
      process.stdout.write(
        `\r${chalk.yellow("⏳ Waiting for connection")}${chalk.gray(dots + "   ")}`
      );
    }, 500);
  }

  function stopWaitingAnimation() {
    if (waitingDots) clearInterval(waitingDots);
    process.stdout.write("\r\x1b[K");
  }

  async function showConnectedAnimation() {
    stopWaitingAnimation();
    const msg = chalk.greenBright("✅ Connected!");
    const spinner = ["|", "/", "-", "\\"];
    for (let i = 0; i < spinner.length * 2; i++) {
      process.stdout.write(`\r${spinner[i % spinner.length]} ${msg}`);
      await new Promise((r) => setTimeout(r, 100));
    }
    process.stdout.write("\r\x1b[K");
    console.log(chalk.greenBright(`✨ ${BOT_NAME} is now active!\n`));
  }

  socket.ev.on("connection.update", (update) => {
    const { qr, connection } = update;

    // 🟢 Connected — stop animations and show spinner
    if (connection === "open") {
      clearTimeout(qrTimeout);
      stopWaitingAnimation();
      showConnectedAnimation();
      return;
    }

    // 🧾 QR display logic — throttled to 1 per minute
    if (!fs.existsSync(credsPath) && qr) {
      const now = Date.now();
      if (now - lastQRTime < QR_DISPLAY_INTERVAL) return;
      lastQRTime = now;

      console.clear();
      console.log(chalk.blue("\n📱 Scan the QR below to connect Miara:\n"));
      qrcode.generate(qr, { small: true });

      clearTimeout(qrTimeout);
      stopWaitingAnimation();
      showWaiting = false;

      // ⏳ Start animated waiting after 10s
      setTimeout(() => {
        showWaiting = true;
        startWaitingAnimation();
      }, 10_000);

      // ⚠️ Expire QR after 60s
      qrTimeout = setTimeout(() => {
        stopWaitingAnimation();
        console.log(chalk.gray("\n⚠️ QR expired — generating new one..."));
        lastQRTime = 0;
      }, QR_DISPLAY_INTERVAL);
    }
  });

  // ─────────────────────────────────────────────
  // 📨 Handle messages
  // ─────────────────────────────────────────────
  socket.ev.on("messages.upsert", async (event) => {
    if (event.type !== "notify" || !event.messages) return;
    try {
      await messageHandler(socket, event, store);
    } catch (e) {
      console.error(chalk.red("❌ Handler error:"), e);
    }
  });

  // ─────────────────────────────────────────────
  // ⚙️ Connection Management
  // ─────────────────────────────────────────────
  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode ||
        lastDisconnect?.error?.message ||
        "unknown";

      stopWaitingAnimation();
      clearTimeout(qrTimeout);

      console.log(chalk.red(`\n⚠️ Connection closed: ${reason}`));

      if (String(reason).includes("401") || String(reason).includes("logged out")) {
        console.log(chalk.red("❌ Session expired — deleting and rescan required."));
        fs.rmSync(SESSION_PATH, { recursive: true, force: true });
        process.exit(0);
      } else {
        console.log(chalk.yellow("♻️ Attempting reconnection..."));
        await new Promise((r) => setTimeout(r, 3000));
        startMiara();
      }
    }
  });

  // ─────────────────────────────────────────────
  // 💾 Auto-save creds
  // ─────────────────────────────────────────────
  socket.ev.on("creds.update", saveCreds);
}

// ─────────────────────────────────────────────
startMiara().catch((e) => console.error(chalk.redBright("🚨 Startup error:"), e));
