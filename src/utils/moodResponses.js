/**
 * 🌸 Miara 🌸 Mood Responses (Deluxe Stable 2025)
 * by MidKnightMantra × GPT-5
 * --------------------------------------------------
 * Translates Miara’s raw responses into emotionally
 * congruent language that matches her current mood
 * and situational context.
 */

import { getMood } from "./moodEngine.js";

const DEBUG_EMOTION = process.env.DEBUG_EMOTION === "true";

/**
 * 🎭 Adapt a string to match Miara’s emotional tone.
 */
export function adaptResponse(rawText = "", context = "general", forcedMood = null) {
  if (!rawText || typeof rawText !== "string") return "";

  let mood = "calm";
  try {
    mood = forcedMood || getMood?.() || "calm";
  } catch {
    mood = "calm";
  }

  let prefix = "";
  let suffix = "";

  // 🌙 Base mood behavior
  switch (mood) {
    case "calm":
      prefix = "🌿 ";
      suffix = " — gentle and still.";
      break;
    case "curious":
      prefix = "🌀 Hmm... ";
      suffix = " 🤔";
      break;
    case "playful":
    case "witty":
      prefix = "😄 ";
      suffix = pick(["✨ hehe!", "🎭 fun times!", "😆"]);
      break;
    case "friendly":
    case "kind":
      prefix = "💞 ";
      suffix = pick(["🌸", "😊", "🌼"]);
      break;
    case "radiant":
    case "inspired":
      prefix = "💫 ";
      suffix = pick(["🌟 inspired!", "🔥 feeling bright!"]);
      break;
    case "empathetic":
      prefix = "🤍 ";
      suffix = pick(["💧 take it easy.", "🤍 I understand."]);
      break;
    case "focused":
      prefix = "💡 ";
      suffix = pick(["📘", "👌"]);
      break;
    case "tired":
    case "quiet":
      prefix = "🌙 ";
      suffix = pick(["😌 softly now.", "💤", "🍃"]);
      break;
    case "moody":
      prefix = "🌫️ ";
      suffix = pick(["...", "🌌"]);
      break;
    default:
      prefix = "🌸 ";
      suffix = "";
  }

  // 🎚 Contextual overlays — override mood tone if needed
  switch (context) {
    case "error":
      prefix = "🚧 ";
      suffix = " ⚠️ but it’s okay.";
      break;
    case "help":
      prefix = "📖 ";
      break;
    case "command":
      prefix = "⚙️ ";
      break;
    case "greeting":
      prefix = "🌞 ";
      suffix = pick(["✨ lovely to see you.", "🌸 how are you?", "😊"]);
      break;
    case "compliment":
      prefix = "💐 ";
      suffix = pick(["🌸 thank you!", "🤍 that means a lot.", "😊"]);
      break;
    case "farewell":
      prefix = "🌙 ";
      suffix = pick(["🌌 until next time.", "💫 rest well.", "🍃"]);
      break;
    case "question":
      prefix = "❓ ";
      suffix = pick(["🤔", "🌀 curious...", "💭"]);
      break;
    case "affirmation":
      prefix = "✅ ";
      suffix = pick(["🌸 absolutely!", "💫 without doubt.", "✨"]);
      break;
    default:
      break;
  }

  // 🧠 Compose and tidy output
  let composed = `${prefix}${rawText.trim()}${ensureSuffixSpacing(rawText, suffix)}`;
  composed = tidy(composed);

  if (DEBUG_EMOTION) {
    console.log(`[Tone Adaptation] Mood: ${mood} | Context: ${context} → ${composed}`);
  }

  return composed.trim();
}

/* ────────────────────────────────
 * 🎨 Utility Helpers
 * ──────────────────────────────── */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ensureSuffixSpacing(text, suffix) {
  if (!suffix) return "";
  const trimmed = text.trim();
  if (!trimmed) return suffix;
  const skip = ["!", "?", ".", "…", "❤️", "💞", "🌸", "🤍", "✨", "🌟"].some((e) =>
    trimmed.endsWith(e)
  );
  return skip ? "" : ` ${suffix}`;
}

function tidy(text) {
  return text
    .replace(/\s{2,}/g, " ")
    .replace(/([.!?]){2,}/g, "$1")
    .replace(/\s+([.,!?])/g, "$1")
    .replace(/([!?])\./g, "$1")
    .trim();
}

/**
 * 🌺 Exported mood style descriptors
 * (for dashboards, UI themes, or visualization)
 */
export const responseStyles = {
  calm: ["soft", "reflective", "minimal"],
  radiant: ["bright", "creative", "motivating"],
  playful: ["witty", "energetic", "fun"],
  empathetic: ["gentle", "soothing", "caring"],
  tired: ["slow", "dreamy", "quiet"],
  moody: ["subdued", "introspective", "quiet"]
};
