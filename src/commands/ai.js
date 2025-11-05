/**
 * ai command — simple wrapper showing how to implement an async command
 * Usage: !ai <prompt>
 *
 * This example does not call a real AI provider. If you have an API key (e.g. OpenAI),
 * plug it in using config.OPENAI_API_KEY
 */

import fetch from "node-fetch";
import { config } from "../config.js";

export default async function (Miara, m, args) {
  const prompt = args.join(" ");
  if (!prompt) return Miara.sendMessage(m.chat, { text: "💬 Please provide a prompt. Usage: !ai tell me a joke" }, { quoted: m });

  // If OPENAI_API_KEY is set you can call OpenAI. Here's a simple placeholder:
  if (!config.OPENAI_API_KEY) {
    // fallback canned response
    return Miara.sendMessage(m.chat, { text: `🤖 (demo) You said: ${prompt}` }, { quoted: m });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 600
      })
    });
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content || JSON.stringify(data);
    await Miara.sendMessage(m.chat, { text: `🤖 AI Response:\n\n${reply}` }, { quoted: m });
  } catch (e) {
    console.error("AI error:", e);
    await Miara.sendMessage(m.chat, { text: "❌ Failed to fetch AI response." }, { quoted: m });
  }
}
