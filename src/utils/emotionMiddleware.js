/**
 * 🌸 Miara 🌸 Emotion Middleware (Deluxe Stable 2025)
 * by MidKnightMantra × GPT-5
 * --------------------------------------------------
 * Bridges thought and expression — transforming logical outputs
 * into emotionally-infused, mood-aware communication.
 */

import { getMood, updateMood } from "./moodEngine.js";
import { adaptResponse } from "./moodResponses.js";
import { simulateHumanBehavior, humanPause, naturalResponseEnd } from "./behavior.js";

const DEBUG_EMOTION = process.env.DEBUG_EMOTION === "true";

// 🌸 Per-chat processing tracker (avoids global message block)
const processingMap = new Map();

/**
 * 💌 sendEmotiveMessage
 * Core emotional output — replaces direct conn.sendMessage.
 * Automatically:
 *   - Simulates typing delay
 *   - Adapts tone based on mood and context
 *   - Adds subtle human pause before reply
 *   - Reacts with fitting emoji or expression
 */
export async function sendEmotiveMessage(conn, jid, text, context = "general", options = {}) {
  if (!conn || !jid || !text) return;

  // prevent reentry per chat (not global)
  if (processingMap.get(jid)) {
    if (DEBUG_EMOTION) console.log(`⚠️ [EMOTION] Skipping overlapping send for ${jid}`);
    await conn.sendMessage(jid, { text, ...options });
    return;
  }

  processingMap.set(jid, true);

  try {
    updateMood(context || "chat");
    const mood = getMood();

    // Mood-based typing delay — subtle realism
    const moodDelays = {
      calm: 1.2,
      radiant: 0.9,
      playful: 1.0,
      witty: 0.95,
      tired: 1.4,
      empathetic: 1.3,
      focused: 1.0
    };

    const delayScale = moodDelays[mood] || 1.0;
    const baseDelay = (800 + Math.random() * 400) * delayScale;

    await simulateHumanBehavior(conn, jid, baseDelay, text);

    const emotionalText = adaptResponse(text, context, mood);

    if (DEBUG_EMOTION) {
      console.log(
        `[Emotion Log] Context: ${context} | Mood: ${mood} | Text: "${emotionalText}"`
      );
    }

    await humanPause(300, 900);
    await conn.sendMessage(jid, { text: emotionalText, ...options });

    // tiny chance of reaction at the end (emoji or ephemeral response)
    if (Math.random() < 0.12) {
      await naturalResponseEnd(conn, jid, mood);
    }
  } catch (err) {
    console.error(`❌ Emotion middleware error (${context}): ${err.message}`);
    try {
      await conn.sendMessage(jid, { text, ...options });
    } catch (fallbackErr) {
      console.error(`⚠️ Fallback send failed: ${fallbackErr.message}`);
    }
  } finally {
    processingMap.delete(jid);
  }
}

/**
 * 🪶 wrapCommand
 * Higher-order command wrapper that automatically adapts output
 * through Miara’s emotional system.
 *
 * Example:
 * export default {
 *   name: "ping",
 *   execute: wrapCommand(async (conn, m) => `Pong! ${Date.now() - m.timestamp}ms`, "ping")
 * }
 */
export function wrapCommand(executeFn, context = "general") {
  return async (conn, m, ...args) => {
    try {
      const result = await executeFn(conn, m, ...args);
      if (!result) return;

      if (typeof result === "string") {
        await sendEmotiveMessage(conn, m.chat, result, context);
      } else if (result?.text) {
        await sendEmotiveMessage(
          conn,
          m.chat,
          result.text,
          result.context || context,
          result.options || {}
        );
      }
    } catch (err) {
      console.error(`⚠️ Command ${context} failed: ${err.message}`);
      await sendEmotiveMessage(conn, m.chat, "Something went wrong...", "error");
    }
  };
}

/**
 * 🪄 Contextual mood triggers
 * These can be attached to message types or command results
 * for richer emotion transitions in the future.
 */
export const EmotionContext = {
  GREETING: "chat",
  HELP: "focused",
  JOKE: "playful",
  COMPLIMENT: "compliment",
  ERROR: "error",
  CRITICISM: "criticism",
  COMMAND: "command",
  GENERAL: "general"
};
