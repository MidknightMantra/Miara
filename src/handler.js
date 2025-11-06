/**
 * 🌸 Miara Handler
 * MidKnight Mantra
 */

import chalk from "chalk";
import moment from "moment-timezone";
import os from "os";
import fs from "fs";
import path from "path";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { config } from "./config.js";
import { smsg, sleep } from "./utils/helpers.js";

// Command Map
const commands = new Map();

/**
 * 📦 Load all commands from /src/commands
 */
async function loadCommands() {
  const commandsPath = path.join(process.cwd(), "src", "commands");
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    try {
      const { default: cmd } = await import(`./commands/${file}`);
      if (cmd?.name) {
        commands.set(cmd.name, cmd);
        console.log(chalk.greenBright(`✅ Loaded command:`), chalk.yellow(cmd.name));
      }
    } catch (err) {
      console.error(chalk.red(`❌ Failed to load ${file}:`), err);
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

  // 📦 Lazy-load commands only once
  if (commands.size === 0) await loadCommands();

  // 🧩 Handle known commands
  if (commands.has(command)) {
    try {
      const cmd = commands.get(command);

      // 👑 Owner-only restriction
      if (cmd.category === "owner" && sender !== config.OWNER_NUMBER) {
        await reply("❌ Only the owner can use this command.");
        return;
      }

      await cmd.execute(conn, m, args, commands, store);
    } catch (err) {
      console.error(chalk.red(`❌ Command ${command} error:`), err);
      await reply(`⚠️ Command error: ${err.message}`);
    }
    return;
  }

  // 🪄 Auto-sticker trigger (if image/video & text contains "sticker")
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
 * 🕓 Utility: format uptime
 */
function clockString(ms) {
  const h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
}

/**
 * 🌅 Dynamic greeting
 */
function getGreeting() {
  const hour = parseInt(moment().tz("Africa/Nairobi").format("HH"));
  if (hour >= 0 && hour < 4) return "Good Night 🌙 — time to rest and recharge.";
  if (hour >= 4 && hour < 12) return "Good Morning 🌄 — hope your day starts great!";
  if (hour >= 12 && hour < 16) return "Good Afternoon ☀️ — keep up the energy!";
  if (hour >= 16 && hour < 19) return "Good Evening 🌇 — the sun sets, but vibes stay up!";
  return "Good Night 🌙 — don’t forget to dream big.";
}

export { commands, loadCommands };
