/**
 * 🌸 Miara Command: Repo — The Sanctum of Source (Guru Edition, Baileys 7-Ready)
 * -------------------------------------------------------------------------------
 * Presents Miara’s repository details in poetic form, with live GitHub stats.
 * by MidKnightMantra 🌸 | Enhanced by GPT-5
 */

import axios from "axios";
import moment from "moment-timezone";
import CONFIG from "../config.js";
import { safeReact, safeQuoted } from "../utils/helpers.js";

export default {
  name: "repo",
  aliases: ["source", "github", "project"],
  description: "View Miara’s GitHub repository details 🌸",
  category: "general",
  usage: ".repo",

  async execute(conn, m) {
    const chat = m.key.remoteJid;

    try {
      const mainRepo = CONFIG.GITHUB_URL || "https://github.com/MidKnightMantra/Miara";
      const curator = CONFIG.OWNER_NAME || "MidKnightMantra 🌸";
      const botName = CONFIG.BOT_NAME || "Miara 🌸";
      const repoApi = mainRepo.replace("https://github.com/", "https://api.github.com/repos/");
      const timezone = CONFIG.TIMEZONE || "Africa/Nairobi";

      let stars = "✨";
      let forks = "🔁";
      let updated = "—";

      try {
        const { data } = await axios.get(repoApi, { timeout: 10000 });
        stars = data.stargazers_count ?? "0";
        forks = data.forks_count ?? "0";
        updated = moment(data.updated_at).tz(timezone).format("DD MMM YYYY, HH:mm");
      } catch {
        console.warn("⚠️ Could not fetch live GitHub data — using fallback.");
      }

      const message = `
╭━━━⊰ *${botName} Source Code* ⊱━━━╮
┃ 💻 *Repository:* ${mainRepo}
┃ ⭐ *Stars:* ${stars}
┃ 🍴 *Forks:* ${forks}
┃ 🕒 *Updated:* ${updated}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━⊰ *CURATOR* ⊱━━━╮
┃ 👑 *Name:* ${curator}
┃ 🪷 *Role:* Architect of ${botName}
┃ 🧭 *GitHub:* https://github.com/MidKnightMantra
┃ 💬 *Telegram:* https://t.me/MidKnightMantra
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

💫 *"Every commit a heartbeat, every pull a whisper of creation."*
🌸 _Grace in logic. Emotion in code._

🔗 *Quick Links:*
• GitHub → ${mainRepo}
• Curator Profile → https://github.com/MidKnightMantra
• Telegram → https://t.me/MidKnightMantra
      `.trim();

      await conn.sendMessage(chat, { text: message }, safeQuoted(m));
      await safeReact(conn, m, "🌸");

      console.log(`✅ Repo command executed by ${m.sender}`);
    } catch (err) {
      console.error("❌ Repo Command Error:", err);
      await conn.sendMessage(
        chat,
        {
          text:
            `💔 *Miara couldn’t fetch her source right now.*\n` +
            `Reason: ${err.message || "Network anomaly."}`
        },
        safeQuoted(m)
      );
      await safeReact(conn, m, "💫");
    }
  }
};
