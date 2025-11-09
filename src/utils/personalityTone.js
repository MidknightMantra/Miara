/**
 * 🌸 Miara 🌸 Personality Tone Engine (2025, Optimized)
 * by MidKnightMantra × GPT-5
 * ------------------------------------------------------------
 * Gives Miara emotional cadence — gentle warmth, wit, and charm
 * without heavy computation or semantic drift.
 */

import { getMood } from "./moodEngine.js";

const DEBUG_TONE = process.env.DEBUG_TONE === "true";
const MUTE_EMOJIS = process.env.MUTE_EMOJIS === "true";

let lastTone = null;

/**
 * 💬 Apply Miara’s personal tone to text.
 * Adjusts energy, softness, and emotion based on current mood.
 */
export function applyPersonalityTone(text = "", moodOverride = null) {
  if (!text || typeof text !== "string") return "";

  // Graceful fallback if moodEngine isn’t active
  let mood = "calm";
  try {
    mood = moodOverride || getMood?.() || "calm";
  } catch {
    mood = "calm";
  }

  const tone = blendTone(mood);

  const toneAdjustments = {
    calm: (t) => addTone("🌿", softenText(t), "— gentle and still."),
    radiant: (t) => addTone("✨", enhanceEnergy(t), "🌟"),
    kind: (t) => addTone("💞", gentleTone(t)),
    playful: (t) => addTone("😄", addPlayfulness(t), "✨"),
    witty: (t) => addTone("", addWit(t), "😏"),
    empathetic: (t) => addTone("🤍", gentleTone(t)),
    tired: (t) => addTone("🌙", softenText(t), "..."),
    quiet: (t) => addTone("🍃", softenText(t), "."),
    focused: (t) => addTone("💡", clarifyText(t), "🔍"),
    moody: (t) => addTone("🌫️", softenText(t), "...")
  };

  const transform = toneAdjustments[tone] || ((t) => addTone("🌸", t));
  const result = tidyPunctuation(transform(text));

  if (DEBUG_TONE)
    console.log(`[Tone Engine] Mood: ${tone} | Output: "${result}"`);

  return result;
}

/* ────────────────────────────────
 * 🎨 Tone Style Helpers
 * ──────────────────────────────── */

function softenText(text) {
  return text
    .replace(/!+/g, ".")
    .replace(/\?+/g, "?")
    .replace(/\b(okay|sure)\b/gi, "alright")
    .replace(/\s+/g, " ")
    .trim();
}

function enhanceEnergy(text) {
  if (MUTE_EMOJIS) return `${text.trim()}!`;
  const marks = ["✨", "🌟", "💫", "🔥", "🌈"];
  return `${text.trim()} ${pick(marks)}`;
}

function gentleTone(text) {
  return text.replace(/([.!?])?$/, MUTE_EMOJIS ? "." : " 🤍");
}

function addPlayfulness(text) {
  const fillers = ["hehe~", "teehee!", "just saying~", "funny huh?", "😋"];
  return `${text.trim()} ${pick(fillers)}`;
}

function clarifyText(text) {
  return text.replace(/^\s*[\.\!\?]+/, "").trim();
}

function addWit(text) {
  const remarks = [
    `${text.trim()} — clever, right?`,
    `Hmm... ${text.trim()}, but with flair.`,
    `${text.trim()} 😉`,
    `You saw that coming, didn’t you?`
  ];
  return pick(remarks);
}

function addTone(prefix, main, suffix = "") {
  if (MUTE_EMOJIS) return main.trim();
  return [prefix, main.trim(), suffix].filter(Boolean).join(" ").trim();
}

function tidyPunctuation(text) {
  return text
    .replace(/\s{2,}/g, " ")
    .replace(/([.!?]){2,}/g, "$1")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 🎚 Blends tones gently between messages
 * (prevents emotional whiplash)
 */
function blendTone(current) {
  if (!lastTone) {
    lastTone = current;
    return current;
  }
  if (lastTone !== current && Math.random() < 0.3) {
    lastTone = current;
    return current;
  }
  return lastTone;
}

export default { applyPersonalityTone };
