/**
 * 🌸 Miara 2.0 — Intelligent AI Command
 * Author: MidKnightMantra
 * Unified + Enhanced by GPT-5
 *
 * Features:
 * 🧠 Memory (per-user / per-chat)
 * 🧩 Semantic recall with embeddings
 * ⏳ Time-based memory decay
 * ⚡ Full fallback API pool
 * 🔁 Multi-provider support (OpenAI, Gemini, Mistral, HuggingFace)
 */

import fetch from "node-fetch";
import Database from "better-sqlite3";
import "dotenv/config";

// 🗄️ Database setup
const db = new Database("./miara_cache.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS ai_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command TEXT,
    query TEXT UNIQUE,
    response TEXT,
    timestamp INTEGER
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS ai_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT,
    chat TEXT,
    role TEXT,
    content TEXT,
    embedding TEXT,
    timestamp INTEGER
  )
`).run();

const CACHE_TTL = 10 * 60 * 1000;
const MEMORY_WINDOW = 6; // recent exchanges
const MEMORY_TTL = 1000 * 60 * 60 * 6; // 6 hours

// 🧠 Memory management
const addMemory = (user, chat, role, content, embedding = null) => {
  db.prepare(`
    INSERT INTO ai_memory (user, chat, role, content, embedding, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(user, chat, role, content, embedding, Date.now());
};

const getContext = (user, chat, mode = "auto") => {
  const rows = db
    .prepare(
      "SELECT role, content, timestamp FROM ai_memory WHERE user = ? OR chat = ? ORDER BY id DESC LIMIT ?"
    )
    .all(user, chat, MEMORY_WINDOW)
    .filter(r => Date.now() - r.timestamp < MEMORY_TTL)
    .reverse();
  return rows.map(r => ({ role: r.role, content: r.content }));
};

const clearMemory = (user, chat) => {
  db.prepare("DELETE FROM ai_memory WHERE user = ? OR chat = ?").run(user, chat);
};

const cleanMemory = () => {
  const cutoff = Date.now() - MEMORY_TTL;
  db.prepare("DELETE FROM ai_memory WHERE timestamp < ?").run(cutoff);
};

// 🧬 Embeddings
async function getEmbedding(text) {
  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });
    const data = await res.json();
    return data.data?.[0]?.embedding || null;
  } catch {
    return null;
  }
}

const cosine = (a, b) => {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (magA * magB);
};

const semanticRecall = (user, chat, embedding, limit = 3) => {
  if (!embedding) return [];
  const rows = db.prepare(
    "SELECT content, embedding FROM ai_memory WHERE user = ? OR chat = ?"
  ).all(user, chat);

  return rows
    .filter(r => r.embedding)
    .map(r => ({
      content: r.content,
      score: cosine(JSON.parse(r.embedding), embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.content);
};

// ⚙️ Cache
const setCache = (command, query, response) => {
  db.prepare(`
    INSERT OR REPLACE INTO ai_cache (query, command, response, timestamp)
    VALUES (?, ?, ?, ?)
  `).run(query, command, response, Date.now());
};

// 🪄 Main export
export default {
  name: "gpt",
  aliases: ["gemini", "mix", "ai"],
  description: "AI chat with persistent + semantic memory and fallback providers",
  usage: ".gpt <query> | .gpt clear | .gpt mode user/chat",

  async execute(conn, m, args) {
    const from = m.from;
    const user = m.sender;
    const query = args.join(" ").trim();
    const command = m.text.split(" ")[0].toLowerCase();

    if (!query) {
      await conn.sendMessage(from, { text: "❗ Provide a query." }, { quoted: m });
      return;
    }

    // 🧹 Memory clear
    if (query.toLowerCase() === "clear") {
      clearMemory(user, from);
      await conn.sendMessage(from, { text: "🧽 Memory cleared for this chat." }, { quoted: m });
      return;
    }

    // 🧭 Mode switch
    if (query.startsWith("mode")) {
      const mode = query.split(" ")[1];
      if (["user", "chat"].includes(mode)) {
        setCache("mode", `mode:${from}`, mode);
        await conn.sendMessage(from, { text: `🔧 Memory mode set to *${mode}*` }, { quoted: m });
        return;
      }
    }

    // Retrieve mode
    const modeRow = db.prepare("SELECT response FROM ai_cache WHERE query = ?").get(`mode:${from}`);
    const mode = modeRow?.response || "auto";

    await conn.sendMessage(from, { react: { text: "🤖", key: m.key } });
    await conn.sendPresenceUpdate("composing", from);

    cleanMemory();

    const OPENAI_KEY = process.env.OPENAI_KEY || "";
    const GEMINI_KEY = process.env.GOOGLE_GEMINI_KEY || "";
    const MISTRAL_KEY = process.env.MISTRAL_KEY || "";
    const HF_TOKEN = process.env.HF_TOKEN || "";

    const history = getContext(user, from, mode);
    const embedding = await getEmbedding(query);
    const recall = semanticRecall(user, from, embedding);

    const messages = [
      ...history,
      ...(recall.length ? [{ role: "system", content: `Related topics: ${recall.join("; ")}` }] : []),
      { role: "user", content: query },
    ];

    // 🧩 Providers
    const PROVIDERS = {
      openai: {
        name: "OpenAI",
        key: OPENAI_KEY,
        url: "https://api.openai.com/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: () => ({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.8,
        }),
        parse: (r) => r.choices?.[0]?.message?.content?.trim(),
      },
      gemini: {
        name: "Gemini",
        key: GEMINI_KEY,
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_KEY}`,
        headers: { "Content-Type": "application/json" },
        body: () => ({
          contents: messages.map(m => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
          }))
        }),
        parse: (r) => r.candidates?.[0]?.content?.parts?.[0]?.text?.trim(),
      },
      mistral: {
        name: "Mistral",
        key: MISTRAL_KEY,
        url: "https://api.mistral.ai/v1/chat/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_KEY}`,
        },
        body: () => ({
          model: "mistral-small",
          messages,
          temperature: 0.7,
        }),
        parse: (r) => r.choices?.[0]?.message?.content?.trim(),
      },
      huggingface: {
        name: "HuggingFace",
        key: HF_TOKEN,
        url: "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HF_TOKEN}`,
        },
        body: () => ({ inputs: query }),
        parse: (r) => Array.isArray(r) ? r[0]?.generated_text : r?.generated_text,
      },
    };

    // 🌍 Full fallback pool
    const FALLBACK_APIS = [
      `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`,
      `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
      `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
      `https://api.ryzendesu.vip/api/ai/chatgpt?text=${encodeURIComponent(query)}`,
      `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
      `https://api.neoxr.eu/api/openai?q=${encodeURIComponent(query)}`,
      `https://api.neoxr.eu/api/gemini?q=${encodeURIComponent(query)}`,
      `https://api.akuari.my.id/ai/gpt?query=${encodeURIComponent(query)}`,
      `https://api.akuari.my.id/ai/gemini?query=${encodeURIComponent(query)}`,
      `https://api.betabotz.eu.org/api/ai/gpt-4?apikey=beta&q=${encodeURIComponent(query)}`,
      `https://api.betabotz.eu.org/api/ai/gemini-pro?apikey=beta&q=${encodeURIComponent(query)}`,
      `https://api.zahwazein.xyz/ai/gpt?apikey=zenzkey&q=${encodeURIComponent(query)}`,
      `https://api.zahwazein.xyz/ai/gemini?apikey=zenzkey&q=${encodeURIComponent(query)}`,
      `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`,
      `https://api.giftedtech.my.id/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(query)}`,
      `https://api.giftedtech.my.id/api/ai/gpt3?apikey=gifted&q=${encodeURIComponent(query)}`,
      `https://deliriusapi-official.vercel.app/api/ai/chatgpt?q=${encodeURIComponent(query)}`,
      `https://deliriusapi-official.vercel.app/api/ai/gemini?q=${encodeURIComponent(query)}`,
      `https://widipe.com/ai/gpt?text=${encodeURIComponent(query)}`,
      `https://widipe.com/ai/gemini?text=${encodeURIComponent(query)}`,
      `https://hadi-api.my.id/api/ai/openai?text=${encodeURIComponent(query)}`,
      `https://hadi-api.my.id/api/ai/gemini?text=${encodeURIComponent(query)}`,
      `https://api.lolhuman.xyz/api/openai?apikey=lolhuman&text=${encodeURIComponent(query)}`,
      `https://api.lolhuman.xyz/api/ai/gemini?apikey=lolhuman&text=${encodeURIComponent(query)}`,
      `https://api.akuari.my.id/api/openai?text=${encodeURIComponent(query)}`,
    ];

    const fetchWithTimeout = async (url, opts = {}, timeout = 10000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const res = await fetch(url, { ...opts, signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        clearTimeout(timer);
        throw err;
      }
    };

    const shuffle = (a) => a.sort(() => Math.random() - 0.5);

    let answer = "";

    try {
      // Try main providers
      for (const key of shuffle(Object.keys(PROVIDERS))) {
        const api = PROVIDERS[key];
        if (!api.key) continue;
        try {
          const res = await fetch(api.url, {
            method: "POST",
            headers: api.headers,
            body: JSON.stringify(api.body()),
          });
          const data = await res.json();
          const parsed = api.parse(data);
          if (parsed) {
            answer = parsed;
            console.log(`✅ Answered by ${api.name}`);
            break;
          }
        } catch (err) {
          console.warn(`⚠️ ${api.name} failed: ${err.message}`);
        }
      }

      // Fallback pool
      if (!answer) {
        for (const url of shuffle(FALLBACK_APIS)) {
          try {
            const data = await fetchWithTimeout(url, {}, 8000);
            const out = data.result || data.answer || data.message || data.data || "";
            if (out) {
              answer = out;
              console.log(`✅ Fallback success: ${url.split("/")[2]}`);
              break;
            }
          } catch {
            console.warn(`⚠️ Mirror failed: ${url.split("/")[2]}`);
          }
        }
      }

      if (!answer) throw new Error("No AI provider returned a valid response.");

      addMemory(user, from, "user", query, JSON.stringify(embedding || []));
      addMemory(user, from, "assistant", answer, null);

      setCache(command, query, answer);

      await conn.sendMessage(from, { text: `💬 *Miara says:*\n\n${answer}` }, { quoted: m });
      await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    } catch (err) {
      console.error("❌ Error:", err);
      await conn.sendMessage(from, { text: "⚠️ All AI sources failed." }, { quoted: m });
      await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    } finally {
      await conn.sendPresenceUpdate("paused", from);
    }
  },
};
