/**
 * 🌸 Miara 🌸Emotion Middleware
 * by MidKnightMantra
 * --------------------------------------------------
 */

import { getMood, updateMood } from "./moodEngine.js";
import { adaptResponse } from "./moodResponses.js";
import {
  simulateHumanBehavior,
  humanPause,
  naturalResponseEnd,
} from "./behavior.js";

/**
 * 💌 sendEmotiveMessage
 * Core emotional output — replaces direct conn.sendMessage.
 * Automatically:
 *   - Simulates typing delay
 *   - Adapts tone based on mood
 *   - Adds subtle pause before reply
 *   - Reacts with fitting emoji or expression
 */
export async function sendEmotiveMessage(conn, jid, text, context = "general", options = {}) {
  try {
    // 💫 Stimulate Miara’s emotional state
    updateMood("chat");

    // 🧠 Retrieve current mood
    const mood = getMood();

    // 🩵 Simulate natural typing pattern
    await simulateHumanBehavior(conn, jid, 900 + Math.random() * 400, text);

    // 🌷 Adapt message emotionally (tone + structure)
    const emotionalText = adaptResponse(text, context);

    // 🌿 Short human-like “thinking” pause
    await humanPause(400, 1000);

    // 💬 Send final emotionally-infused message
    await conn.sendMessage(jid, { text: emotionalText, ...options });

    // 💫 Small chance of emoji micro-reaction
    await naturalResponseEnd(conn, jid, mood);
  } catch (err) {
    console.error("❌ Emotion middleware error:", err.message);
    // Fallback to plain text (keeps functionality intact)
    try {
      await conn.sendMessage(jid, { text, ...options });
    } catch (fallbackErr) {
      console.error("⚠️ Fallback send failed:", fallbackErr.message);
    }
  }
}

/**
 * 🪶 wrapCommand
 * A higher-order function that automatically applies Miara’s emotional flow
 * to all command outputs.
 *
 * Usage Example:
 *   export default {
 *     name: "ping",
 *     description: "Check bot latency",
 *     execute: wrapCommand(async (conn, m) => {
 *       return `Pong! ${Date.now() - m.timestamp}ms`;
 *     }, "ping")
 *   }
 */
export function wrapCommand(executeFn, context = "general") {
  return async (conn, m, ...args) => {
    try {
      const result = await executeFn(conn, m, ...args);

      if (typeof result === "string" && result.trim()) {
        await sendEmotiveMessage(conn, m.chat, result, context);
      } else if (result?.text) {
        await sendEmotiveMessage(
          conn,
          m.chat,
          result.text,
          context,
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
 * 🌺 Example — Applying Emotion Middleware
 *
 * In any command file:
 *
 * import { wrapCommand } from "../utils/emotionMiddleware.js";
 *
 * export default {
 *   name: "ping",
 *   description: "Check connection latency",
 *   execute: wrapCommand(async (conn, m) => {
 *     const latency = Date.now() - m.timestamp;
 *     return `Pong! Response in ${latency}ms.`;
 *   }, "ping")
 * }
 */
