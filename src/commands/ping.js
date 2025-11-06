/**
 * ⚡ Miara Command: Ping
 * Checks bot speed, uptime, and system performance
 */

import moment from "moment-timezone";
import os from "os";
import { config } from "../config.js";

export default {
  name: "ping",
  description: "Check Miara’s speed, uptime, and system performance.",
  category: "utility",
  usage: ".ping",

  async execute(conn, m) {
    const start = Date.now();

    // React early to indicate processing
    await conn.sendMessage(m.from, { react: { text: "🏃", key: m.key } });
    await conn.sendMessage(m.from, { text: "🏃 Pinging..." }, { quoted: m });

    const latency = Date.now() - start;
    const now = moment().tz("Africa/Nairobi");
    const uptime = process.uptime();
    const BOT_NAME = config.BOT_NAME || "Miara 🌸";

    // Format uptime
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // 🧠 Memory info
    const totalMem = os.totalmem() / (1024 * 1024); // in MB
    const freeMem = os.freemem() / (1024 * 1024);
    const usedMem = totalMem - freeMem;
    const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

    // 🧩 CPU info
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || "Unknown CPU";
    const cpuCores = cpus.length;
    const loadAvg = os.loadavg()[0].toFixed(2);

    const replyMsg = `
✨ *${BOT_NAME} Status*
⚡ *Speed:* ${latency}ms
🕒 *Uptime:* ${hours}h ${minutes}m ${seconds}s
🧠 *Memory:* ${usedMem.toFixed(0)}MB / ${totalMem.toFixed(0)}MB (${memPercent}% used)
🧩 *CPU:* ${cpuModel} (${cpuCores} cores)
📊 *Load Avg:* ${loadAvg}
📅 *Date:* ${now.format("dddd, MMMM Do YYYY")}
🕐 *Time:* ${now.format("HH:mm:ss")}
    `.trim();

    await conn.sendMessage(m.from, { text: replyMsg }, { quoted: m });

    // React with sparkle emoji when done
    await conn.sendMessage(m.from, { react: { text: "💫", key: m.key } });

    console.log(`✅ Ping executed: ${latency}ms | ${usedMem.toFixed(0)}MB used`);
  },
};
