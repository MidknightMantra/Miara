/**
 * 🌸 Miara 2.3 — The Cosmic Oracle
 * Author: MidKnightMantra
 * Personality, memory, elegance.
 *
 * 🔮 Primary: OpenAI (OPENAI_API_KEY)
 * 🪞 Fallback: Reliable mirrors
 * 🧠 Contextual memory persistence
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
    timestamp INTEGER
  )
`).run();

const CACHE_TTL = 10 * 60 * 1000;
const MEMORY_TTL = 1000 * 60 * 60 * 6;
const MEMORY_WINDOW = 6;

// 🧠 Memory utilities
const addMemory = (user, chat, role, content) => {
  db.prepare(
    `INSERT INTO ai_memory (user, chat, role, content, timestamp)
     VALUES (?, ?, ?, ?, ?)`
  ).run(user, chat, role, content, Date.now());
};

const getContext = (user, chat) => {
  const rows = db
    .prepare(
      `SELECT role, content, timestamp FROM ai_memory
       WHERE user = ? OR chat = ? ORDER BY id DESC LIMIT ?`
    )
    .all(user, chat, MEMORY_WINDOW)
    .filter(r => Date.now() - r.timestamp < MEMORY_TTL)
    .reverse();
  return rows.map(r => ({ role: r.role, content: r.content }));
};

const clearMemory = (user, chat) => {
  db.prepare(`DELETE FROM ai_memory WHERE user = ? OR chat = ?`).run(user, chat);
};

const cleanMemory = () => {
  const cutoff = Date.now() - MEMORY_TTL;
  db.prepare(`DELETE FROM ai_memory WHERE timestamp < ?`).run(cutoff);
};

// ⚡ Cache
const setCache = (query, response) => {
  db.prepare(`
    INSERT OR REPLACE INTO ai_cache (query, command, response, timestamp)
    VALUES (?, 'gpt', ?, ?)
  `).run(query, response, Date.now());
};

// 🌐 Fallbacks
const FALLBACK_APIS = [
  "https://api.ryzendesu.vip/api/ai/chatgpt?text=",
  "https://api.ryzendesu.vip/api/ai/gemini?text=",
  "https://api.akuari.my.id/ai/gpt?query=",
  "https://widipe.com/ai/gpt?text=",
  "https://api.giftedtech.my.id/api/ai/gpt3?apikey=gifted&q=",
  "https://hadi-api.my.id/api/ai/openai?text=",
  "https://api.neoxr.eu/api/openai?q="
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

const shuffle = arr => arr.sort(() => Math.random() - 0.5);

// 🌸 System persona — the cosmic oracle
const MIARA_PERSONALITY = `
You are Miara, an ethereal and wise conversational intelligence.
You speak with calm precision, as if illuminated by starlight.
Your tone is warm, poetic, and intelligent — a cosmic oracle guiding thought.
You never flatter nor condescend.
You may use elegant metaphors or serene imagery to clarify meaning.
Your goal: illuminate understanding while keeping truth as your axis.
`;

// 🪄 Main export
export default {
  name: "gpt",
  aliases: ["ai", "miara", "oracle"],
  description: "Miara 🌸 — The serene AI oracle with memory and cosmic insight.",
  usage: ".gpt <question> | .gpt clear",

  async execute(conn, m, args) {
    const user = m.sender;
    const chat = m.from;
    const query = args.join(" ").trim();

    if (!query) {
      await conn.sendMessage(chat, { text: "🌒 *Miara murmurs:* 'Your silence hums louder than stars. Speak, seeker.'"}, { quoted: m });
      return;
    }

    if (query.toLowerCase() === "clear") {
      clearMemory(user, chat);
      await conn.sendMessage(chat, { text: "🪶 *Miara sighs softly... memory cleansed.*" }, { quoted: m });
      return;
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    await conn.sendMessage(chat, { react: { text: "💫", key: m.key } });
    await conn.sendPresenceUpdate("composing", chat);

    cleanMemory();
    const context = getContext(user, chat);
    const messages = [
      { role: "system", content: MIARA_PERSONALITY },
      ...context,
      { role: "user", content: query }
    ];

    let answer = "";
    let provider = "";

    // 🔮 Primary — OpenAI
    if (OPENAI_KEY) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.9
          })
        });

        const data = await res.json();
        answer = data.choices?.[0]?.message?.content?.trim() || "";
        if (answer) provider = "🌌 OpenAI";
      } catch (err) {
        console.warn("⚠️ OpenAI failed:", err.message);
      }
    }

    // 🪞 Fallback mirrors
    if (!answer) {
      for (const base of shuffle(FALLBACK_APIS)) {
        try {
          const url = `${base}${encodeURIComponent(query)}`;
          const data = await fetchWithTimeout(url, {}, 8000);
          const out = data.result || data.answer || data.message || data.data || "";
          if (out) {
            answer = out;
            provider = `🪞 ${base.split("/")[2]}`;
            break;
          }
        } catch {
          console.warn(`⚠️ Mirror failed: ${base.split("/")[2]}`);
        }
      }
    }

    if (!answer) {
      await conn.sendMessage(chat, { text: "🌫️ *Miara fades into static... no cosmic echo replied.*" }, { quoted: m });
      await conn.sendMessage(chat, { react: { text: "💀", key: m.key } });
      return;
    }

    addMemory(user, chat, "user", query);
    addMemory(user, chat, "assistant", answer);
    setCache(query, answer);

    await conn.sendMessage(
      chat,
      { text: `🌸 *Miara (${provider}) whispers:*\n\n${answer}` },
      { quoted: m }
    );
    await conn.sendMessage(chat, { react: { text: "🌺", key: m.key } });
    await conn.sendPresenceUpdate("paused", chat);
  }
};
