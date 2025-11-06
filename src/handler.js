/**
 * 🌸 Miara Handler — Command System (2025)
 * by MidKnightMantra
 * --------------------------------------------------
 * Dynamic, stable, and fully modular.
 * Commands are loaded from /src/commands — including sticker.js.
 */

import chalk from "chalk";
import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import { config } from "./config.js";
import { smsg } from "./utils/helpers.js";
import { sendEmotiveMessage } from "./utils/emotionMiddleware.js";
import { simulateHumanBehavior, occasionalHumanTouch } from "./utils/behavior.js";

const commands = new Map();
const cooldown = new Map();

/**
 * 📦 Dynamic Command Loader
 */
export async function loadCommands() {
  const commandsPath = path.join(process.cwd(), "src", "commands");
  const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));
  commands.clear();

  for (const file of files) {
    try {
      const { default: cmd } = await import(`./commands/${file}?v=${Date.now()}`);
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
 * 💬 Main Message Handler
 */
export async function messageHandler(conn, event, store) {
  const msgObj = event.messages?.[0];
  if (!msgObj?.message || msgObj.key.remoteJid === "status@broadcast") return;

  const m = smsg(conn, msgObj, store);
  const from = m.from;
  const sender = m.sender;
  const text = m.text?.trim() || "";
  const isGroup = m.isGroup;
  m.chat = from || msgObj.key.remoteJid;

  const prefix = config.PREFIX || ".";
  const command = text.startsWith(prefix)
    ? text.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const args = text.split(" ").slice(1);

  const now = moment().tz("Africa/Nairobi").format("HH:mm:ss");
  console.log(
    chalk.greenBright(`[${now}]`),
    chalk.yellow(isGroup ? "🏡 [Group]" : "💌 [DM]"),
    chalk.cyan(sender),
    "→",
    chalk.whiteBright(text || "[media]")
  );

  // 🏡 Group Metadata Log
  if (isGroup) {
    try {
      const metadata = await conn.groupMetadata(from);
      console.log(chalk.magentaBright(`🌸 Group:`), chalk.cyan(metadata.subject));
    } catch {
      console.warn(chalk.gray(`⚠️ Could not fetch group metadata for ${from}`));
    }
  }

  // 🔒 Private Mode Restriction
  if (config.MODE === "private" && sender !== config.OWNER_NUMBER) {
    if (command) {
      await sendEmotiveMessage(
        conn,
        from,
        "🔒 Miara is in *private mode*. Only the owner can use commands.",
        "system"
      );
      return;
    }
  }

  // 🧠 Load commands if not yet loaded
  if (commands.size === 0) await loadCommands();

  // ⏳ Simple cooldown (3s)
  if (command) {
    const now = Date.now();
    if (cooldown.has(sender) && now - cooldown.get(sender) < 3000) {
      await sendEmotiveMessage(conn, from, "⏳ A moment, please... I just heard you.", "cooldown");
      return;
    }
    cooldown.set(sender, now);
  }

  // 🔍 Locate Command (name or alias)
  const cmd =
    [...commands.values()].find(
      (c) => c.name === command || c.aliases?.includes(command)
    ) || null;

  // 🌸 Dynamic Menu Loader
  if (command === "help" || command === "menu") {
    try {
      const { default: menu } = await import(`./commands/menu.js?v=${Date.now()}`);
      console.log(chalk.blueBright("📖 Displaying Miara menu..."));
      await simulateHumanBehavior(conn, from, 400 + Math.random() * 400, text);
      await menu.execute(conn, m, args, commands);
      return;
    } catch (err) {
      console.error(chalk.red("❌ Menu load failed:"), err);
      await sendEmotiveMessage(conn, from, "⚠️ I tried to open the menu but something went astray...", "error");
      return;
    }
  }

  // ♻️ Reload (Owner Only)
  if (command === "reload" && sender === config.OWNER_NUMBER) {
    try {
      await loadCommands();
      await sendEmotiveMessage(
        conn,
        from,
        "♻️ Commands refreshed — like wind through petals 🌸",
        "system"
      );
      console.log(chalk.cyan("🔄 Commands reloaded by owner."));
    } catch (err) {
      console.error(chalk.red("Reload failed:"), err);
      await sendEmotiveMessage(conn, from, "⚠️ Reload failed... I’ll keep my calm.", "error");
    }
    return;
  }

  // 🚀 Execute Command Normally
  if (cmd) {
    try {
      if (cmd.category === "owner" && sender !== config.OWNER_NUMBER) {
        await sendEmotiveMessage(conn, from, "🚫 Only the curator may weave that command.", "denied");
        return;
      }

      console.log(chalk.magentaBright(`⚙️ Executing:`), chalk.cyan(cmd.name));
      await simulateHumanBehavior(conn, from, 800 + Math.random() * 400, text);

      const result = await cmd.execute(conn, { ...m, chat: m.chat }, args, commands, store);
      if (typeof result === "string" && result.trim().length > 0)
        await sendEmotiveMessage(conn, from, result, cmd.name);

      // 🩵 Occasional alive behavior
      if (Math.random() < 0.08) await occasionalHumanTouch(conn, from);
    } catch (err) {
      console.error(chalk.red(`❌ Command ${command} error:`), err);
      await sendEmotiveMessage(
        conn,
        from,
        `⚠️ I stumbled while executing that command... ${err.message}`,
        "error"
      );
    }
    return;
  }
}
