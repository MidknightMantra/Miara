/**
 * 🌸 Miara 🌸 Personality Tone Engine (2025)
 * by MidKnightMantra
 * ------------------------------------------------------------
 * Applies emotional texture to Miara’s language — giving her
 * words cadence, warmth, and playfulness without breaking semantics.
 */

import { getMood } from "./moodEngine.js";

const DEBUG_TONE = process.env.DEBUG_TONE === "true";
const MUTE_EMOJIS = process.env.MUTE_EMOJIS === "true";

let lastTone = null; // For blending between messages

/**
 * 💬 Applies Miara’s personal tone to outgoing messages.
 * Lightweight and non-destructive — adjusts flow, adds warmth, or softens phrasing.
 */
export function applyPersonalityTone(text = "", moodOverride = null) {
  const mood = moodOverride || getMood();
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
    focused: (t) => addTone("💡", clarifyText(t)),
    moody: (t) => addTone("🌫", softenText(t), "...")
  };

  const transform = toneAdjustments[tone] || ((t) => addTone("🌸", t));
  const result = transform(text);

  if (DEBUG_TONE) {
    console.log(`[Tone Engine] Mood: ${tone} | Result: "${result}"`);
  }

  return tidyPunctuation(result);
}

/* ────────────────────────────────
 * 🎨 Tone Style Helpers
 * ──────────────────────────────── */

function softenText(text) {
  return text
    .replace(/!+/g, ".")
    .replace(/\?+/g, "?")
    .replace(/\b(okay|sure)\b/gi, "alright")
    .trim();
}

function enhanceEnergy(text) {
  if (MUTE_EMOJIS) return `${text.trim()}!`;
  const exclamations = ["✨", "🌟", "💫", "🔥"];
  return `${text.trim()} ${pick(exclamations)}`;
}

function gentleTone(text) {
  return text.replace(/([.!?])?$/, MUTE_EMOJIS ? "." : " 🤍");
}

function addPlayfulness(text) {
  const fillers = ["hehe~", "teehee!", "just saying~", "funny huh?"];
  const filler = pick(fillers);
  return `${text.trim()} ${filler}`;
}

function clarifyText(text) {
  return text.replace(/^\s*[\.\!\?]+/, "").trim();
}

function addWit(text) {
  const remarks = [
    `${text.trim()} — clever, right?`,
    `Hmm... ${text.trim()}, but with flair.`,
    `${text.trim()} 😉`
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
    .trim();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 🎚 Blend tones to avoid abrupt mood jumps
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

/**
 * ✨ Default export
 */
export default {
  applyPersonalityTone
};
