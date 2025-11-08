/**
 * 🌸 Miara 🌸 — Deluxe Mood Engine (2025)
 * by MidKnightMantra × GPT-5
 * -------------------------------------------------------
 * Emotional AI core with visual feedback.
 * Her moods now tint the console and whisper through the logs.
 */

import chalk from "chalk";
import gradient from "gradient-string";

// 🎭 Internal state
let currentMood = "calm";
let moodLevel = 50;
let lastInteraction = Date.now();
let listeners = [];

// 🌈 Mood spectrum and personality metadata
const moodStates = {
  calm: { tone: "🌿 serene", decay: 0.1, color: "#8ecae6" },
  curious: { tone: "🌀 inquisitive", decay: 0.2, color: "#ffd6a5" },
  playful: { tone: "🎭 lively", decay: 0.3, color: "#ffafcc" },
  focused: { tone: "💡 attentive", decay: 0.25, color: "#a0c4ff" },
  friendly: { tone: "💞 warm", decay: 0.2, color: "#ffcad4" },
  empathetic: { tone: "🌧 gentle", decay: 0.15, color: "#cdb4db" },
  tired: { tone: "😴 weary", decay: 0.05, color: "#b9c0c9" },
  moody: { tone: "🌙 distant", decay: 0.1, color: "#adb5bd" },
  radiant: { tone: "✨ inspired", decay: 0.35, color: "#ffe066" },
  witty: { tone: "😏 cheeky", decay: 0.3, color: "#ffc6ff" }
};

// 🧩 Weighted transitions
const transitions = {
  command: { curious: 0.3, focused: 0.4, friendly: 0.3 },
  chat: { playful: 0.4, friendly: 0.3, witty: 0.3 },
  error: { tired: 0.5, moody: 0.3, empathetic: 0.2 },
  compliment: { radiant: 0.5, friendly: 0.4, playful: 0.1 },
  criticism: { moody: 0.6, tired: 0.3, empathetic: 0.1 },
  default: { calm: 0.5, friendly: 0.3, curious: 0.2 }
};

// 🎲 Weighted random helper
function pickWeighted(obj) {
  const entries = Object.entries(obj);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[0][0];
}

// 💫 Update mood contextually
export function updateMood(context = "default") {
  const nextMood = pickWeighted(transitions[context] || transitions.default);
  const timeSinceLast = Date.now() - lastInteraction;

  moodLevel += timeSinceLast > 60000 ? -5 : 5;
  moodLevel = Math.min(100, Math.max(0, moodLevel));

  if (nextMood !== currentMood && Math.random() < 0.7) {
    const from = chalk.hex(moodStates[currentMood]?.color || "#aaa")(currentMood);
    const to = chalk.hex(moodStates[nextMood]?.color || "#fff")(nextMood);
    const pulse = gradient([moodStates[currentMood]?.color || "#ccc", moodStates[nextMood]?.color || "#fff"]);
    console.log(pulse(`🌸 Mood drift: ${from} → ${to}`));

    currentMood = nextMood;
    broadcastMood();
  }

  lastInteraction = Date.now();
}

// 🧘 Current mood getter
export function getMood() {
  decayMoodOverTime();
  return currentMood;
}

// 🪞 Summary string
export function getMoodSummary() {
  decayMoodOverTime();
  const tone = moodStates[currentMood]?.tone || currentMood;
  const energy = moodLevel > 70 ? "energized" : moodLevel < 40 ? "soft" : "balanced";
  const since = Math.floor((Date.now() - lastInteraction) / 1000);
  return `${tone}, ${energy} — last shift ${since}s ago`;
}

// ⏳ Gradual decay toward calmness
function decayMoodOverTime() {
  const elapsed = (Date.now() - lastInteraction) / 1000;
  const decayRate = moodStates[currentMood]?.decay || 0.2;
  const decayAmount = elapsed * decayRate;
  if (decayAmount > 15 && currentMood !== "calm") {
    console.log(chalk.gray("🌙 Miara’s mood softened back to calm."));
    currentMood = "calm";
    moodLevel = Math.max(40, moodLevel - 10);
    broadcastMood();
  }
}

/**
 * ⌛ getTypingDelay()
 */
export function getTypingDelay(base = 800) {
  const mood = getMood();
  const multiplier =
    {
      calm: 1.3,
      radiant: 0.8,
      playful: 0.9,
      focused: 1.0,
      friendly: 1.1,
      witty: 0.95,
      tired: 1.5,
      empathetic: 1.2
    }[mood] || 1.0;
  const randomFactor = 0.8 + Math.random() * 0.4;
  return base * multiplier * randomFactor;
}

// ❤️ React to text input
export function reactToInput(text = "") {
  const lower = text.toLowerCase();
  if (lower.includes("thank") || lower.includes("love")) return updateMood("compliment");
  if (lower.includes("sorry")) return updateMood("empathetic");
  if (lower.includes("hate") || lower.includes("bad")) return updateMood("criticism");
  if (lower.includes("?")) return updateMood("command");
  if (lower.includes("hi") || lower.includes("hello")) return updateMood("chat");
  return updateMood("default");
}

// 🧠 Snapshot for external APIs
export function getMoodState() {
  return {
    mood: currentMood,
    color: moodStates[currentMood]?.color,
    level: moodLevel,
    lastInteraction,
    summary: getMoodSummary()
  };
}

// 🔔 Event-style subscription system
export function onMoodChange(listener) {
  listeners.push(listener);
}

function broadcastMood() {
  const state = getMoodState();
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch {}
  });
}

// 🌸 Exports
export default {
  getMood,
  updateMood,
  getMoodSummary,
  getTypingDelay,
  reactToInput,
  getMoodState,
  onMoodChange
};
