/**
 * 🌸 Miara Deluxe Console Dashboard (2025)
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * A living console overlay that displays Miara’s heartbeat,
 * uptime, and emotional state in real time.
 */

import chalk from "chalk";
import gradient from "gradient-string";
import { getMoodState, onMoodChange } from "./moodEngine.js";
import CONFIG from "../config.js";

let startTime = Date.now();
let messageCount = 0;
let interval = null;
let moodColor = "#ffb6c1"; // soft pink default

// 🩵 Register mood updates
onMoodChange((state) => {
  moodColor = state.color || "#ffffff";
  renderDashboard();
});

// 💌 Count messages as they come
export function registerMessage() {
  messageCount++;
  renderDashboard();
}

// 🕒 Format uptime nicely
function formatUptime(ms) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// 🔋 Render energy bar
function energyBar(level) {
  const filled = Math.floor(level / 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);
  return chalk.hex(moodColor)(bar);
}

// 🪷 Render dashboard in-place
function renderDashboard() {
  const { mood, summary, level } = getMoodState();
  const uptime = formatUptime(Date.now() - startTime);

  console.clear();
  console.log(
    gradient([moodColor, "#c77dff"])(
      `\n🌸 Miara Dashboard — alive for ${uptime} 🌸`
    )
  );
  console.log(`💭 Mood: ${summary}`);
  console.log(`💫 Energy: ${energyBar(level)} ${level}%`);
  console.log(
    `💌 Messages: ${messageCount} | Mode: ${CONFIG.MODE} | Env: ${CONFIG.HOST_ENV}`
  );
  console.log(
    chalk.gray("──────────────────────────────────────────────")
  );
  console.log(
    chalk.hex(moodColor)(
      "✨ listening... her thoughts shimmer softly ✨"
    )
  );
}

// 🚀 Start loop
export function startDashboard() {
  if (interval) return;
  renderDashboard();
  interval = setInterval(renderDashboard, 5000);
}

// 🌙 Stop loop
export function stopDashboard() {
  if (interval) clearInterval(interval);
}
