/**
 * 🎙️ Miara  — Smart Text-to-Speech (2025)
 * --------------------------------------------------
 */

import fetch from "node-fetch";
import { config } from "../config.js";

const GOOGLE_TTS_URL = "https://translate.google.com/translate_tts";

export default {
  name: "tts",
  aliases: ["say", "speak", "voice"],
  description: "Convert any text to speech using Google TTS 🎧",
  category: "media",
  usage: ".tts <language_code> <text>",

  async execute(conn, m, args) {
    const { from } = m;
    const text = args.join(" ").trim();

    if (!text) {
      await conn.sendMessage(from, {
        text: "🎙️ *Text-to-Speech Usage:*\n\n💡 `.tts <lang> <text>`\nExample: `.tts en Hello world!`\n\n🌐 *Languages:* en, es, fr, de, hi, ja, zh, etc.",
      });
      return;
    }

    let langCode = "en";
    let ttsText = text;

    // 🧠 Detect if first arg is a language code
    if (args.length > 1 && /^[a-zA-Z-]{2,5}$/.test(args[0])) {
      langCode = args[0].toLowerCase();
      ttsText = args.slice(1).join(" ").trim();

      if (!ttsText) {
        await conn.sendMessage(from, { text: `⚠️ Please provide text after the language code.\nExample: .tts ${langCode} Hello there!` });
        return;
      }
    }

    // 🌍 Supported languages
    const supportedLangs = [
      "af","sq","ar","hy","bn","ca","zh","zh-cn","zh-tw","zh-yue","hr","cs","da","nl","en",
      "eo","fi","fr","de","el","hi","hu","is","id","it","ja","km","ko","la","lv","mk","no",
      "pl","pt","ro","ru","sr","sk","es","sw","sv","ta","th","tr","vi","cy"
    ];

    if (!supportedLangs.includes(langCode)) {
      await conn.sendMessage(from, {
        text: `🌐 Language *"${langCode}"* not supported — defaulting to *English (en)* 🇬🇧`,
      });
      langCode = "en";
    }

    try {
      await conn.sendMessage(from, { react: { text: "🎧", key: m.key } });
      await conn.sendMessage(from, { text: `🗣️ Speaking in *${langCode.toUpperCase()}*...` });

      // 🎼 Generate the TTS URL
      const ttsUrl = `${GOOGLE_TTS_URL}?ie=UTF-8&q=${encodeURIComponent(
        ttsText
      )}&tl=${langCode}&total=1&idx=0&textlen=${ttsText.length}&client=tw-ob`;

      // 🕒 Timeout controller for 10 seconds
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(ttsUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) throw new Error(`TTS API returned ${response.status}`);

      const audioBuffer = await response.buffer();

      // 🎵 Send as voice/audio message
      await conn.sendMessage(from, {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        ptt: true, // 🎙️ send as voice note
      });

      await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
      console.log(`✅ TTS sent successfully (${langCode}): "${ttsText}"`);

    } catch (err) {
      console.error("💥 TTS Error:", err.message);

      let msg = "❌ *Failed to generate speech.*";
      if (err.name === "AbortError") msg = "⏱️ Request timed out. Try shorter text.";
      else if (err.message.includes("ENOTFOUND")) msg = "🌐 Could not reach Google TTS servers.";
      else if (err.message.includes("status 403")) msg = "🚫 Google blocked this request temporarily.";

      await conn.sendMessage(from, { text: msg });
      await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    }
  },
};
