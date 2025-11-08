/**
 * 🌸 Miara-AI — Guru Hybrid Menu (2025 Edition, Baileys 7.x)
 * ------------------------------------------------------------
 * Fully compatible with Baileys 7.0.0-rc6
 * Dynamic, text-based, aesthetic menu generator.
 *
 * by MidKnightMantra 🌸 | Stabilized for 7.x by GPT-5
 */

import fs from "fs/promises";
import moment from "moment-timezone";
import { getPlatform } from "../utils/helpers.js";
import CONFIG from "../config.js";

// 🌅 Greeting by time
function greetingByTime() {
  const hour = parseInt(moment().tz(CONFIG.TIMEZONE || "Africa/Nairobi").format("HH"));
  if (hour < 4) return "Good Night 🌙";
  if (hour < 12) return "Good Morning 🌄";
  if (hour < 16) return "Good Afternoon ☀️";
  if (hour < 19) return "Good Evening 🌇";
  return "Good Night 🌌";
}

// 🕒 Format uptime
function formatUptime(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms / 60000) % 60);
  const s = Math.floor((ms / 1000) % 60);
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

const QUOTES = [
  "I'm not lazy, I'm just on my energy-saving mode ⚡",
  "Life is short, smile while you still have teeth 😁",
  "Dream in code, live in flow 🌸",
  "Breathe. Debug. Build. Repeat 🧘",
  "Why debug when you can vibe? 🎶",
  "Behind every bot is a sleep-deprived human ☕",
  "Simplicity is the soul of efficiency 🌿"
];

export default {
  name: "menu",
  aliases: ["help", "h"],
  description: "Display Miara’s dynamic hybrid command menu 🌸",
  category: "general",
  usage: ".menu",

  async execute(conn, m, args, commands) {
    try {
      // 🪶 Resolve sender & chat IDs (Baileys 7.x safe)
      const chatId = m.key.remoteJid;
      const sender =
        m.key.participant || m.key.remoteJid || m.pushName || "unknown@user";
      const userTag = "@" + sender.split("@")[0];

      const BOT_NAME = CONFIG.BOT_NAME || "Miara🌸";
      const OWNER_NAME = CONFIG.OWNER_NAME || "MidKnightMantra";
      const TIMEZONE = CONFIG.TIMEZONE || "Africa/Nairobi";
      const PREFIX = CONFIG.PREFIX || ".";
      const PLATFORM = getPlatform();

      // 🕰️ Time and System Info
      const now = moment().tz(TIMEZONE);
      const date = now.format("dddd, MMMM Do YYYY");
      const time = now.format("HH:mm:ss");
      const day = now.format("dddd");
      const uptime = formatUptime(process.uptime() * 1000);

      // 🧩 Database metrics
      const users = Object.values(global.db?.data?.users || {});
      const totalUsers = users.length;
      const registered = users.filter((u) => u.registered).length;

      const greet = greetingByTime();
      const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

      const categoryEmojis = {
        general: "🌸",
        media: "🎞️",
        info: "📘",
        utility: "🧰",
        fun: "🎭",
        owner: "👑",
        ai: "🤖",
        system: "⚙️",
        misc: "✨"
      };

      // 🪷 Handle command structure (Map, array, or object)
      const grouped = {};
      const entries =
        commands instanceof Map
          ? [...commands.values()]
          : Array.isArray(commands)
          ? commands
          : Object.values(commands || {});

      for (const cmd of entries) {
        const cat = cmd.category?.toLowerCase() || "misc";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(cmd);
      }

      // 📖 Build text output
      let commandList = "";
      for (const [cat, cmds] of Object.entries(grouped)) {
        commandList += `\n${categoryEmojis[cat] || "🌸"} *${cat.toUpperCase()}*\n`;
        for (const cmd of cmds.sort((a, b) => a.name.localeCompare(b.name))) {
          commandList += `  • *${PREFIX}${cmd.name}* — ${
            cmd.description || "No description"
          }\n`;
        }
      }

      const more = String.fromCharCode(8206);
      const readMore = more.repeat(850);

      const menuText = `
╭━━━⊰ *${BOT_NAME}* ⊱━━━╮
┃ 👋 Hello, ${userTag}!
┃ ${greet}
┃
┃ 📜 *"${quote}"*
┃
╰━━━━━━━━━━━━━━━╯

╭━━━⊰ *📅 TODAY* ⊱━━━╮
┃ 📆 *Date:* ${date}
┃ ⏰ *Time:* ${time}
┃ 🕒 *Day:* ${day}
╰━━━━━━━━━━━━━━━╯

╭━━━⊰ *🤖 BOT INFO* ⊱━━━╮
┃ 🌸 *Bot:* ${BOT_NAME}
┃ 👑 *Owner:* ${OWNER_NAME}
┃ 💻 *Platform:* ${PLATFORM}
┃ ⌨️ *Prefix:* ${PREFIX}
┃ ⏱️ *Uptime:* ${uptime}
┃ 📊 *Users:* ${totalUsers}
┃ 🗂️ *Registered:* ${registered}
╰━━━━━━━━━━━━━━━╯

╭━━━⊰ *COMMANDS* ⊱━━━╮
${commandList.trim()}
╰━━━━━━━━━━━━━━━╯

${readMore}
🌸 Prefix: *${PREFIX}*
💬 Example: *${PREFIX}ping* or *${PREFIX}ai Hello!*

© 2025 *${BOT_NAME}* | *${OWNER_NAME}*
      `.trim();

      // 🌺 Send menu with or without image
      let logo;
      try {
        logo = await fs.readFile("./assets/menu.jpg");
      } catch {
        logo = null;
      }

      const payload = logo
        ? { image: logo, caption: menuText, mentions: [sender] }
        : { text: menuText, mentions: [sender] };

      await conn.sendMessage(chatId, payload, { quoted: m });
      await conn.sendMessage(chatId, { react: { text: "🌸", key: m.key } });
    } catch (err) {
      console.error("❌ Menu Error:", err);
      await conn.sendMessage(m.key.remoteJid, {
        text: `⚠️ Failed to render menu.\n${err.message}`
      });
    }
  }
};
