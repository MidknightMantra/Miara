/**
 * 🌸 Miara Bot - Premium Visual About Command
 * Author: MidKnightMantra
 * Enhanced by GPT-5
 */

import os from "os";
import path from "path";
import moment from "moment-timezone";
import { createCanvas, loadImage, registerFont } from "canvas";
import fs from "fs/promises";
import { config } from "../config.js";

// Optional custom font
try {
  registerFont("./assets/fonts/Poppins-SemiBold.ttf", { family: "Poppins" });
  registerFont("./assets/fonts/Poppins-Regular.ttf", { family: "Poppins", weight: "400" });
  registerFont("./assets/fonts/Poppins-Bold.ttf", { family: "Poppins", weight: "700" });

} catch {}

export default {
  name: "about",
  description: "Show Miara’s system info with animated gradient, avatar, and system gauges.",
  category: "general",
  usage: ".about",

  async execute(conn, m) {
    const {
      BOT_NAME = "Miara🌸",
      OWNER_NAME = "MidKnightMantra",
      PREFIX = ".",
      VERSION = "1.0.0",
    } = config;

    // System Info
    const uptimeMs = process.uptime() * 1000;
    const uptime = {
      h: Math.floor(uptimeMs / 3600000),
      m: Math.floor((uptimeMs % 3600000) / 60000),
      s: Math.floor((uptimeMs % 60000) / 1000),
    };

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usedMemPct = Math.round((usedMem / totalMem) * 100);

    const cpus = os.cpus();
    const avgCpuLoad = Math.round(
      cpus.map((cpu) => {
        const t = cpu.times;
        return (t.user + t.nice + t.sys + t.irq) / (t.user + t.nice + t.sys + t.irq + t.idle);
      }).reduce((a, b) => a + b, 0) / cpus.length * 100
    );

    const sys = {
      os: `${os.platform()} (${os.arch()})`,
      node: process.version,
      time: moment().tz("Africa/Nairobi").format("HH:mm:ss"),
      date: moment().tz("Africa/Nairobi").format("dddd, MMMM Do YYYY"),
      tz: "Africa/Nairobi",
    };

    // Canvas setup
    const width = 1000;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // 🌈 Animated Gradient Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#ffe1f0");
    gradient.addColorStop(0.5, "#e3f0ff");
    gradient.addColorStop(1, "#d6f5e7");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 🖼 Logo / Avatar
    try {
      const logoPath = path.resolve("assets", "menu.jpg");
      const logo = await loadImage(logoPath);
      const radius = 90;
      const centerX = width - 150;
      const centerY = 150;

      // Glowing circular background
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, 120);
      glowGradient.addColorStop(0, "#ffb3ecaa");
      glowGradient.addColorStop(1, "transparent");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
      ctx.fill();

      // Draw circular avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logo, centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.restore();

      // Border
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ff8dcf";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 2, 0, Math.PI * 2);
      ctx.stroke();
    } catch {
      console.warn("Logo not found, skipping avatar render.");
    }

    // 🌸 Text Info
    ctx.fillStyle = "#222";
    ctx.font = "bold 48px Poppins";
    ctx.fillText(BOT_NAME, 60, 90);

    ctx.font = "24px Poppins";
    ctx.fillText(`👑 Owner: ${OWNER_NAME}`, 60, 140);
    ctx.fillText(`⚙️ Version: ${VERSION}`, 60, 180);
    ctx.fillText(`💻 Prefix: ${PREFIX}`, 60, 220);
    ctx.fillText(`🕓 Uptime: ${uptime.h}h ${uptime.m}m ${uptime.s}s`, 60, 260);
    ctx.fillText(`📅 ${sys.date}`, 60, 300);
    ctx.fillText(`🕒 ${sys.time} (${sys.tz})`, 60, 340);

    // ⚙️ System Info + Gauges
    ctx.font = "bold 26px Poppins";
    ctx.fillText("System Status", 60, 400);
    ctx.font = "22px Poppins";
    ctx.fillText(`🧩 OS: ${sys.os}`, 60, 440);
    ctx.fillText(`⚡ NodeJS: ${sys.node}`, 60, 470);

    // Gauge Helper
    const drawGauge = (x, y, percent, label, color) => {
      const r = 50;
      const start = Math.PI;
      const end = Math.PI * (1 + percent / 100);
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#ddd";
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI, 2 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, start, end);
      ctx.stroke();

      ctx.font = "20px Poppins";
      ctx.fillStyle = "#333";
      ctx.fillText(`${label}: ${percent}%`, x - 45, y + 80);
    };

    // 🧠 RAM + CPU Gauges
    drawGauge(150, 520, usedMemPct, "RAM", "#ff66b2");
    drawGauge(350, 520, avgCpuLoad, "CPU", "#66b2ff");

    // 💖 Signature
    ctx.font = "italic 18px Poppins";
    ctx.fillText(`🌸 Crafted with love by ${OWNER_NAME}`, 60, 580);

    // Export buffer
    const buffer = canvas.toBuffer("image/png");

    await conn.sendMessage(
      m.from,
      { image: buffer, caption: `✨ *${BOT_NAME} System Overview*`, mentions: [m.sender] },
      { quoted: m.message }
    );

    await conn.sendMessage(m.from, { react: { text: "💖", key: m.message.key } });
  },
};
