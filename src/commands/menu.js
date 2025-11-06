import fs from "fs/promises";
import moment from "moment-timezone";
import os from "os";
import { config } from "../config.js";

export default {
  name: "menu",
  alias: ["help"],
  description: "Show Miara’s command menu, grouped by category.",
  category: "general",
  usage: ".menu",

  async execute(conn, m, args, commands) {
    const BOT_NAME = config.BOT_NAME || "Miara🌸";
    const OWNER_NAME = config.OWNER_NAME || "MidKnightMantra";
    const prefix = config.PREFIX || ".";
    const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
    const date = moment().tz("Africa/Nairobi").format("dddd, MMMM Do YYYY");
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const grouped = {};
    for (const [name, cmd] of commands) {
      const cat = cmd.category?.toLowerCase() || "misc";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd);
    }

    const categoryEmojis = {
      general: "🌸",
      utility: "🛠️",
      media: "🎞️",
      owner: "👑",
      fun: "🎭",
      misc: "✨",
    };

    let commandList = "";
    for (const [cat, cmds] of Object.entries(grouped)) {
      commandList += `\n${categoryEmojis[cat] || "🌸"} *${cat.toUpperCase()}*\n`;
      for (const cmd of cmds.sort((a, b) => a.name.localeCompare(b.name)))
        commandList += `  • *${prefix}${cmd.name}* — ${cmd.description}\n`;
    }

    const menuText = `
╭━━━⊰ *${BOT_NAME}* ⊱━━━╮
┃ 👑 *Owner:* ${OWNER_NAME}
┃ 🕒 *Time:* ${time}
┃ 📅 *Date:* ${date}
┃ 🏃 *Uptime:* ${hours}h ${minutes}m ${seconds}s
┃ 💻 *Platform:* ${os.platform()}
╰━━━━━━━━━━━━━━━━━━╯

${commandList.trim()}

🌸 Prefix: ${prefix}
💬 Use *${prefix}help <cmd>* for detailed info.

© 2025 *Miara* | *MidKnightMantra*
`;

    try {
      const image = await fs.readFile("./assets/menu.jpg");
      await conn.sendMessage(
        m.from,
        { image, caption: menuText, mentions: [m.sender] },
        { quoted: m.message }
      );
    } catch {
      await conn.sendMessage(m.from, { text: menuText }, { quoted: m.message });
    }

    await conn.sendMessage(m.from, { react: { text: "🌸", key: m.message.key } });
  },
};