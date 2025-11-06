/**
 * 🌸 Miara Handler — Enhanced Build (2025)
 * by MidKnight + GPT-5
 * --------------------------------------------------
 * ✨ Features:
 *  - Dynamic ESM Command Loader (Hot Reload)
 *  - Alias Support (.gpt/.gemini, .wthr/.forecast)
 *  - Built-in .help and .reload
 *  - Owner-only restriction
 *  - Private mode lock
 *  - Anti-spam rate limiter
 *  - Auto-sticker trigger
 */

import chalk from "chalk";
import moment from "moment-timezone";
import fs from "fs";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { config } from "./config.js";
import { smsg } from "./utils/helpers.js";

// 🧠 Command Map
const commands = new Map();
const cooldown = new Map();

/**
 * 📦 Load all commands dynamically from /src/commands
 */
export async function loadCommands() {
  const commandsPath = path.join(process.cwd(), "src", "commands");
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  commands.clear();

  for (const file of files) {
    try {
      // bust module cache for hot reload
      const { default: cmd } = await import(`./commands/${file}?update=${Date.now()}`);
      if (cmd?.name) {
        commands.set(cmd.name, cmd);
        console.log(chalk.greenBright("✅ Loaded command:"), chalk.yellow(cmd.name));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Failed to load ${file}:`), err.message);
    }
  }

  return commands;
}

/**
 * 💬 Main message handler
 */
export async function messageHandler(conn, event, store) {
  const msgObj = event.messages?.[0];
  if (!msgObj?.message || msgObj.key.remoteJid === "status@broadcast") return;

  const m = smsg(conn, msgObj, store);
  const sender = m.sender;
  const from = m.from;
  const text = m.text?.trim() || "";
  const isGroup = m.isGroup;

  const prefix = config.PREFIX || ".";
  const command = text.startsWith(prefix)
    ? text.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const args = text.split(" ").slice(1);
  const reply = msg => conn.sendMessage(from, { text: msg }, { quoted: msgObj });

  // 🧠 Log incoming messages
  console.log(
    chalk.greenBright(`[MSG]`),
    chalk.yellow(isGroup ? `[Group]` : `[DM]`),
    chalk.cyan(sender),
    "→",
    chalk.whiteBright(text || "[media]")
  );

  // 🔒 Private mode lock
  if (config.MODE === "private" && sender !== config.OWNER_NUMBER) {
    if (command) {
      await reply("🔒 Miara is in *private mode*. Only the owner can use commands.");
      return;
    }
  }

  // 📦 Load commands if empty
  if (commands.size === 0) await loadCommands();

  // ⚡ Anti-spam Cooldown (3s)
  if (command) {
    const now = Date.now();
    if (cooldown.has(sender) && now - cooldown.get(sender) < 3000) {
      await reply("⏳ Please wait a few seconds before sending another command.");
      return;
    }
    cooldown.set(sender, now);
  }

  // 🧩 Command Lookup (with alias support)
  const cmd =
    [...commands.values()].find(
      c => c.name === command || c.aliases?.includes(command)
    ) || null;

  // 🚀 Built-in .help Command
  if (command === "help" || command === "menu") {
    const helpText = [...commands.values()]
      .map(c => `• *.${c.name}* — ${c.description || "No description"}`)
      .join("\n");

    await conn.sendMessage(
      from,
      {
        text: `🌸 *${config.BOT_NAME || "Miara Bot"} Commands*\n\n${helpText}\n\n💫 Prefix: ${prefix}`,
      },
      { quoted: m }
    );
    return;
  }

  // ♻️ Built-in .reload Command (Owner Only)
  if (command === "reload" && sender === config.OWNER_NUMBER) {
    try {
      await loadCommands();
      await conn.sendMessage(from, { text: "♻️ Commands reloaded successfully!" }, { quoted: m });
      console.log(chalk.cyan("🔄 Commands reloaded by owner."));
    } catch (err) {
      console.error(chalk.red("Reload failed:"), err);
      await conn.sendMessage(from, { text: "❌ Reload failed. Check console." }, { quoted: m });
    }
    return;
  }

  // 🧩 Execute Found Command
  if (cmd) {
    try {
      // 👑 Owner-only restriction
      if (cmd.category === "owner" && sender !== config.OWNER_NUMBER) {
        await reply("❌ Only the owner can use this command.");
        return;
      }

      console.log(chalk.magentaBright(`⚙️ Executing command:`), chalk.cyan(cmd.name));
      await cmd.execute(conn, m, args, commands, store);
    } catch (err) {
      console.error(chalk.red(`❌ Command ${command} error:`), err);
      await reply(`⚠️ Command error: ${err.message}`);
    }
    return;
  }

  // 🪄 Auto-sticker trigger (if user says "sticker" on an image/video)
  if (
    !command &&
    (msgObj.message.imageMessage || msgObj.message.videoMessage) &&
    text.toLowerCase().includes("sticker")
  ) {
    try {
      const buffer = await downloadMediaMessage(msgObj, "buffer", {}, { logger: console });
      await conn.sendMessage(from, { sticker: buffer });
      await conn.sendMessage(from, { react: { text: "✨", key: msgObj.key } });
    } catch (err) {
      console.error("Auto-sticker error:", err);
    }
  }
}

/**
 * 🕓 Utility: Format uptime
 */
function clockString(ms) {
  const h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
}

/**
 * 🌅 Dynamic Greeting (Optional utility)
 */
function getGreeting() {
  const hour = parseInt(moment().tz("Africa/Nairobi").format("HH"));
  if (hour >= 0 && hour < 4) return "Good Night 🌙 — time to rest and recharge.";
  if (hour >= 4 && hour < 12) return "Good Morning 🌄 — hope your day starts great!";
  if (hour >= 12 && hour < 16) return "Good Afternoon ☀️ — keep up the energy!";
  if (hour >= 16 && hour < 19) return "Good Evening 🌇 — the sun sets, but vibes stay up!";
  return "Good Night 🌙 — don’t forget to dream big.";
}
