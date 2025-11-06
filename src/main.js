/**
 * 🌸 Miara Bot — Stable Build (Baileys 7.x RC)
 * by MidKnight — 2025
 */

// Import necessary modules using ES6 syntax
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
// ⚙️ Configuration Constants
// ─────────────────────────────────────────────
const CONFIG = {
  SESSION_PATH: "./session",
  STORE_PATH: "./src/database/baileys_store.json",
  BOT_NAME: "Miara Bot 🌸",
  QR_DISPLAY_INTERVAL: 60_000, // 1 minute cooldown for QR regeneration
  QR_EXPIRY_TIME: 60_000,      // Time after which a displayed QR is considered expired
  WAIT_ANIMATION_DELAY: 10_000, // Delay before showing the waiting animation
  RECONNECT_DELAY: 3000,        // Delay before attempting to reconnect
};

// ─────────────────────────────────────────────
// 🧠 Simple Local JSON Store Manager
// ─────────────────────────────────────────────
class SimpleStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = { chats: new Map(), contacts: new Map(), messages: new Map() };
    this.loadFromFile();
  }

  bind(ev) {
    ev.on('chats.upsert', chats => {
      for (const chat of chats) {
        this.data.chats.set(chat.id, chat);
      }
      this.writeToFile();
    });
    ev.on('contacts.upsert', contacts => {
      for (const contact of contacts) {
        this.data.contacts.set(contact.id, contact);
      }
      this.writeToFile();
    });
    ev.on('messages.upsert', ({ messages }) => {
      for (const msg of messages) {
        const jid = msg.key.remoteJid;
        if (!this.data.messages.has(jid)) this.data.messages.set(jid, []);
        this.data.messages.get(jid).push(msg);
      }
      this.writeToFile();
    });
    ev.on('chats.delete', deletions => {
      for (const id of deletions) {
        this.data.chats.delete(id);
      }
      this.writeToFile();
    });
    ev.on('messages.delete', item => {
      const jid = item.keys[0].remoteJid;
      const msgs = this.data.messages.get(jid);
      if (msgs) {
        const newMsgs = msgs.filter(m => !item.keys.find(key => m.key.id === key.id));
        this.data.messages.set(jid, newMsgs);
      }
      this.writeToFile();
    });
    // Add more event handlers as needed (e.g., 'groups.upsert')
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, "utf8");
        const parsed = JSON.parse(fileContent);
        this.data.chats = new Map(Object.entries(parsed.chats || {}));
        this.data.contacts = new Map(Object.entries(parsed.contacts || {}));
        this.data.messages = new Map(Object.entries(parsed.messages || {}).map(([k, v]) => [k, v]));
        console.log(chalk.green(`✅ Store loaded from ${this.filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Store file ${this.filePath} not found, starting fresh.`));
      }
    } catch (e) {
      console.error(chalk.red(`⚠️ Failed to load store from ${this.filePath}:`), e.message);
      this.data = { chats: new Map(), contacts: new Map(), messages: new Map() };
    }
  }

  writeToFile() {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      const serializable = {
        chats: Object.fromEntries(this.data.chats),
        contacts: Object.fromEntries(this.data.contacts),
        messages: Object.fromEntries(this.data.messages),
      };
      fs.writeFileSync(this.filePath, JSON.stringify(serializable, null, 2));
    } catch (e) {
      console.error(chalk.red(`⚠️ Failed to write store to ${this.filePath}:`), e.message);
    }
  }

  scheduleWriteToFile(intervalMs = 10_000) {
    const interval = setInterval(() => {
      this.writeToFile();
    }, intervalMs);
    return interval;
  }
}

// ─────────────────────────────────────────────
// 🚀 Miara Connection Manager
// ─────────────────────────────────────────────
class MiaraManager {
  constructor() {
    this.socket = null;
    this.qrTimeout = null;
    this.waitingDotsInterval = null;
    this.dotCount = 0;
    this.showWaiting = false;
    this.lastQRTime = 0;
    this.store = null;
    this.storeSaveInterval = null;
  }

  async start() {
    console.log(chalk.magenta.bold("🌸 Initializing Miara..."));

    try {
      // 1. Setup Authentication State
      const { state, saveCreds } = await useMultiFileAuthState(CONFIG.SESSION_PATH);

      // 2. Fetch Latest Baileys Version
      const { version } = await fetchLatestBaileysVersion();
      console.log(chalk.blue(`📡 Using Baileys version: ${version.join(".")}`));

      // 3. Initialize Store
      this.store = new SimpleStore(CONFIG.STORE_PATH);
      this.storeSaveInterval = this.store.scheduleWriteToFile(10_000); // Save every 10 seconds

      // 4. Create Socket Connection
      this.socket = makeWASocket({
        version,
        logger: Pino({ level: "silent" }), // Adjust log level if needed for debugging
        browser: [CONFIG.BOT_NAME, "Chrome", "7.0.0"],
        printQRInTerminal: false, // We handle QR manually
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "silent" })),
        },
        generateHighQualityLinkPreview: true,
      });

      // Bind store to socket events
      this.store.bind(this.socket.ev);

      console.log(chalk.green("✅ Miara socket initialized."));

      // 5. Register Event Listeners
      this.registerEventListeners(saveCreds);

      console.log(chalk.green("✅ Miara initialized successfully. Waiting for connection...\n"));

    } catch (error) {
      console.error(chalk.redBright("🚨 Startup error:"), error);
      process.exit(1); // Exit the process on startup failure
    }
  }

  registerEventListeners(saveCreds) {
    const credsPath = path.join(CONFIG.SESSION_PATH, "creds.json");

    // Handle connection updates (including QR code generation and connection status)
    this.socket.ev.on("connection.update", (update) => {
      const { qr, connection, lastDisconnect } = update;

      // --- Handle Open Connection ---
      if (connection === "open") {
        this.handleConnectionOpen();
        return;
      }

      // --- Handle QR Code Generation (if needed) ---
      if (!fs.existsSync(credsPath) && qr) {
        this.handleQRGeneration(qr);
      }

      // --- Handle Closed Connection ---
      if (connection === "close") {
        this.handleConnectionClose(lastDisconnect);
      }
    });

    // Handle incoming messages
    this.socket.ev.on("messages.upsert", async (event) => {
      if (event.type !== "notify" || !event.messages) return;
      try {
        await messageHandler(this.socket, event, this.store);
      } catch (e) {
        console.error(chalk.red("❌ Handler error:"), e);
      }
    });

    // Save credentials when updated
    this.socket.ev.on("creds.update", saveCreds);
  }

  handleConnectionOpen() {
    this.clearTimersAndIntervals();
    this.showConnectedAnimation();
  }

  async showConnectedAnimation() {
    this.stopWaitingAnimation();
    const msg = chalk.greenBright("✅ Connected!");
    const spinner = ["|", "/", "-", "\\"];
    for (let i = 0; i < spinner.length * 2; i++) {
      process.stdout.write(`\r${spinner[i % spinner.length]} ${msg}`);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    process.stdout.write("\r\x1b[K"); // Clear line
    console.log(chalk.greenBright(`\n✨ ${CONFIG.BOT_NAME} is now active!\n`));
  }

  handleQRGeneration(qr) {
    const now = Date.now();
    // Throttle QR display: only show if enough time has passed since the last one
    if (now - this.lastQRTime < CONFIG.QR_DISPLAY_INTERVAL) {
      // console.log("QR display throttled.");
      return;
    }
    this.lastQRTime = now;

    console.clear();
    console.log(chalk.blue("\n📱 Scan the QR below to connect Miara:\n"));
    qrcode.generate(qr, { small: true }); // Display QR code

    this.clearTimersAndIntervals(); // Stop any previous animations/timers
    this.showWaiting = false; // Reset waiting flag

    // Start waiting animation after a delay
    setTimeout(() => {
      this.showWaiting = true;
      this.startWaitingAnimation();
    }, CONFIG.WAIT_ANIMATION_DELAY);

    // Set timeout for QR expiry
    this.qrTimeout = setTimeout(() => {
      this.stopWaitingAnimation();
      console.log(chalk.gray("\n⚠️ QR expired — generating new one..."));
      this.lastQRTime = 0; // Allow a new QR to be displayed immediately after expiry
    }, CONFIG.QR_EXPIRY_TIME);
  }

  startWaitingAnimation() {
    if (this.waitingDotsInterval) clearInterval(this.waitingDotsInterval);
    this.waitingDotsInterval = setInterval(() => {
      if (!this.showWaiting) return;
      this.dotCount = (this.dotCount + 1) % 4;
      const dots = ".".repeat(this.dotCount);
      process.stdout.write(
        `\r${chalk.yellow("⏳ Waiting for connection")}${chalk.gray(dots + "   ")}`
      );
    }, 500);
  }

  stopWaitingAnimation() {
    if (this.waitingDotsInterval) {
      clearInterval(this.waitingDotsInterval);
      this.waitingDotsInterval = null;
    }
    process.stdout.write("\r\x1b[K"); // Clear the line
  }

  handleConnectionClose(lastDisconnect) {
    this.clearTimersAndIntervals(); // Ensure all timers/intervals are cleared

    const reason =
      lastDisconnect?.error?.output?.statusCode ||
      lastDisconnect?.error?.message ||
      "unknown";

    console.log(chalk.red(`\n⚠️ Connection closed: ${reason}`));

    // Check for session expiry (401 Unauthorized or similar)
    if (String(reason).includes("401") || String(reason).includes("logged out")) {
      console.log(chalk.red("❌ Session expired — deleting session data and exiting. Rescan required."));
      fs.rmSync(CONFIG.SESSION_PATH, { recursive: true, force: true });
      process.exit(0); // Exit cleanly to require rescan
    } else {
      // Attempt to reconnect
      console.log(chalk.yellow("♻️ Attempting reconnection..."));
      setTimeout(() => {
        // Recursively call start to restart the connection process
        this.start().catch((e) => console.error(chalk.redBright("🚨 Reconnect startup error:"), e));
      }, CONFIG.RECONNECT_DELAY);
    }
  }

  clearTimersAndIntervals() {
    if (this.qrTimeout) clearTimeout(this.qrTimeout);
    this.qrTimeout = null;
    this.stopWaitingAnimation();
    if (this.storeSaveInterval) clearInterval(this.storeSaveInterval);
    this.storeSaveInterval = null;
  }
}

// ─────────────────────────────────────────────
// 🌱 Start the application
// ─────────────────────────────────────────────
const miara = new MiaraManager();
miara.start().catch((e) => console.error(chalk.redBright("🚨 Startup error:"), e));