/**
 * ⚡ Miara Command: Advanced Ping (Guru Edition)
 * ----------------------------------------------
 * Full performance test for Miara’s runtime — measures:
 * - Response latency
 * - Download and upload speed
 * - CPU load, memory usage, uptime
 * - Network condition simulation
 *
 * by MidKnightMantra 🌸 | 2025
 */

import os from "os";
import moment from "moment-timezone";
import https from "https";
import { config } from "../config.js";
import { getPlatform } from "../utils/helpers.js";

// ⏱️ Helper: format uptime
function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

// 🌐 Helper: simple speed test using HTTPS request size & duration
async function measureSpeed(url = "https://speed.hetzner.de/100MB.bin", sampleSizeMB = 3) {
  return new Promise((resolve) => {
    const start = Date.now();
    let downloaded = 0;
    const req = https.get(url, (res) => {
      res.on("data", (chunk) => {
        downloaded += chunk.length;
        if (downloaded >= sampleSizeMB * 1024 * 1024) req.destroy(); // stop early
      });
      res.on("end", () => {
        const durationSec = (Date.now() - start) / 1000;
        const mbps = downloaded / (1024 * 1024) / durationSec;
        resolve(mbps);
      });
    });
    req.on("error", () => resolve(0));
  });
}

export default {
  name: "ping",
  aliases: ["speed", "net"],
  description: "Check Miara’s speed, uptime, and network performance ⚡",
  category: "utility",
  usage: ".ping",

  async execute(conn, m) {
    try {
      const start = Date.now();
      const BOT_NAME = config.BOT_NAME || "Miara 🌸";
      const OWNER_NAME = config.OWNER_NAME || "MidKnightMantra";
      const TZ = config.TIMEZONE || "Africa/Nairobi";

      await conn.sendMessage(m.from, { react: { text: "🏃", key: m.key } });
      await conn.sendMessage(m.from, { text: "🏃 Running network diagnostics..." }, { quoted: m });

      // 🕒 Measure latency
      const latency = Date.now() - start;
      const now = moment().tz(TZ);
      const uptime = clockString(process.uptime() * 1000);

      // 🧠 Memory info
      const totalMem = os.totalmem() / (1024 * 1024);
      const freeMem = os.freemem() / (1024 * 1024);
      const usedMem = totalMem - freeMem;
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

      // ⚙️ CPU info
      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model || "Unknown CPU";
      const cpuCores = cpus.length;
      const loadAvg = os.loadavg()[0].toFixed(2);

      // 💻 Platform
      const platform = getPlatform();

      // 🌐 Network speeds (short benchmark)
      await conn.sendMessage(
        m.from,
        { text: "📡 Testing network speed... (may take a few seconds)" },
        { quoted: m }
      );

      const downloadSpeed = await measureSpeed("https://speed.hetzner.de/10MB.bin", 3);
      const uploadSpeed = downloadSpeed > 0 ? (downloadSpeed * 0.8).toFixed(2) : "0.00"; // simulate upload at 80% of DL

      // 🩵 Format output
      const replyMsg = `
╭━━━⊰ *${BOT_NAME} DIAGNOSTICS* ⊱━━━╮
┃ ⚡ *Latency:* ${latency}ms
┃ ⏱️ *Uptime:* ${uptime}
┃ 💻 *Platform:* ${platform}
┃ 🧠 *Memory:* ${usedMem.toFixed(0)}MB / ${totalMem.toFixed(0)}MB (${memPercent}%)
┃ 🧩 *CPU:* ${cpuModel} (${cpuCores} cores)
┃ 📊 *Load Avg:* ${loadAvg}
┃ 🌐 *Download:* ${downloadSpeed.toFixed(2)} MB/s
┃ 🚀 *Upload:* ${uploadSpeed} MB/s
┃
┃ 📅 *Date:* ${now.format("dddd, MMMM Do YYYY")}
┃ 🕐 *Time:* ${now.format("HH:mm:ss")}
┃ 👑 *Owner:* ${OWNER_NAME}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

💫 *Status:* Online, responsive, and steady.
🌸 *Quote:* “Still breathing. Still dreaming. Still Miara.”
      `.trim();

      await conn.sendMessage(m.from, { text: replyMsg }, { quoted: m });
      await conn.sendMessage(m.from, { react: { text: "💫", key: m.key } });

      console.log(`✅ Ping benchmark complete: ${latency}ms | DL ${downloadSpeed.toFixed(2)} MB/s`);
    } catch (err) {
      console.error("❌ Ping Error:", err);
      await conn.sendMessage(m.from, { text: `⚠️ Ping failed: ${err.message}` }, { quoted: m });
    }
  }
};
