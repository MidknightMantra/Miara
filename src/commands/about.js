import os from "os";
import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import { config } from "../config.js";

export default {
  name: "about",
  description: "Show Miara’s system info, version, and credits.",
  category: "general",
  usage: ".about",

  async execute(conn, m) {
    const BOT_NAME = config.BOT_NAME || "Miara🌸";
    const OWNER_NAME = config.OWNER_NAME || "MidKnightMantra";
    const PREFIX = config.PREFIX || ".";
    const VERSION = config.VERSION || "1.0.0";
    const NODE_VERSION = process.version;
    const PLATFORM = os.platform();
    const ARCH = os.arch();
    const totalMem = Math.round(os.totalmem() / 1024 / 1024);
    const freeMem = Math.round(os.freemem() / 1024 / 1024);

    // 🌸 Uptime calculation
    const uptime = process.uptime() * 1000;
    const h = Math.floor(uptime / 3600000);
    const mnt = Math.floor((uptime % 3600000) / 60000);
    const s = Math.floor((uptime % 60000) / 1000);

    const timeNow = moment().tz("Africa/Nairobi").format("HH:mm:ss, dddd, MMMM Do YYYY");

    const aboutText = `
╭━━━⊰ *${BOT_NAME} Info* ⊱━━━╮
┃ 🤖 *Bot Name:* ${BOT_NAME}
┃ 👑 *Owner:* ${OWNER_NAME}
┃ 💻 *Prefix:* ${PREFIX}
┃ 🕓 *Uptime:* ${h}h ${mnt}m ${s}s
┃ 🗓️ *Time:* ${timeNow}
┃ 🌍 *Timezone:* Africa/Nairobi
┃ ⚙️ *Version:* ${VERSION}
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━⊰ *SYSTEM STATUS* ⊱━━━╮
┃ 💻 *OS:* ${PLATFORM} (${ARCH})
┃ 🧠 *RAM:* ${freeMem}MB / ${totalMem}MB
┃ ⚡ *NodeJS:* ${NODE_VERSION}
╰━━━━━━━━━━━━━━━━━━━━━━╯

🌸 Crafted with love by *${OWNER_NAME}*
💬 Type *.menu* to explore commands.
`.trim();

    try {
      const bannerPath = "./assets/menu.jpg";
      const banner = fs.existsSync(bannerPath) ? fs.readFileSync(bannerPath) : null;

      if (banner) {
        await conn.sendMessage(
          m.from,
          { image: banner, caption: aboutText, mentions: [m.sender] },
          { quoted: m.message }
        );
      } else {
        await conn.sendMessage(m.from, { text: aboutText }, { quoted: m.message });
      }

      await conn.sendMessage(m.from, { react: { text: "💖", key: m.message.key } });
    } catch (err) {
      console.error("About error:", err);
      await conn.sendMessage(m.from, { text: aboutText }, { quoted: m.message });
    }
  },
};
