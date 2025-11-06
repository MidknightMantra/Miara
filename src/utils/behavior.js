/**
 * 🌸 Miara🌸Human Behavior Engine
 * by MidKnightMantra
 * --------------------------------------------------
 */

import { getMood } from "./moodEngine.js";

/**
 * ✨ Simulates typing & human-like timing
 * Adjusts delay and rhythm based on Miara’s current mood.
 */
export async function simulateHumanBehavior(conn, jid, baseDelay = 1000, userText = "") {
  const mood = getMood();
  const delay = calculateDelay(mood, baseDelay, userText);
  const typingDuration = delay * (0.5 + Math.random() * 0.5);

  try {
    // 🟡 Begin typing indicator
    await conn.sendPresenceUpdate("composing", jid);
    await wait(typingDuration);

    // 🔵 Occasionally pause mid-typing (adds realism)
    if (Math.random() < 0.2) {
      await conn.sendPresenceUpdate("paused", jid);
      await wait(300 + Math.random() * 700);
    }

    // 🟢 Done typing
    await conn.sendPresenceUpdate("available", jid);
  } catch (err) {
    console.warn("⚠️ Behavior simulation error:", err.message);
  }
}

/**
 * ⏱️ Calculates realistic human delay based on mood and message complexity
 */
function calculateDelay(mood, baseDelay, text) {
  const wordCount = text.trim().split(/\s+/).length;
  const lengthFactor = Math.min(wordCount / 5, 4);
  let multiplier;

  switch (mood) {
    case "calm": multiplier = 1.3; break;      // slower and deliberate
    case "radiant":
    case "inspired": multiplier = 0.8; break; // quick, creative energy
    case "kind":
    case "friendly": multiplier = 1.1; break; // gentle, composed
    case "playful":
    case "witty": multiplier = 0.9; break;    // energetic and lively
    case "quiet":
    case "tired": multiplier = 1.6; break;    // reflective, soft tone
    default: multiplier = 1.0;
  }

  return baseDelay * multiplier + lengthFactor * 300;
}

/**
 * 🌿 Natural human pause (thinking moment between actions)
 */
export async function humanPause(min = 400, max = 1200) {
  await wait(min + Math.random() * (max - min));
}

/**
 * 🩵 Wait helper
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 🌼 Random subtle expressions
 * Occasionally sends small, quiet “presence” messages to feel alive.
 */
export async function occasionalHumanTouch(conn, jid) {
  if (Math.random() >= 0.1) return; // 10% chance per message

  const touches = [
    "💭 ...thinking softly.",
    "🩵 just here, quietly existing.",
    "✨ still awake... barely.",
    "🌸 I like how calm this feels.",
    "😌 silence can be comforting, sometimes.",
  ];

  const text = touches[Math.floor(Math.random() * touches.length)];
  await wait(2000 + Math.random() * 1500);

  try {
    await conn.sendMessage(jid, { text });
  } catch (err) {
    console.warn("⚠️ Ambient message failed:", err.message);
  }
}

/**
 * 💫 Natural response finisher
 * Adds gentle delay or emoji reaction to emulate emotional response.
 */
export async function naturalResponseEnd(conn, jid, mood, quotedKey = null) {
  const emojiMap = {
    calm: ["🌿", "🪷", "☁️"],
    radiant: ["💎", "💫", "🌟"],
    kind: ["🩷", "🌸", "🌼"],
    playful: ["😆", "🎠", "✨"],
    quiet: ["🌙", "🌌", "🍃"],
    tired: ["😴", "😌", "🌙"],
  };

  const emojis = emojiMap[mood] || ["🌸"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  if (Math.random() < 0.4) {
    await wait(800 + Math.random() * 600);
    try {
      await conn.sendMessage(jid, { react: { text: emoji, key: quotedKey } });
    } catch (err) {
      console.warn("⚠️ Reaction send failed:", err.message);
    }
  }
}
