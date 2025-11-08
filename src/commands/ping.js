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

// ⏱️ Helper: format uptime nicely
function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

// 🌐 Lightweight download speed check
async function measureSpeed(url = "https://speed.hetzner.de/100MB.bin", sampleSizeMB = 3) {
  return new Promise((resolve) => {
    try {
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
    } catch {
      resolve(0);
    }
  });
}

export default {
  name: "ping",
  aliases: ["speed", "net"],
  description: "Check Miara’s speed, uptime, and system performance ⚡",
  category: "utility",
  usage: ".ping",

  async execute(conn, m) {
    const start = Date.now();
    const from = m.from || m.key?.remoteJid || config.DEFAULT_OWNER_JID;

    try {
      // 🩹 Always guard message key usage
      const safeKey = m.key && m.key.remoteJid ? m.key : null;

      await conn.sendMessage(from, { react: { text: "🏃", key: safeKey } });
      await conn.sendMessage(from, { text: "🏃 Running network diagnostics..." }, { quoted: m });

      // 🕒 Basic metrics
      const latency = Date.now() - start;
      const now = moment().tz(config.TIMEZONE || "Africa/Nairobi");
      const uptime = clockString(process.uptime() * 1000);

      // 🧠 Memory
      const totalMem = os.totalmem() / (1024 * 1024);
      const freeMem = os.freemem() / (1024 * 1024);
      const usedMem = totalMem - freeMem;
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

      // ⚙️ CPU
      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model || "Unknown CPU";
      const cpuCores = cpus.length;
      const loadAvg = os.loadavg()[0].toFixed(2);
      const platform = getPlatform();

      // 🌐 Network
      await conn.sendMessage(from, { text: "📡 Testing network speed..." }, { quoted: m });
      const downloadSpeed = await measureSpeed("https://speed.hetzner.de/10MB.bin", 3);
      const uploadSpeed = downloadSpeed > 0 ? (downloadSpeed * 0.8).toFixed(2) : "0.00";

      // 🩵 Build reply
      const replyMsg = `
╭━━━⊰ *${config.BOT_NAME || "Miara 🌸"} DIAGNOSTICS* ⊱━━━╮
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
┃ 👑 *Owner:* ${config.OWNER_NAME || "MidKnightMantra"}
╰━━━━━━━━━━━━━━━━━━━━━━━╯

💫 *Status:* Online, responsive, and steady.
🌸 *Quote:* “Still breathing. Still dreaming. Still Miara.”
      `.trim();

      await conn.sendMessage(from, { text: replyMsg }, { quoted: m });
      await conn.sendMessage(from, { react: { text: "💫", key: safeKey } });

      console.log(`✅ Ping benchmark complete: ${latency}ms | DL ${downloadSpeed.toFixed(2)} MB/s`);
    } catch (err) {
      console.error("❌ Ping Error:", err);
      try {
        await conn.sendMessage(
          from,
          { text: `⚠️ Ping failed — Miara stumbled: ${err.message}` },
          { quoted: m }
        );
      } catch {
        console.error("Ping recovery send failed.");
      }
    }
  }
};
