/**
 * 🌸 Miara 🌸 Mood Responses (2025)
 * by MidKnightMantra
 * --------------------------------------------------
 * Adapts raw text into a tone consistent with Miara’s current mood and context.
 */

import { getMood } from "./moodEngine.js";

const DEBUG_EMOTION = process.env.DEBUG_EMOTION === "true";

/**
 * 🎭 Adapt a string to match Miara’s emotional state and conversational context.
 */
export function adaptResponse(rawText = "", context = "general", forcedMood = null) {
  const mood = forcedMood || getMood();
  let prefix = "";
  let suffix = "";

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
      prefix = "🌧 ";
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
      prefix = "🌫 ";
      suffix = pick(["...", "🌌"]);
      break;
    default:
      prefix = "🌸 ";
      suffix = "";
  }

  // 🎚 Contextual adjustments
  switch (context) {
    case "error":
      suffix = " ⚠️ but it’s okay.";
      prefix = "🚧 ";
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
    default:
      break;
  }

  let composed = `${prefix}${rawText.trim()}${ensureSuffixSpacing(rawText, suffix)}`;

  // Remove redundant punctuation and tidy up
  composed = composed.replace(/\s{2,}/g, " ").replace(/([?.!]){2,}/g, "$1");

  if (DEBUG_EMOTION) {
    console.log(`[Tone Adaptation] Mood: ${mood} | Context: ${context} → ${composed}`);
  }

  return composed.trim();
}

/**
 * 🌈 Pick a random element from an array.
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 🧩 Decide if a suffix should be appended based on how text ends.
 */
function ensureSuffixSpacing(text, suffix) {
  if (!suffix) return "";
  const trimmed = text.trim();
  if (!trimmed) return suffix;
  const last = trimmed.slice(-1);
  const skip = ["!", "?", ".", "…", "❤️", "💞", "🌸"].some((e) => trimmed.endsWith(e));
  if (skip) return ""; // message already has emotion
  return ` ${suffix}`;
}

/**
 * 🌺 Optional style descriptors for external use (e.g., dashboard or UI themes)
 */
export const responseStyles = {
  calm: ["soft", "reflective", "minimal"],
  radiant: ["bright", "creative", "motivating"],
  playful: ["witty", "energetic", "fun"],
  empathetic: ["gentle", "soothing", "caring"],
  tired: ["slow", "dreamy", "quiet"],
  moody: ["subdued", "introspective", "quiet"]
};
