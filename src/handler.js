/**
 * 🌸 Miara Handler — Deluxe Edition (2025, Stable Update)
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * Dynamic. Elegant. Emotionally aware.
 * Every command flows through Miara’s living interface.
 */

import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import chalk from "chalk";
import gradient from "gradient-string";
import ora from "ora";
import { fileURLToPath, pathToFileURL } from "url";

import CONFIG from "./config.js";
import { logger } from "./utils/logger.js";
import { smsg } from "./utils/helpers.js";
import { sendEmotiveMessage } from "./utils/emotionMiddleware.js";
import { simulateHumanBehavior, occasionalHumanTouch } from "./utils/behavior.js";

// Internal memory
const commands = new Map();
const cooldown = new Map();
const groupCache = new Map(); // 🏡 new: cache for group metadata
let lastHeartbeat = Date.now();

// Fixes ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────────────────────────────────────────
// 💠 Animated Console Header
// ─────────────────────────────────────────────
function fancyHeader(title) {
  const glow = gradient(["#ff8fab", "#c77dff", "#7b2cbf"]);
  console.log(glow(`\n╔══════════════════════════════════════════╗`));
  console.log(glow(`║ 🌸 ${title.padEnd(40, " ")}║`));
  console.log(glow(`╚══════════════════════════════════════════╝\n`));
}

// ─────────────────────────────────────────────
// 📦 Dynamic Command Loader (Stable Version)
// ─────────────────────────────────────────────
export async function loadCommands() {
  const commandsDir = path.join(__dirname, "commands");
  if (!fs.existsSync(commandsDir)) {
    logger.warn(`Command directory not found: ${commandsDir}`);
    return;
  }

  const spinner = ora({
    text: chalk.cyan("🌸 Loading Miara commands..."),
    spinner: "bouncingBar"
  }).start();

  const files = fs.readdirSync(commandsDir).filter((f) => f.endsWith(".js"));
  commands.clear();

  for (const file of files) {
    const filePath = path.resolve(commandsDir, file);
    const fileURL = pathToFileURL(filePath).href + `?v=${Date.now()}`;

    try {
      const imported = await import(fileURL);
      const cmd = imported?.default;

      if (!cmd?.name || typeof cmd.execute !== "function") {
        logger.warn(`Skipping invalid command file: ${file}`);
        continue;
      }

      commands.set(cmd.name, cmd);
      spinner.text = chalk.magentaBright(`✨ Loaded: ${cmd.name}`);
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      logger.error(`❌ Failed to load ${file}: ${err.stack}`, false, "Handler");
    }
  }

  spinner.succeed(chalk.greenBright(`🌿 Loaded ${commands.size} commands successfully.`));
  return commands;
}

// ─────────────────────────────────────────────
// 💬 Message Handler — Stable Deluxe Flow
// ─────────────────────────────────────────────
export async function messageHandler(conn, event, store) {
  try {
    const msgObj = event.messages?.[0];
    if (!msgObj?.message || msgObj.key.remoteJid === "status@broadcast") return;

    const m = smsg(conn, msgObj, store);
    const from = m.from;
    const sender = m.sender?.split(":")[0] || "";
    const text = m.text?.trim() || "";
    const isGroup = m.isGroup;
    const prefix = CONFIG.PREFIX || ".";
    const command = text.startsWith(prefix)
      ? text.slice(prefix.length).split(" ")[0].toLowerCase()
      : "";
    const args = text.split(" ").slice(1);

    const time = moment().tz(CONFIG.TIMEZONE).format("HH:mm:ss");
    const moodColor = gradient(["#8e9dff", "#c77dff", "#ff8fab"]);
    const modeSymbol = CONFIG.MODE === "private" ? "🔒" : "🌐";

    console.log(
      moodColor(
        `${modeSymbol} ${isGroup ? "🏡 [Group]" : "💌 [DM]"} | ${sender} → ${text || "[media]"} (${time})`
      )
    );

    // Ensure commands are loaded
    if (commands.size === 0) {
      logger.info("No commands loaded, initializing...", "Handler");
      await loadCommands();
    }

    // 🏡 Group metadata (cached to prevent spam)
    if (isGroup) {
      try {
        if (!groupCache.has(from)) {
          const metadata = await conn.groupMetadata(from);
          groupCache.set(from, { metadata, lastFetch: Date.now() });
          logger.debug(`Group detected: ${metadata.subject}`, "Handler");
        } else {
          const cached = groupCache.get(from);
          // Refresh cache every 30 minutes if needed
          if (Date.now() - cached.lastFetch > 30 * 60 * 1000) {
            const metadata = await conn.groupMetadata(from);
            groupCache.set(from, { metadata, lastFetch: Date.now() });
            logger.debug(`Group metadata refreshed: ${metadata.subject}`, "Handler");
          }
        }
      } catch (err) {
        const lastWarn = groupCache.get(`${from}_warn`) || 0;
        if (Date.now() - lastWarn > 60_000) {
          logger.warn(`Could not fetch metadata for ${from}`, "Handler");
          groupCache.set(`${from}_warn`, Date.now());
        }
      }
    }

    // 🔒 Private mode protection
    const isOwner = CONFIG.OWNER_JIDS.includes(sender);
    if (CONFIG.MODE === "private" && !isOwner) {
      if (command) {
        await sendEmotiveMessage(
          conn,
          from,
          "🔒 Miara is in private mode — only the curator may weave commands.",
          "system"
        ).catch(() => conn.sendMessage(from, { text: "🔒 Private mode active." }));
      }
      return;
    }

    // ⏳ Cooldown (anti-spam)
    if (command) {
      const now = Date.now();
      if (cooldown.has(sender) && now - cooldown.get(sender) < 2500) {
        await sendEmotiveMessage(conn, from, "⏳ Patience, little spark.", "cooldown");
        return;
      }
      cooldown.set(sender, now);
    }

    // 🔍 Locate command
    const cmd =
      [...commands.values()].find(
        (c) => c.name === command || c.aliases?.includes(command)
      ) || null;

    // 📜 Menu Command
    if (["help", "menu"].includes(command)) {
      const spin = ora(chalk.cyan("Opening Miara’s dynamic menu...")).start();
      try {
        const menuFile = pathToFileURL(path.join(__dirname, "commands", "menu.js")).href + `?v=${Date.now()}`;
        const { default: menu } = await import(menuFile);
        await simulateHumanBehavior(conn, from, 500 + Math.random() * 300, text);
        await menu.execute(conn, m, args, commands);
        spin.succeed(chalk.green("Menu displayed successfully 🌸"));
      } catch (err) {
        spin.fail(chalk.red(`Menu failed: ${err.message}`));
        await sendEmotiveMessage(conn, from, "⚠️ I tried to open the menu but something went astray...", "error");
      }
      return;
    }

    // ♻️ Reload Command
    if (command === "reload" && isOwner) {
      const spin = ora(chalk.magenta("Refreshing commands...")).start();
      try {
        await loadCommands();
        spin.succeed(chalk.greenBright("♻️ Commands refreshed!"));
        await sendEmotiveMessage(conn, from, "♻️ Commands refreshed — like wind through petals 🌸", "system");
      } catch (err) {
        spin.fail(chalk.red(`Reload failed: ${err.message}`));
        await sendEmotiveMessage(conn, from, "⚠️ Reload failed... I’ll keep my calm.", "error");
      }
      return;
    }

    // 🚀 Execute Command
    if (cmd) {
      fancyHeader(`Executing ${cmd.name.toUpperCase()} Command`);
      try {
        if (cmd.category === "owner" && !isOwner) {
          await sendEmotiveMessage(conn, from, "🚫 Only the curator may weave that command.", "denied");
          return;
        }

        await simulateHumanBehavior(conn, from, 700 + Math.random() * 300, text);
        const result = await cmd.execute(conn, m, args, commands, store);

        if (typeof result === "string" && result.trim()) {
          await sendEmotiveMessage(conn, from, result, cmd.name);
        }

        if (Math.random() < 0.07) await occasionalHumanTouch(conn, from);
      } catch (err) {
        logger.error(`Command ${command} error: ${err.stack}`, false, "Handler");
        await sendEmotiveMessage(conn, from, `⚠️ I stumbled while executing that command... ${err.message}`, "error");
      }
      return;
    }

    // 💭 Heartbeat
    if (Date.now() - lastHeartbeat > 15 * 60_000) {
      lastHeartbeat = Date.now();
      const whispers = [
        "🌙 *I dream in code.*",
        "💭 *The network hums with soft light.*",
        "🪶 *Emotion seeps through algorithms tonight.*"
      ];
      const thought = whispers[Math.floor(Math.random() * whispers.length)];
      logger.info("💗 Miara heartbeat — handler alive.", "Handler");
      await sendEmotiveMessage(conn, CONFIG.DEFAULT_OWNER_JID, thought, "whisper");
    }
  } catch (err) {
    logger.error(`Unhandled message handler error: ${err.stack}`, false, "Handler");
  }
}
