/**
 * 🌸 Miara-AI — Guru Hybrid Menu (2025 Edition)
 * ----------------------------------------------
 * Combines Guru’s poetic flow + Miara’s dynamic intelligence 🌺
 * No buttons. All text. Fully dynamic.
 * by MidKnightMantra
 */

import fs from "fs/promises";
import moment from "moment-timezone";
import { getPlatform } from "../utils/helpers.js";
import { config } from "../config.js";

// 🌅 Greeting by time
function ucapan() {
  const hour = parseInt(moment().tz(config.TIMEZONE || "Africa/Nairobi").format("HH"));
  if (hour >= 0 && hour < 4) return "Good Night 🌙";
  if (hour >= 4 && hour < 12) return "Good Morning 🌄";
  if (hour >= 12 && hour < 16) return "Good Afternoon ☀️";
  if (hour >= 16 && hour < 19) return "Good Evening 🌇";
  return "Good Night 🌌";
}

// 🕒 Format uptime
function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms / 60000) % 60);
  const s = Math.floor((ms / 1000) % 60);
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

// 💬 Playful quotes
const quotes = [
  "I'm not lazy, I'm just on my energy-saving mode ⚡",
  "Life is short, smile while you still have teeth 😁",
  "I may be a bad influence, but darn I’m fun 🎭",
  "Dream in code, live in flow 🌸",
  "Breathe. Debug. Build. Repeat 🧘",
  "Simplicity is the soul of efficiency 🌿",
  "Why debug when you can vibe? 🎶",
  "Code like poetry, deploy like chaos 💫",
  "Behind every bot is a sleep-deprived human ☕",
];

export default {
  name: "menu",
  alias: ["help", "h"],
  description: "Show Miara’s full Guru-style deluxe menu 🌸",
  category: "general",
  usage: ".menu",

  async execute(conn, m, args, commands) {
    try {
      const BOT_NAME = config.BOT_NAME || "Miara🌸";
      const OWNER_NAME = config.OWNER_NAME || "MidKnightMantra";
      const TIMEZONE = config.TIMEZONE || "Africa/Nairobi";
      const PREFIX = config.PREFIX || ".";
      const PLATFORM = getPlatform();

      const d = new Date();
      const locale = "en";
      const week = d.toLocaleDateString(locale, { weekday: "long" });
      const date = moment().tz(TIMEZONE).format("dddd, MMMM Do YYYY");
      const time = moment().tz(TIMEZONE).format("HH:mm:ss");
      const uptime = clockString(process.uptime() * 1000);
      const totalUsers = Object.values(global.db?.data?.users || {}).length;
      const registered = Object.values(global.db?.data?.users || {}).filter((u) => u.registered).length;
      const greeting = ucapan();
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      const userTag = "@" + m.sender.split("@")[0];

      // 🌸 Emoji by category
      const categoryEmojis = {
        general: "🌸",
        media: "🎞️",
        info: "📘",
        utility: "🧰",
        fun: "🎭",
        owner: "👑",
        ai: "🤖",
        system: "⚙️",
        misc: "✨",
      };

      // 🧩 Group commands by category
      const grouped = {};
      for (const [name, cmd] of commands) {
        const cat = cmd.category?.toLowerCase() || "misc";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(cmd);
      }

      // 📖 Build command list
      let commandList = "";
      for (const [cat, cmds] of Object.entries(grouped)) {
        commandList += `\n${categoryEmojis[cat] || "🌸"} *${cat.toUpperCase()}*\n`;
        for (const cmd of cmds.sort((a, b) => a.name.localeCompare(b.name))) {
          commandList += `  • *${PREFIX}${cmd.name}* — ${cmd.description || "No description"}\n`;
        }
      }

      const more = String.fromCharCode(8206);
      const readMore = more.repeat(850);

      // 🌼 Final Menu Layout (Guru + Miara Fusion)
      const menuText = `
╭━━━⊰ *${BOT_NAME}* ⊱━━━╮
┃ 👋 Hello, ${userTag}!
┃ ${greeting}
┃
┃ 📜 *"${quote}"*
┃
╰━━━━━━━━━━━━━━━╯

╭━━━⊰ *📅 TODAY* ⊱━━━╮
┃ 📆 *Date:* ${date}
┃ ⏰ *Time:* ${time}
┃ 🕒 *Day:* ${week}
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
💬 Example: *${PREFIX}weather Nairobi* or *${PREFIX}tts en Hello World*

© 2025 *${BOT_NAME}* | *${OWNER_NAME}*
`;

      // 🌺 Use local image
      const logo = await fs.readFile("./assets/menu.jpg");

      await conn.sendMessage(
        m.chat,
        {
          image: logo,
          caption: menuText,
          mentions: [m.sender],
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: "🌸", key: m.key } });
    } catch (e) {
      console.error("❌ Menu Error:", e);
      await conn.sendMessage(
        m.chat,
        { text: `⚠️ Failed to load Miara’s menu.\n${e.message}` },
        { quoted: m }
      );
    }
  },
};
