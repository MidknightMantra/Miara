import moment from "moment-timezone";
import { config } from "../config.js";

export default {
  name: "ping",
  description: "Check Miara’s speed, uptime, and system info.",
  category: "utility",
  usage: ".ping",

  async execute(conn, m) {
    const start = Date.now();
    await conn.sendMessage(m.from, { text: "🏃 Pinging..." }, { quoted: m.message });
    const latency = Date.now() - start;
    const now = moment().tz("Africa/Nairobi");
    const uptime = process.uptime();
    const BOT_NAME = config.BOT_NAME || "Miara🌸";

    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const replyMsg = `
✨ *${BOT_NAME}*
⚡ *Speed:* ${latency}ms
🕒 *Uptime:* ${hours}h ${minutes}m ${seconds}s
📅 *Date:* ${now.format("dddd, MMMM Do YYYY")}
🕐 *Time:* ${now.format("HH:mm:ss")}
`;

    await conn.sendMessage(m.from, { text: replyMsg }, { quoted: m.message });
    await conn.sendMessage(m.from, { react: { text: "💫", key: m.message.key } });
  },
};