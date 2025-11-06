/**
 * 🌸 Miara Command: GPT & Gemini AI
 * Works with Miara ESM command loader
 */

import axios from "axios";
import fetch from "node-fetch";

export default {
  name: "gpt",
  aliases: ["gemini"],
  description: "Chat with AI using GPT or Gemini models.",
  category: "ai",
  usage: ".gpt <query> or .gemini <query>",

  async execute(conn, m, args) {
    const from = m.from;
    const query = args.join(" ").trim();
    const command = m.text.split(" ")[0].toLowerCase();

    if (!query) {
      await conn.sendMessage(
        from,
        {
          text: "❗ Please provide a question.\n\nExample:\n.gpt write a basic HTML code",
        },
        { quoted: m }
      );
      return;
    }

    // 📖 Changed reaction emoji here
    await conn.sendMessage(from, { react: { text: "📖", key: m.key } });

    try {
      let answer = "";

      // GPT handler
      if (command === ".gpt" || command === "gpt") {
        const response = await axios.get(
          `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
          { timeout: 15000 }
        );
        answer = response.data?.result || "⚠️ No response from GPT.";
      }

      // Gemini handler
      else {
        const apis = [
          `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
          `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
          `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
          `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
          `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
          `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`,
        ];

        const fetchWithTimeout = async (url, timeout = 10000) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeout);
          try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            return await res.json();
          } catch (err) {
            clearTimeout(timer);
            throw err;
          }
        };

        const result = await Promise.any(
          apis.map(async (url) => {
            const data = await fetchWithTimeout(url);
            const output = data.result || data.answer || data.message || data.data;
            if (!output) throw new Error("Empty response");
            return output;
          })
        );
        answer = result;
      }

      await conn.sendMessage(
        from,
        {
          text: `📚 *Miara Response:*\n\n${answer}`,
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("AI Command Error:", err);
      await conn.sendMessage(
        from,
        {
          text: "❌ Failed to get AI response. Please try again later.",
        },
        { quoted: m }
      );
    }
  },
};
