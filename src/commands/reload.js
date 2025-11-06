/**
 * ♻️ Miara Command: Reload Commands
 * Reloads all commands dynamically (owner only)
 */

import { loadCommands } from "../handler.js";

export default {
  name: "reload",
  description: "Reload all bot commands without restart.",
  category: "owner",
  usage: ".reload",

  async execute(conn, m) {
    try {
      await loadCommands();
      await conn.sendMessage(m.from, {
        text: "♻️ Commands reloaded successfully!",
      }, { quoted: m });
    } catch (err) {
      console.error("Reload failed:", err);
      await conn.sendMessage(m.from, {
        text: "❌ Failed to reload commands. Check console for errors.",
      }, { quoted: m });
    }
  },
};
