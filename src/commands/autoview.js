/**
 * 👁️ Miara Command: Auto View Status — “Silent Observer (Amethyst Mode)” (2025)
 * -------------------------------------------------------------------------------
 * Automatically views WhatsApp statuses and reacts with context-aware purple emojis.
 * Elegant, empathetic, and alive.
 *
 * by MidKnightMantra × GPT-5
 */

import chalk from "chalk";
import { logger } from "../utils/logger.js";
import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "config", "autoview.json");

const defaultConfig = {
  enabled: false,
  emoji: "💜", // Default purple
  smart: true // Context-aware reaction mode
};

function ensureConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH));
}

function saveConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

// 🌈 Contextual reaction logic
function getSmartReaction(message) {
  const fallback = "💜";
  if (!message) return fallback;

  // Analyze based on MIME type or text
  const mimetype = message.message?.videoMessage
    ? "video"
    : message.message?.imageMessage
    ? "image"
    : message.message?.audioMessage
    ? "audio"
    : message.message?.conversation
    ? "text"
    : "other";

  const text = (
    message.message?.conversation ||
    message.message?.imageMessage?.caption ||
    message.message?.videoMessage?.caption ||
    ""
  ).toLowerCase();

  if (mimetype === "video") return text.includes("music") ? "🎧" : "🔮";
  if (mimetype === "image") {
    if (text.includes("selfie") || text.includes("me")) return "💫";
    if (text.includes("sunset") || text.includes("sky")) return "🌸";
    if (text.includes("meme") || text.includes("haha")) return "😹";
    return "💜";
  }
  if (mimetype === "audio") return "🎧";
  if (mimetype === "text") {
    if (text.includes("love") || text.includes("miss")) return "💜";
    if (text.includes("quote") || text.includes("life")) return "💭";
    if (text.includes("funny") || text.includes("lol")) return "😹";
    return "💜";
  }

  return fallback;
}

// ─────────────────────────────────────────────
// 🧠 Command Definition
// ─────────────────────────────────────────────
export default {
  name: "autoview",
  aliases: ["statusview", "ghost", "autoeye"],
  description: "Automatically view statuses and react with purple emojis 👁️💜",
  category: "automation",
  usage: ".autoview <on/off> [emoji]",

  async execute(conn, m, args) {
    const from = m.key.remoteJid;
    const config = ensureConfig();

    if (!args.length) {
      const status = config.enabled ? "✅ Enabled" : "❌ Disabled";
      const emoji = config.emoji;
      const smart = config.smart ? "🧠 Context Mode: ON" : "🧠 Context Mode: OFF";
      await conn.sendMessage(
        from,
        {
          text: `👁️ *Auto View Status (Amethyst Mode)*\n\nStatus: ${status}\nEmoji: ${emoji}\n${smart}\n\nUsage:\n.autoview on 💜\n.autoview off`
        },
        { quoted: m }
      );
      return;
    }

    const arg = args[0].toLowerCase();

    if (arg === "on") {
      config.enabled = true;
      if (args[1]) config.emoji = args[1];
      saveConfig(config);
      await conn.sendMessage(
        from,
        { text: `✅ Auto-view enabled.\nMiara will now view and react to statuses with ${config.emoji} (Amethyst Mode).` },
        { quoted: m }
      );
      logger.info("👁️ Auto-view enabled.", "AutoView");
    } else if (arg === "off") {
      config.enabled = false;
      saveConfig(config);
      await conn.sendMessage(
        from,
        { text: "🚫 Auto-view disabled. Miara will stop watching statuses." },
        { quoted: m }
      );
      logger.info("❌ Auto-view disabled.", "AutoView");
    } else {
      await conn.sendMessage(
        from,
        { text: "Usage: `.autoview on 💜` or `.autoview off`" },
        { quoted: m }
      );
    }
  }
};

// ─────────────────────────────────────────────
// 👁️ Status Auto-Viewer (hooked from main.js)
// ─────────────────────────────────────────────
let cooldowns = new Map();

export async function handleStatusUpdate(conn, updates) {
  const config = ensureConfig();
  if (!config.enabled) return;

  for (const update of updates) {
    try {
      const jid = update?.key?.participant || update?.key?.remoteJid;
      const id = update?.key?.id;

      if (!jid || !id || !update?.message) continue;

      // Prevent reacting twice within 15 seconds
      const now = Date.now();
      if (cooldowns.has(jid) && now - cooldowns.get(jid) < 15000) continue;
      cooldowns.set(jid, now);

      await conn.readMessages([{ remoteJid: jid, id }]);

      const emoji = config.smart ? getSmartReaction(update) : config.emoji || "💜";

      await conn.sendMessage(jid, {
        react: { text: emoji, key: update.key }
      });

      logger.info(`👁️ Viewed ${jid} → reacted with ${emoji}`, "AutoView");
    } catch (err) {
      logger.warn(`AutoView failed: ${err.message}`, "AutoView");
    }
  }
}
