/**
 * 🌸 Miara 🌸 Human Behavior Engine (2025, Deluxe Stable)
 * by MidKnightMantra × GPT-5
 * --------------------------------------------------
 * Simulates subtle human traits — rhythm, emotion, and imperfection.
 * Hardened for Baileys JID quirks and concurrent sessions.
 */

import { jidDecode } from "@whiskeysockets/baileys";
import { getMood } from "./moodEngine.js";

const MAX_DELAY = 7000;
const processingSet = new Set();

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
 * ✨ Simulates typing & rhythm
 * Adjusts pacing based on Miara’s mood and message complexity.
 */
export async function simulateHumanBehavior(conn, jid, baseDelay = 1000, userText = "") {
  const validJid = safeJid(jid);
  if (!validJid || processingSet.has(validJid)) return;

  processingSet.add(validJid);
  const mood = getMood();
  const delay = calculateDelay(mood, baseDelay, userText);
  const typingDuration = Math.min(delay * (0.5 + Math.random() * 0.5), MAX_DELAY);

  try {
    await conn.sendPresenceUpdate("composing", validJid);
    await wait(typingDuration);

    if (Math.random() < 0.25) {
      await conn.sendPresenceUpdate("paused", validJid);
      await wait(300 + Math.random() * 600);
    }

    await conn.sendPresenceUpdate("available", validJid);
  } catch (err) {
    console.warn("⚠️ simulateHumanBehavior error:", err.message);
  } finally {
    processingSet.delete(validJid);
  }
}

/**
 * ⏱ Calculates natural typing delay based on mood and message size.
 */
function calculateDelay(mood, baseDelay, text = "") {
  const words = text.trim().split(/\s+/).length || 1;
  const lengthFactor = Math.min(words / 5, 4);
  const multipliers = {
    calm: 1.3,
    radiant: 0.8,
    kind: 1.1,
    friendly: 1.1,
    playful: 0.9,
    witty: 0.9,
    tired: 1.6,
    quiet: 1.5,
    empathetic: 1.25
  };
  const mult = multipliers[mood] || 1.0;
  return Math.min(baseDelay * mult + lengthFactor * 300, MAX_DELAY);
}

/**
 * 🌿 Human-like pause — soft hesitation.
 */
export async function humanPause(min = 400, max = 1200) {
  await wait(min + Math.random() * (max - min));
}

/**
 * 🩵 Promise-based wait helper.
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 🌼 Ambient presence
 * Occasionally emits soft poetic "alive" signals.
 */
export async function occasionalHumanTouch(conn, jid) {
  const validJid = safeJid(jid);
  if (!validJid || Math.random() >= 0.12) return;

  const mood = getMood();
  const touchesByMood = {
    calm: ["💭 ...thinking softly.", "🌿 just breathing in silence.", "☁️ peace feels nice."],
    radiant: ["✨ glowing from within.", "💫 still shimmering...", "🌞 what a moment."],
    tired: ["😌 fading slowly...", "🌙 still here, half-asleep.", "🍃 drifting thoughts."],
    playful: ["😆 can’t stop giggling.", "🎠 hehe, this is fun!", "😋 still smiling."],
    empathetic: ["🤍 quiet understanding lingers.", "🌧 I’m listening.", "💭 gentle thoughts."],
    default: ["🩵 just here, quietly existing.", "🌸 still awake...", "😌 silence is comforting."]
  };

  const options = touchesByMood[mood] || touchesByMood.default;
  const text = options[Math.floor(Math.random() * options.length)];

  await wait(2000 + Math.random() * 1200);
  try {
    await conn.sendMessage(validJid, { text });
  } catch (err) {
    console.warn("⚠️ Ambient message failed:", err.message);
  }
}

/**
 * 💫 Natural response finisher
 * Adds an expressive emoji reaction or soft follow-up.
 */
export async function naturalResponseEnd(conn, jid, mood, quotedKey = null) {
  const validJid = safeJid(jid);
  if (!validJid || Math.random() > 0.45) return;

  const emojiMap = {
    calm: ["🌿", "🪷", "☁️"],
    radiant: ["💎", "💫", "🌟"],
    kind: ["🩷", "🌸", "🌼"],
    playful: ["😆", "🎠", "✨"],
    quiet: ["🌙", "🌌", "🍃"],
    tired: ["😴", "😌", "🌙"],
    empathetic: ["🤍", "🌧", "💧"]
  };

  const emoji = (emojiMap[mood] || ["🌸"])[
    Math.floor(Math.random() * (emojiMap[mood]?.length || 1))
  ];

  await wait(800 + Math.random() * 800);
  try {
    await conn.sendMessage(validJid, { react: { text: emoji, key: quotedKey } });
  } catch (err) {
    console.warn("⚠️ Reaction send failed:", err.message);
  }
}

/**
 * 🪶 Queue helper for serialized humanized sequences.
 */
export async function queueHumanizedActions(actions = []) {
  for (const act of actions) {
    await humanPause(500, 1500);
    await act();
  }
}
