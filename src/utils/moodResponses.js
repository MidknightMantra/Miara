/**
 * 🌸 Miara 🌸Mood Responses
 * by MidKnightMantra
 * --------------------------------------------------
 */

import { getMood } from "./moodEngine.js";

/**
 * 🎭 Adapts raw text into a mood-aligned message.
 * Called automatically by emotionMiddleware or handlers.
 */
export function adaptResponse(rawText = "", context = "general") {
  const mood = getMood();
  let tonePrefix = "";
  let toneSuffix = "";

  switch (mood) {
    case "calm":
      tonePrefix = "🌿 ";
      toneSuffix = " — gentle and still.";
      break;

    case "curious":
      tonePrefix = "🌀 Hmm... ";
      toneSuffix = " 🤔";
      break;

    case "playful":
    case "witty":
      tonePrefix = "😄 ";
      toneSuffix = random(["✨ hehe!", "🎭 fun times!", "😆"]);
      break;

    case "friendly":
    case "kind":
      tonePrefix = "💞 ";
      toneSuffix = random(["🌸", "😊", "🌼"]);
      break;

    case "radiant":
    case "inspired":
      tonePrefix = "💫 ";
      toneSuffix = random(["🌟 inspired!", "🔥 feeling bright!"]);
      break;

    case "empathetic":
      tonePrefix = "🌧 ";
      toneSuffix = random(["💧 take it easy.", "🤍 I understand."]);
      break;

    case "focused":
      tonePrefix = "💡 ";
      toneSuffix = random(["📘", "👌"]);
      break;

    case "tired":
    case "quiet":
      tonePrefix = "🌙 ";
      toneSuffix = random(["😌 softly now.", "💤", "🍃"]);
      break;

    case "moody":
      tonePrefix = "🌫 ";
      toneSuffix = random(["...", "🌌"]);
      break;

    default:
      tonePrefix = "🌸 ";
      toneSuffix = "";
  }

  // ✨ Adjust phrasing based on context type
  if (context === "error") toneSuffix = " ⚠️ but it’s okay.";
  if (context === "help") tonePrefix = "📖 ";
  if (context === "command") tonePrefix = "⚙️ ";

  // 🩵 Blend with Miara’s emotional tone
  const composed = `${tonePrefix}${rawText}${toneSuffix}`;
  return composed.trim();
}

/**
 * 🌈 Small helper for picking random emotional suffixes
 */
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 🌺 Optional: Style sets for external use (if needed later)
 */
export const responseStyles = {
  calm: ["soft", "reflective", "minimal"],
  radiant: ["bright", "creative", "motivating"],
  playful: ["witty", "energetic", "fun"],
  empathetic: ["gentle", "soothing", "caring"],
  tired: ["slow", "dreamy", "quiet"],
};
