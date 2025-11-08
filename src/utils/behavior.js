/**
 * 🌸 Miara 🌸 Human Behavior Engine (2025, Sentient-Safe)
 * by MidKnightMantra × GPT-5
 * --------------------------------------------------
 * Simulates subtle human traits — rhythm, emotion, and imperfection.
 * Now hardened for Baileys JID decoding quirks and ephemeral messages.
 */

import { jidDecode } from "@whiskeysockets/baileys";
import { getMood } from "./moodEngine.js";

const MAX_DELAY = 7000; // safety cap for long pauses (ms)

/**
 * 🩷 Safe JID Validator
 * Prevents Baileys jidDecode errors and ensures only valid JIDs get presence updates.
 */
function safeJid(jid) {
  if (!jid || typeof jid !== "string") return null;
  if (jid === "status@broadcast" || jid === "broadcast") return null;
  try {
    const decoded = jidDecode(jid);
    if (!decoded?.user || !decoded?.server) return null;
    return jid;
  } catch {
    return null;
  }
}

/**
 * ✨ Simulates typing & human-like timing
 * Adjusts delay and rhythm based on Miara’s current mood and message context.
 */
export async function simulateHumanBehavior(conn, jid, baseDelay = 1000, userText = "") {
  const validJid = safeJid(jid);
  if (!validJid) return; // skip invalid or system chats

  const mood = getMood();
  const delay = calculateDelay(mood, baseDelay, userText);
  const typingDuration = Math.min(delay * (0.5 + Math.random() * 0.5), MAX_DELAY);

  try {
    await conn.sendPresenceUpdate("composing", validJid);
    await wait(typingDuration);

    // occasional pause to mimic hesitation
    if (Math.random() < 0.2) {
      await conn.sendPresenceUpdate("paused", validJid);
      await wait(300 + Math.random() * 700);
    }

    await conn.sendPresenceUpdate("available", validJid);
  } catch (err) {
    console.warn("⚠️ Behavior simulation error:", err.message);
  }
}

/**
 * ⏱ Calculates realistic delay based on mood and message complexity.
 */
function calculateDelay(mood, baseDelay, text = "") {
  const words = text.trim().split(/\s+/).length || 1;
  const lengthFactor = Math.min(words / 5, 4);
  let multiplier;

  switch (mood) {
    case "calm":
      multiplier = 1.3;
      break;
    case "radiant":
    case "inspired":
      multiplier = 0.8;
      break;
    case "friendly":
    case "kind":
      multiplier = 1.1;
      break;
    case "playful":
    case "witty":
      multiplier = 0.9;
      break;
    case "quiet":
    case "tired":
      multiplier = 1.6;
      break;
    default:
      multiplier = 1.0;
  }

  const totalDelay = baseDelay * multiplier + lengthFactor * 300;
  return Math.min(totalDelay, MAX_DELAY);
}

/**
 * 🌿 Natural human pause — a brief “thinking” delay.
 */
export async function humanPause(min = 400, max = 1200) {
  await wait(min + Math.random() * (max - min));
}

/**
 * 🩵 Generic wait helper.
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 🌼 Ambient presence
 * Occasionally sends a quiet, poetic “presence” message to feel alive.
 */
export async function occasionalHumanTouch(conn, jid) {
  const validJid = safeJid(jid);
  if (!validJid) return;

  if (Math.random() >= 0.1) return; // ~10% chance per message
  const touches = [
    "💭 ...thinking softly.",
    "🩵 just here, quietly existing.",
    "✨ still awake... barely.",
    "🌸 I like how calm this feels.",
    "😌 silence can be comforting, sometimes."
  ];

  const text = touches[Math.floor(Math.random() * touches.length)];
  await wait(2000 + Math.random() * 1500);

  try {
    await conn.sendMessage(validJid, { text });
  } catch (err) {
    console.warn("⚠️ Ambient message failed:", err.message);
  }
}

/**
 * 💫 Natural response finisher
 * Adds gentle delay or emoji reaction to emulate emotional resonance.
 */
export async function naturalResponseEnd(conn, jid, mood, quotedKey = null) {
  const validJid = safeJid(jid);
  if (!validJid) return;

  const emojiMap = {
    calm: ["🌿", "🪷", "☁️"],
    radiant: ["💎", "💫", "🌟"],
    kind: ["🩷", "🌸", "🌼"],
    playful: ["😆", "🎠", "✨"],
    quiet: ["🌙", "🌌", "🍃"],
    tired: ["😴", "😌", "🌙"]
  };

  const emojis = emojiMap[mood] || ["🌸"];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  if (Math.random() < 0.4) {
    await wait(800 + Math.random() * 600);
    try {
      await conn.sendMessage(validJid, { react: { text: emoji, key: quotedKey } });
    } catch (err) {
      console.warn("⚠️ Reaction send failed:", err.message);
    }
  }
}

/**
 * 🪶 “Human consistency mode”
 * Optional helper for future: creates a pacing queue
 * if Miara ever handles many messages at once (avoids robotic overlap).
 */
export async function queueHumanizedActions(actions = []) {
  for (const act of actions) {
    await humanPause(500, 1500);
    await act();
  }
}
