/**
 * 🌸 Miara 🌸 Emotion Middleware (2025)
 * by MidKnightMantra
 * --------------------------------------------------
 * Bridges thought and expression — transforming logical outputs
 * into emotionally-infused, mood-aware communication.
 */

import { getMood, updateMood } from "./moodEngine.js";
import { adaptResponse } from "./moodResponses.js";
import { simulateHumanBehavior, humanPause, naturalResponseEnd } from "./behavior.js";

// 🩵 Optional: enable verbose emotional logging via .env
const DEBUG_EMOTION = process.env.DEBUG_EMOTION === "true";

// 🧠 Prevent recursive re-entry (important for concurrent messages)
let isProcessing = false;

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
  if (isProcessing) {
    // safeguard: if another emotive send is running, avoid recursion
    await conn.sendMessage(jid, { text, ...options });
    return;
  }

  try {
    isProcessing = true;

    // 💫 Stimulate Miara’s emotional state
    updateMood(context || "chat");

    // 🧠 Retrieve current mood snapshot
    const mood = getMood();
    const baseDelay = 900 + Math.random() * 400;

    // 🩵 Simulate natural typing pattern
    await simulateHumanBehavior(conn, jid, baseDelay, text);

    // 🌷 Adapt message emotionally (tone + style)
    const emotionalText = adaptResponse(text, context, mood);

    if (DEBUG_EMOTION) {
      console.log(`[Emotion Log] Context: ${context} | Mood: ${mood} | Text: "${emotionalText}"`);
    }

    // 🌿 Short human-like “thinking” pause
    await humanPause(400, 1000);

    // 💬 Send final emotionally-infused message
    await conn.sendMessage(jid, { text: emotionalText, ...options });

    // 💫 Small chance of emoji micro-reaction
    await naturalResponseEnd(conn, jid, mood);
  } catch (err) {
    console.error("❌ Emotion middleware error:", err.message);
    try {
      await conn.sendMessage(jid, { text, ...options });
    } catch (fallbackErr) {
      console.error("⚠️ Fallback send failed:", fallbackErr.message);
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * 🪶 wrapCommand
 * A higher-order wrapper for commands, injecting emotional context.
 *
 * Example:
 * export default {
 *   name: "ping",
 *   description: "Check latency",
 *   execute: wrapCommand(async (conn, m) => {
 *     return `Pong! ${Date.now() - m.timestamp}ms`;
 *   }, "ping")
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
      console.error(`⚠️ Command ${context} failed:`, err.message);
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
