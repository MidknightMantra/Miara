// src/commands/tts.js

import axios from "axios";
import fetch from 'node-fetch'; // Ensure node-fetch is installed: npm install node-fetch
import { config } from "../config.js";

const GOOGLE_TTS_URL = "https://translate.google.com/translate_tts";

export default {
  name: "tts", // Name of the command
  alias: ["say"], // Alternative names
  description: "Convert text to speech using Google TTS.",
  category: "media", // Category
  usage: ".tts <language_code> <text>", // Usage instructions

  async execute(conn, m, args) {
    const { from } = m;
    const text = args.join(" ").trim(); // Join all arguments as the text input

    if (!text) {
      await conn.sendMessage(from, { text: "🔊 Please provide text to convert. Usage: .tts <lang> <text>\nExample: .tts en Hello World" });
      return;
    }

    // Default language, can be changed or parsed from args
    let langCode = "en"; // Default to English
    let ttsText = text;

    // Simple parsing: if the first argument looks like a language code (e.g., en, es, fr), use it
    if (args.length > 1 && args[0].length === 2 && /^[a-zA-Z]+$/.test(args[0])) {
        langCode = args[0].toLowerCase();
        ttsText = args.slice(1).join(" ").trim(); // Text is the rest
        if (!ttsText) {
             await conn.sendMessage(from, { text: `🔊 Please provide text to convert after the language code. Usage: .tts ${langCode} <text>` });
             return;
        }
    }

    // Validate language code (optional, basic check)
    // You could have a list of supported codes here
    const supportedLangs = ["af", "sq", "ar", "hy", "bn", "ca", "zh", "zh-cn", "zh-tw", "zh-yue", "hr", "cs", "da", "nl", "en", "eo", "fi", "fr", "de", "el", "hi", "hu", "is", "id", "it", "ja", "km", "ko", "la", "lv", "mk", "no", "pl", "pt", "ro", "ru", "sr", "sk", "es", "sw", "sv", "ta", "th", "tr", "vi", "cy"];
    if (!supportedLangs.includes(langCode)) {
        langCode = "en"; // Fallback to English if unsupported
        ttsText = text; // Use the original text if language was invalid
        console.log(`Unsupported language code '${langCode}' provided, falling back to 'en'.`);
    }


    try {
      console.log(`Generating TTS for text: "${ttsText}" in language: ${langCode}`);

      // Construct the Google TTS URL (this method might be fragile)
      // A more robust approach would be to use the official Google Cloud TTS API with an API key.
      const ttsUrl = `${GOOGLE_TTS_URL}?ie=UTF-8&q=${encodeURIComponent(ttsText)}&tl=${langCode}&total=1&idx=0&textlen=${ttsText.length}&client=tw-ob&prev=input`;

      // Fetch the audio stream
      const response = await fetch(ttsUrl);
      if (!response.ok) {
        throw new Error(`TTS API responded with status ${response.status}`);
      }

      // Get the audio buffer
      const audioBuffer = await response.buffer(); // node-fetch's buffer() method

      // Send the audio as an audio message (not a voice note)
      await conn.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mpeg' });

      console.log(`TTS audio sent successfully to ${from} (lang: ${langCode})`);

    } catch (err) {
      console.error("Error in tts command:", err);
      let errorMessage = "❌ Failed to generate speech.";
      if (err.message) {
          errorMessage += ` Error: ${err.message}`;
      }
      await conn.sendMessage(from, { text: errorMessage });
    }
  },
};
