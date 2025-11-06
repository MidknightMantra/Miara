/**
 * 🌸 Miara Command: Repo — The Sanctum of Source (Guru Style)
 * ------------------------------------------------------------
 * Shows Miara’s repository information in a poetic, formatted card.
 * With live GitHub stats and the Curator’s signature.
 *
 * by MidKnightMantra 🌸 | Styled by GPT-5
 */

import axios from "axios";
import moment from "moment-timezone";
import { config } from "../config.js";

export default {
  name: "repo",
  aliases: ["source", "github", "project"],
  description: "View Miara’s GitHub repository details 🌸",
  category: "general",
  usage: ".repo",

  async execute(conn, m, args) {
    try {
      const mainRepo =
        config.GITHUB_URL || "https://github.com/MidKnightMantra/Miara";
      const curator = config.OWNER_NAME || "MidKnightMantra 🌸";
      const botName = config.BOT_NAME || "Miara 🌸";
      const repoApi = mainRepo.replace(
        "https://github.com/",
        "https://api.github.com/repos/"
      );

      let stars = "✨";
      let forks = "🔁";
      let updated = "—";

      try {
        const { data } = await axios.get(repoApi, { timeout: 15000 });
        stars = data.stargazers_count || 0;
        forks = data.forks_count || 0;
        updated = moment(data.updated_at)
          .tz("Africa/Nairobi")
          .format("DD MMM YYYY, HH:mm");
      } catch {
        console.warn("⚠️ Could not fetch live repo data — fallback values used.");
      }

      const message = `
╭━━━⊰ *${botName} Source Code* ⊱━━━╮
┃
┃ 💻 *Repository:* ${mainRepo}
┃ ⭐ *Stars:* ${stars}
┃ 🍴 *Forks:* ${forks}
┃ 🕒 *Updated:* ${updated}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━⊰ *CURATOR* ⊱━━━╮
┃ 👑 *Name:* ${curator}
┃ 🪷 *Role:* Architect of ${botName}
┃ 🧭 *GitHub:* https://github.com/MidKnightMantra
┃ 💬 *Telegram:* https://t.me/MidKnightMantra
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

💫 *"Every commit a heartbeat, every pull a whisper of creation."*
🌸 _Grace in logic. Emotion in code._
      `.trim();

      await conn.sendMessage(
        m.chat,
        {
          text: message,
          footer: "© 2025 Miara — Crafted by MidKnightMantra 🌸",
          buttons: [
            {
              buttonId: "visit_repo",
              buttonText: { displayText: "💻 Visit Miara Repository" },
              type: 1,
            },
            {
              buttonId: "visit_owner",
              buttonText: { displayText: "👑 About the Curator" },
              type: 1,
            },
          ],
          headerType: 1,
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: "🌸", key: m.key } });
      console.log(`✅ Repo command executed by ${m.sender}`);
    } catch (err) {
      console.error("❌ Repo Command Error:", err);
      await conn.sendMessage(
        m.chat,
        {
          text: `💔 *Miara couldn’t fetch her source right now.*\nReason: ${
            err.message || "Network anomaly."
          }`,
        },
        { quoted: m }
      );
      await conn.sendMessage(m.chat, { react: { text: "💫", key: m.key } });
    }
  },
};
