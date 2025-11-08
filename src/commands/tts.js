/**
 * 🎙️ Miara — Smart Text-to-Speech (2025 Stable)
 * ----------------------------------------------
 * Uses Google Translate's lightweight TTS endpoint to
 * convert text into natural speech in 40+ languages.
 *
 * by MidKnightMantra × GPT-5
 */

import { config } from "../config.js";

const GOOGLE_TTS_URL = "https://translate.google.com/translate_tts";

export default {
  name: "tts",
  aliases: ["say", "speak", "voice"],
  description: "Convert any text to speech using Google TTS 🎧",
  category: "media",
  usage: ".tts <language_code> <text>",

  async execute(conn, m, args) {
    const chat = m.key.remoteJid;
    let text = args.join(" ").trim();

    if (!text) {
      await conn.sendMessage(chat, {
        text:
          "🎙️ *Usage:*\n" +
          "`.tts <lang> <text>`\n" +
          "Example: `.tts en Hello world!`\n\n" +
          "🌐 *Supported:* en, es, fr, de, hi, ja, zh, etc."
      });
      return;
    }

    // 🧠 Detect if first arg looks like a language code
    let lang = "en";
    if (args.length > 1 && /^[a-zA-Z-]{2,5}$/.test(args[0])) {
      lang = args[0].toLowerCase();
      text = args.slice(1).join(" ").trim();
      if (!text) {
        await conn.sendMessage(chat, {
          text: `⚠️ Provide text after the language code.\nExample: .tts ${lang} Hello there!`
        });
        return;
      }
    }

    const supported = [
      "af","sq","ar","hy","bn","ca","zh","zh-cn","zh-tw","zh-yue","hr","cs",
      "da","nl","en","eo","fi","fr","de","el","hi","hu","is","id","it","ja",
      "km","ko","la","lv","mk","no","pl","pt","ro","ru","sr","sk","es","sw",
      "sv","ta","th","tr","vi","cy"
    ];

    if (!supported.includes(lang)) {
      await conn.sendMessage(chat, {
        text: `🌐 Language *"${lang}"* not supported — defaulting to *English (en)* 🇬🇧`
      });
      lang = "en";
    }

    try {
      await conn.sendMessage(chat, { react: { text: "🎧", key: m.key } });
      await conn.sendMessage(chat, {
        text: `🗣️ Speaking in *${lang.toUpperCase()}*...`
      });

      // 🎼 Construct the TTS request URL
      const ttsUrl = `${GOOGLE_TTS_URL}?ie=UTF-8&q=${encodeURIComponent(
        text
      )}&tl=${lang}&total=1&idx=0&textlen=${text.length}&client=tw-ob`;

      // 🕒 Timeout-controlled fetch (10 s)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const res = await fetch(ttsUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      clearTimeout(timeout);

      if (!res.ok)
        throw new Error(`Google TTS responded with HTTP ${res.status}`);

      // ✅ Modern .arrayBuffer() instead of .buffer()
      const audioBuffer = Buffer.from(await res.arrayBuffer());

      // 🎵 Send as WhatsApp voice note
      await conn.sendMessage(
        chat,
        { audio: audioBuffer, mimetype: "audio/mpeg", ptt: true },
        { quoted: m }
      );

      await conn.sendMessage(chat, { react: { text: "✅", key: m.key } });
      console.log(`✅ TTS sent (${lang}): "${text}"`);
    } catch (err) {
      console.error("💥 TTS Error:", err);

      let msg = "❌ *Failed to generate speech.*";
      if (err.name === "AbortError") msg = "⏱️ Request timed out. Try shorter text.";
      else if (/ENOTFOUND/i.test(err.message)) msg = "🌐 Could not reach Google servers.";
      else if (/403/.test(err.message)) msg = "🚫 Google blocked this request temporarily.";

      await conn.sendMessage(chat, { text: msg }, { quoted: m });
      await conn.sendMessage(chat, { react: { text: "❌", key: m.key } });
    }
  }
};
