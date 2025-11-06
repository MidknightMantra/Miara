import { config } from "../config.js";

export default {
  name: "help",
  description: "Get details for a specific command or view the full menu.",
  category: "general",
  usage: ".help [command]",

  async execute(conn, m, args, commands) {
    const prefix = config.PREFIX || ".";
    const BOT_NAME = config.BOT_NAME || "Miara🌸";

    // 🧩 If no command name is given, show menu
    if (!args[0]) {
      const menuCmd = commands.get("menu");
      if (menuCmd) return menuCmd.execute(conn, m, [], commands);
      await conn.sendMessage(m.from, {
        text: "📜 No menu command found. Try `.menu` instead.",
      });
      return;
    }

    const cmdName = args[0].toLowerCase();
    const cmd =
      commands.get(cmdName) ||
      [...commands.values()].find(
        (c) => c.alias && c.alias.includes(cmdName)
      );

    if (!cmd) {
      await conn.sendMessage(m.from, {
        text: `❌ Command *${cmdName}* not found.\nUse *${prefix}menu* to see all available commands.`,
      });
      return;
    }

    const aliases = cmd.alias?.length
      ? cmd.alias.map((a) => `${prefix}${a}`).join(", ")
      : "None";

    const helpText = `
╭━━━⊰ *${BOT_NAME} Help* ⊱━━━╮
┃ 🧩 *Command:* ${prefix}${cmd.name}
┃ 🗂️ *Category:* ${cmd.category || "misc"}
┃ 📝 *Description:* ${cmd.description || "No description"}
┃ 🧾 *Usage:* ${cmd.usage || "No usage info"}
┃ 🏷️ *Aliases:* ${aliases}
╰━━━━━━━━━━━━━━━━━━━━━━╯

🌸 Example:
${cmd.usage || `${prefix}${cmd.name}`}

💬 Use *${prefix}menu* to see all commands.
`.trim();

    await conn.sendMessage(m.from, { text: helpText }, { quoted: m.message });
    await conn.sendMessage(m.from, { react: { text: "💡", key: m.message.key } });
  },
};
