/**
 * ⚡ Miara Command: Advanced Ping (Lite Edition, 2025)
 * ---------------------------------------------------
 * Performance and health diagnostic for Miara:
 * - Response latency
 * - CPU & memory usage
 * - Uptime, load average, platform info
 *
 * by MidKnightMantra 🌸 | Refined by GPT-5
 */

import os from "os";
import moment from "moment-timezone";
import { config } from "../config.js";
import { getPlatform, safeReact, safeQuoted } from "../utils/helpers.js";

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
}

export default {
  name: "ping",
  aliases: ["speed", "net"],
  description: "Check Miara’s response speed, uptime, and system performance ⚡",
  category: "utility",
  usage: ".ping",

  async execute(conn, m) {
    try {
      const chat = m.key.remoteJid;
      const start = Date.now();
      const BOT_NAME = config.BOT_NAME || "Miara 🌸";
      const OWNER_NAME = config.OWNER_NAME || "MidKnightMantra";
      const TZ = config.TIMEZONE || "Africa/Nairobi";

      await safeReact(conn, m, "🏃");
      await conn.sendMessage(chat, { text: "🏃 Running system diagnostics..." }, safeQuoted(m));

      const latency = Date.now() - start;
      const now = moment().tz(TZ);
      const uptime = clockString(process.uptime() * 1000);

      const totalMem = os.totalmem() / 1024 / 1024;
      const freeMem = os.freemem() / 1024 / 1024;
      const usedMem = totalMem - freeMem;
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

      const cpus = os.cpus() || [];
      const cpuModel = (cpus[0]?.model || "Unknown CPU").slice(0, 50);
      const cpuCores = cpus.length;
      const loadAvg = (os.loadavg?.()[0] ?? 0).toFixed(2);

      const platform = getPlatform();

      const replyMsg = `
╭━━━⊰ *${BOT_NAME} DIAGNOSTICS* ⊱━━━╮
┃ ⚡ *Latency:* ${latency} ms
┃ ⏱️ *Uptime:* ${uptime}
┃ 💻 *Platform:* ${platform}
┃ 🧠 *Memory:* ${usedMem.toFixed(0)} MB / ${totalMem.toFixed(0)} MB (${memPercent}%)
┃ 🧩 *CPU:* ${cpuModel} (${cpuCores} cores)
┃ 📊 *Load Avg:* ${loadAvg}
┃
┃ 📅 *Date:* ${now.format("dddd, MMMM Do YYYY")}
┃ 🕐 *Time:* ${now.format("HH:mm:ss")}
┃ 👑 *Owner:* ${OWNER_NAME}
╰━━━━━━━━━━━━━━━━━━━━━━━╯
💫 *Status:* Online, responsive, and steady.
🌸 *Quote:* “Still breathing. Still dreaming. Still Miara.”
      `.trim();

      await conn.sendMessage(chat, { text: replyMsg }, safeQuoted(m));
      await safeReact(conn, m, "💫");
      console.log(`✅ Ping complete: ${latency} ms`);
    } catch (err) {
      console.error("❌ Ping Error:", err);
      const chat = m?.key?.remoteJid;
      if (chat)
        await conn.sendMessage(chat, { text: `⚠️ Ping failed: ${err.message}` }, safeQuoted(m));
    }
  }
};
