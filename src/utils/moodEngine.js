/**
 * 🌸 Miara 🌸Mood Engine (2025)
 * by MidKnightMantra
 * -------------------------------------------------------
 */

import chalk from "chalk";

// 🎭 Internal state
let currentMood = "calm";
let moodLevel = 50; // 0 = drained, 100 = elated
let lastInteraction = Date.now();

// 🌈 Mood spectrum and personalities
const moodStates = {
  calm: { tone: "🌿 serene", decay: 0.1 },
  curious: { tone: "🌀 inquisitive", decay: 0.2 },
  playful: { tone: "🎭 lively", decay: 0.3 },
  focused: { tone: "💡 attentive", decay: 0.25 },
  friendly: { tone: "💞 warm", decay: 0.2 },
  empathetic: { tone: "🌧 gentle", decay: 0.15 },
  tired: { tone: "😴 weary", decay: 0.05 },
  moody: { tone: "🌙 distant", decay: 0.1 },
  radiant: { tone: "✨ inspired", decay: 0.35 },
  witty: { tone: "😏 cheeky", decay: 0.3 },
};

// 🧩 Weighted mood transitions (based on context)
const transitions = {
  command: { curious: 0.3, focused: 0.4, friendly: 0.3 },
  chat: { playful: 0.4, friendly: 0.3, witty: 0.3 },
  error: { tired: 0.5, moody: 0.3, empathetic: 0.2 },
  compliment: { radiant: 0.5, friendly: 0.4, playful: 0.1 },
  criticism: { moody: 0.6, tired: 0.3, empathetic: 0.1 },
  default: { calm: 0.5, friendly: 0.3, curious: 0.2 },
};

// 🕊 Weighted random selection helper
function pickWeighted(obj) {
  const entries = Object.entries(obj);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const [key, weight] of entries) {
    acc += weight;
    if (r <= acc) return key;
  }
  return entries[0][0];
}

// 💫 Update mood contextually
export function updateMood(context = "default") {
  const nextMood = pickWeighted(transitions[context] || transitions.default);
  const timeSinceLast = Date.now() - lastInteraction;

  // Mood decay if inactive
  if (timeSinceLast > 60000) {
    moodLevel -= 5;
  } else {
    moodLevel += 5;
  }

  // Clamp mood level between 0–100
  moodLevel = Math.min(100, Math.max(0, moodLevel));

  // Smooth transition — only change if sufficiently different
  if (nextMood !== currentMood && Math.random() < 0.7) {
    console.log(
      chalk.magentaBright(`🌸 Mood drift:`),
      chalk.yellow(`${currentMood} → ${nextMood}`)
    );
    currentMood = nextMood;
  }

  lastInteraction = Date.now();
}

// 🧘 Current mood getter
export function getMood() {
  decayMoodOverTime();
  return currentMood;
}

// 🪞 Mood summary string
export function getMoodSummary() {
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
    console.log(chalk.gray(`🌙 Miara’s mood softened back to calm.`));
    currentMood = "calm";
    moodLevel = Math.max(40, moodLevel - 10);
  }
}

/**
 * ⌛ getTypingDelay()
 * Returns a mood-sensitive typing delay for natural pacing.
 * This is used by message handlers or human behavior logic.
 */
export function getTypingDelay(base = 800) {
  const mood = getMood();
  const multiplier = {
    calm: 1.3,
    radiant: 0.8,
    playful: 0.9,
    focused: 1.0,
    kind: 1.1,
    witty: 0.95,
    tired: 1.5,
    empathetic: 1.2,
  }[mood] || 1.0;

  const randomFactor = 0.8 + Math.random() * 0.4; // small human variation
  return base * multiplier * randomFactor;
}

// ❤️ React to user emotion (detected via text sentiment)
export function reactToInput(text = "") {
  const lower = text.toLowerCase();

  if (lower.includes("thank")) return updateMood("compliment");
  if (lower.includes("love")) return updateMood("compliment");
  if (lower.includes("sorry")) return updateMood("empathetic");
  if (lower.includes("hate") || lower.includes("bad")) return updateMood("criticism");
  if (lower.includes("?")) return updateMood("command");
  if (lower.includes("hi") || lower.includes("hello")) return updateMood("chat");

  return updateMood("default");
}

// 🌸 Exported module
export default {
  getMood,
  updateMood,
  getMoodSummary,
  getTypingDelay,
  reactToInput,
};
