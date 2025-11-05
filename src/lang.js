/**
 * 🌍 Miara Language System
 * Author: MidKnight
 * Supports English (en) & Swahili (sw)
 */

export const messages = {
  en: {
    privateMode:
      "🔒 Miara is currently in *private mode*. Only the owner can use commands.",
    stickerHint: "📸 Reply to an image or short video with `.s` to make a sticker.",
    stickerFail: "❌ Failed to create sticker.",
    fetchFail: "❌ Could not fetch media.",
    fetchUsage: (prefix) => `🔗 Usage: ${prefix}fetch <image_url>`,
    unknownCmd: (prefix) => `🤖 Unknown command. Try *${prefix}menu*.`,
  },

  sw: {
    privateMode:
      "🔒 Miara ipo katika *hali ya faragha*. Ni mmiliki pekee anayeweza kutumia amri.",
    stickerHint: "📸 Jibu picha au video fupi kwa `.s` kutengeneza stika.",
    stickerFail: "❌ Imeshindwa kutengeneza stika.",
    fetchFail: "❌ Haikuweza kupakua faili.",
    fetchUsage: (prefix) => `🔗 Matumizi: ${prefix}fetch <kiungo_cha_picha>`,
    unknownCmd: (prefix) => `🤖 Amri haijatambulika. Jaribu *${prefix}menu*.`,
  },
};

/**
 * Get translated message
 * @param {string} lang - language code (en, sw)
 * @param {string} key - message key
 * @param  {...any} args - extra args for dynamic text
 */
export function t(lang, key, ...args) {
  const dict = messages[lang] || messages.en;
  const msg = dict[key] || messages.en[key];
  if (typeof msg === "function") return msg(...args);
  return msg || key;
}
