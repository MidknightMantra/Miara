import { config } from "../config.js";
import { sleep } from "../utils/helpers.js";

export default {
  name: "restart",
  description: "Restart Miara (owner only).",
  category: "owner",
  usage: ".restart",

  async execute(conn, m) {
    if (!config.OWNER_NUMBER.includes(m.sender.split("@")[0])) {
      await conn.sendMessage(m.from, { text: "❌ Only the owner can restart the bot." });
      return;
    }

    await conn.sendMessage(m.from, { text: "♻️ Restarting Miara..." }, { quoted: m.message });
    await sleep(1000);
    process.exit(0);
  },
};