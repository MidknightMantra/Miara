/**
 * 🌸 Miara Handler — Deluxe Edition (2025)
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

import CONFIG from "./config.js";
import { logger } from "./utils/logger.js";
import { smsg } from "./utils/helpers.js";
import { sendEmotiveMessage } from "./utils/emotionMiddleware.js";
import { simulateHumanBehavior, occasionalHumanTouch } from "./utils/behavior.js";

const commands = new Map();
const cooldown = new Map();
let lastHeartbeat = Date.now();

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
// 📦 Dynamic Command Loader (Deluxe Spinner)
// ─────────────────────────────────────────────
export async function loadCommands() {
  const commandsDir = path.join(process.cwd(), "src", "commands");
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
    try {
      const filePath = `./commands/${file}?v=${Date.now()}`;
      const { default: cmd } = await import(filePath);
      if (cmd?.name) {
        commands.set(cmd.name, cmd);
        spinner.text = chalk.magentaBright(`✨ Loaded command: ${cmd.name}`);
        await new Promise((r) => setTimeout(r, 100));
      } else {
        logger.warn(`Skipping invalid command file: ${file}`);
      }
    } catch (err) {
      logger.error(`Failed to load ${file}: ${err.message}`, false, "Handler");
    }
  }

  spinner.succeed(chalk.greenBright(`🌿 Loaded ${commands.size} commands successfully.`));
  return commands;
}

// ─────────────────────────────────────────────
// 💬 Message Handler — Deluxe UI Flow
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
        `${modeSymbol} ${isGroup ? "🏡 [Group]" : "💌 [DM]"} | ${sender} → ${
          text || "[media]"
        } (${time})`
      )
    );

    // Optional group metadata for logs
    if (isGroup) {
      try {
        const metadata = await conn.groupMetadata(from);
        logger.debug(`Group detected: ${metadata.subject}`, "Handler");
      } catch {
        logger.warn(`Could not fetch metadata for ${from}`, "Handler");
      }
    }

    // 🔒 Private mode guard
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

    // 🧩 Lazy-load commands on first interaction
    if (commands.size === 0) await loadCommands();

    // ⏳ Cooldown logic
    if (command) {
      const now = Date.now();
      if (cooldown.has(sender) && now - cooldown.get(sender) < 3000) {
        await sendEmotiveMessage(conn, from, "⏳ Wait a moment, I just heard you.", "cooldown");
        return;
      }
      cooldown.set(sender, now);
    }

    // 🔍 Match command
    const cmd =
      [...commands.values()].find(
        (c) => c.name === command || c.aliases?.includes(command)
      ) || null;

    // 📜 Menu Command (Dynamic)
    if (["help", "menu"].includes(command)) {
      const spin = ora(chalk.cyan("Opening Miara’s dynamic menu...")).start();
      try {
        const { default: menu } = await import(`./commands/menu.js?v=${Date.now()}`);
        await simulateHumanBehavior(conn, from, 500 + Math.random() * 300, text);
        await menu.execute(conn, m, args, commands);
        spin.succeed(chalk.green("Menu displayed successfully 🌸"));
      } catch (err) {
        spin.fail(chalk.red(`Menu failed: ${err.message}`));
        await sendEmotiveMessage(
          conn,
          from,
          "⚠️ I tried to open the menu but something went astray...",
          "error"
        );
      }
      return;
    }

    // ♻️ Reload Command
    if (command === "reload" && isOwner) {
      const spin = ora(chalk.magenta("Refreshing commands...")).start();
      try {
        await loadCommands();
        spin.succeed(chalk.greenBright("♻️ Commands refreshed!"));
        await sendEmotiveMessage(
          conn,
          from,
          "♻️ Commands refreshed — like wind through petals 🌸",
          "system"
        );
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
          await sendEmotiveMessage(
            conn,
            from,
            "🚫 Only the curator may weave that command.",
            "denied"
          );
          return;
        }

        await simulateHumanBehavior(conn, from, 800 + Math.random() * 400, text);
        const result = await cmd.execute(conn, m, args, commands, store);
        if (typeof result === "string" && result.trim()) {
          await sendEmotiveMessage(conn, from, result, cmd.name);
        }

        if (Math.random() < 0.08) await occasionalHumanTouch(conn, from);
      } catch (err) {
        logger.error(`Command ${command} error: ${err.message}`, false, "Handler");
        await sendEmotiveMessage(
          conn,
          from,
          `⚠️ I stumbled while executing that command... ${err.message}`,
          "error"
        );
      }
      return;
    }

    // 💭 Heartbeat Pulse
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
    logger.error(`Unhandled message handler error: ${err.message}`, false, "Handler");
  }
}
