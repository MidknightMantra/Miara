/**
 * 🌸 Miara 🌸Personality Tone Engine
 * by MidKnightMantra
 * ------------------------------------------------------------
 */

import { getMood } from "./moodEngine.js";

/**
 * 💬 Applies Miara’s personal tone to outgoing messages.
 * This is a lightweight emotional decorator, not a full rewrite.
 */
export function applyPersonalityTone(text = "", moodOverride = null) {
  const mood = moodOverride || getMood();

  // 🌈 Base tone modifiers per mood
  const toneAdjustments = {
    calm: (t) => `🌿 ${softenText(t)}.`,
    radiant: (t) => `✨ ${enhanceEnergy(t)} 🌟`,
    kind: (t) => `💞 ${gentleTone(t)}`,
    playful: (t) => `😄 ${addPlayfulness(t)} ✨`,
    witty: (t) => `${addWit(t)} 😏`,
    empathetic: (t) => `🤍 ${gentleTone(t)}`,
    tired: (t) => `🌙 ${softenText(t)}...`,
    quiet: (t) => `🍃 ${softenText(t)}.`,
    focused: (t) => `💡 ${clarifyText(t)}`,
    moody: (t) => `🌫 ${softenText(t)}...`,
  };

  const transform = toneAdjustments[mood] || ((t) => `🌸 ${t}`);
  return transform(text);
}

/* ────────────────────────────────
 * 🎨 Tone Style Helpers
 * ──────────────────────────────── */

/**
 * 💭 Soften phrasing for calm / quiet moods
 */
function softenText(text) {
  return text
    .replace(/!+/g, ".")
    .replace(/\?+/g, "?")
    .replace(/\b(okay|sure)\b/gi, "alright")
    .trim();
}

/**
 * 🔆 Add liveliness for radiant moods
 */
function enhanceEnergy(text) {
  const exclamations = ["✨", "🌟", "💫", "🔥"];
  const end = exclamations[Math.floor(Math.random() * exclamations.length)];
  return `${text.trim()} ${end}`;
}

/**
 * 🕊 Gentle kindness tone
 */
function gentleTone(text) {
  return text.replace(/([.!?])?$/, " 🤍");
}

/**
 * 🎠 Light-hearted fun
 */
function addPlayfulness(text) {
  const fillers = ["hehe~", "teehee!", "just saying~", "funny huh?"];
  const filler = fillers[Math.floor(Math.random() * fillers.length)];
  return `${text.trim()} ${filler}`;
}

/**
 * 💡 Clear and confident articulation
 */
function clarifyText(text) {
  return text.replace(/^\s*[\.\!\?]+/, "").trim();
}

/**
 * 😏 Add a bit of dry humor or cheekiness
 */
function addWit(text) {
  const remarks = [
    `${text.trim()} — clever, right?`,
    `Hmm... ${text.trim()}, but with flair.`,
    `${text.trim()} 😉`,
  ];
  return remarks[Math.floor(Math.random() * remarks.length)];
}

/**
 * ✨ Default export (optional) — for systems that prefer auto-binding
 */
export default {
  applyPersonalityTone,
};
