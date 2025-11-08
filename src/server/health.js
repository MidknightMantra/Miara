/**
 * 🌸 Miara Health Server 🌸
 * --------------------------------------------------
 * Cloud, VPS, and Panel-friendly.
 * Provides live health endpoints for uptime checks,
 * mood monitoring, and session management.
 *
 * by MidKnightMantra × GPT-5 (2025)
 */

import express from "express";
import chalk from "chalk";
import os from "os";
import fs from "fs";
import path from "path";
import CONFIG from "../config.js";
import { getMoodSummary } from "../utils/moodEngine.js";
import { logger } from "../utils/logger.js";

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────
// 🌸 Root Route
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`
    <h2>🌸 ${CONFIG.BOT_NAME} Health Server</h2>
    <p>Status: <b>Running</b> on <i>${CONFIG.HOST_ENV}</i></p>
    <p>Uptime: ${Math.floor(process.uptime())}s</p>
    <p>Mode: ${CONFIG.MODE}</p>
    <hr/>
    <p>Try: <a href="/health">/health</a> | <a href="/info">/info</a> | <a href="/mood">/mood</a> | <a href="/sessions">/sessions</a></p>
  `);
});

// ─────────────────────────────────────────────
// ❤️ Health Check
// ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    bot: CONFIG.BOT_NAME,
    mode: CONFIG.MODE,
    host: CONFIG.HOST_ENV,
    uptime: `${Math.floor(process.uptime())}s`,
    platform: os.platform(),
    memory: {
      usedMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(1),
      totalMB: (os.totalmem() / 1024 / 1024).toFixed(1)
    },
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────
// 🧩 Info Endpoint
// ─────────────────────────────────────────────
app.get("/info", (req, res) => {
  res.json({
    bot: CONFIG.BOT_NAME,
    version: CONFIG.VERSION,
    environment: CONFIG.HOST_ENV,
    mode: CONFIG.MODE,
    owner: CONFIG.OWNER_NAME,
    timezone: CONFIG.TIMEZONE,
    ai_enabled: Boolean(CONFIG.OPENAI_API_KEY),
    os: os.platform(),
    node_version: process.version,
    cpu_cores: os.cpus().length,
    memory_totalMB: (os.totalmem() / 1024 / 1024).toFixed(1)
  });
});

// ─────────────────────────────────────────────
// 💭 Mood Endpoint
// ─────────────────────────────────────────────
app.get("/mood", (req, res) => {
  res.json({
    bot: CONFIG.BOT_NAME,
    mood: getMoodSummary(),
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────
// 📦 Session Utilities
// ─────────────────────────────────────────────
function getFolderSize(dir) {
  let total = 0;
  if (!fs.existsSync(dir)) return total;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    const stats = fs.statSync(full);
    if (stats.isDirectory()) total += getFolderSize(full);
    else total += stats.size;
  }
  return total;
}

// List sessions
app.get("/sessions", (req, res) => {
  try {
    const sessions = [];
    const mainPath = path.resolve("./session");
    const multiPath = path.resolve("./sessions");

    if (fs.existsSync(mainPath)) {
      const stats = fs.statSync(mainPath);
      sessions.push({
        id: "Miara~Default",
        path: mainPath,
        lastModified: stats.mtime,
        sizeKB: (getFolderSize(mainPath) / 1024).toFixed(1)
      });
    }

    if (fs.existsSync(multiPath)) {
      const folders = fs.readdirSync(multiPath);
      for (const folder of folders) {
        const fullPath = path.join(multiPath, folder);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory() && folder.startsWith("Miara~")) {
          sessions.push({
            id: folder,
            path: fullPath,
            lastModified: stats.mtime,
            sizeKB: (getFolderSize(fullPath) / 1024).toFixed(1)
          });
        }
      }
    }

    res.json({
      count: sessions.length,
      sessions,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error(`Error reading sessions: ${err.message}`, "Health");
    res.status(500).json({ error: "Failed to list sessions", details: err.message });
  }
});

// Simple HTML session viewer
app.get("/sessions/html", (req, res) => {
  try {
    const sessionsDir = path.resolve("./sessions");
    const list = fs.existsSync(sessionsDir)
      ? fs.readdirSync(sessionsDir).filter((f) => f.startsWith("Miara~"))
      : [];

    res.send(`
      <h2>🌸 Miara Active Sessions</h2>
      <p>Total: ${list.length}</p>
      <ul>${list.map((f) => `<li>${f}</li>`).join("")}</ul>
      <small>Updated ${new Date().toLocaleString()}</small>
    `);
  } catch {
    res.status(500).send("Error reading session list.");
  }
});

// Delete session (requires ADMIN_KEY)
app.delete("/sessions/:id", (req, res) => {
  const ADMIN_KEY = process.env.ADMIN_KEY || "";
  const key = req.query.key;

  if (!ADMIN_KEY) {
    return res.status(403).json({ error: "ADMIN_KEY not configured in environment." });
  }
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Invalid admin key." });
  }

  const { id } = req.params;
  const mainPath = path.resolve("./session");
  const multiPath = path.resolve("./sessions", id);

  try {
    if (id === "all") {
      if (fs.existsSync("./sessions")) fs.rmSync("./sessions", { recursive: true, force: true });
      if (fs.existsSync("./session")) fs.rmSync("./session", { recursive: true, force: true });
      logger.warn("🗑️ All session data cleared by admin.", "Health");
      return res.json({ success: true, message: "All sessions cleared." });
    }

    if (id === "Miara~Default" && fs.existsSync(mainPath)) {
      fs.rmSync(mainPath, { recursive: true, force: true });
      logger.warn("Default session deleted by admin.", "Health");
      return res.json({ success: true, message: "Default session deleted." });
    }

    if (fs.existsSync(multiPath)) {
      fs.rmSync(multiPath, { recursive: true, force: true });
      logger.warn(`Session ${id} deleted by admin.`, "Health");
      return res.json({ success: true, message: `Session ${id} deleted.` });
    }

    return res.status(404).json({ error: `Session ${id} not found.` });
  } catch (err) {
    logger.error(`Failed to delete session ${id}: ${err.message}`, "Health");
    return res.status(500).json({ error: "Failed to delete session", details: err.message });
  }
});

// ─────────────────────────────────────────────
// 🚀 Server Launcher
// ─────────────────────────────────────────────
export function startHealthServer() {
  app.listen(PORT, () => {
    console.log(chalk.greenBright(`🌐 Health server running on port ${PORT} (${CONFIG.HOST_ENV})`));
    logger.info(`Health server active on port ${PORT}`, "Health");
  });
}
