/**
 * owner commands, restricted to bot owner(s)
 * Usage: !restart, !eval <js>
 */

import { config } from "../config.js";

function isOwner(sender) {
  const plain = sender.replace(/@.*/, "");
  return config.OWNER_NUMBER.includes(plain);
}

export default async function (Miara, m, args) {
  const command = args[0];
  if (!isOwner(m.sender)) return Miara.sendMessage(m.chat, { text: "⚠️ Owner only." }, { quoted: m });

  if (command === "restart") {
    await Miara.sendMessage(m.chat, { text: "Restarting..." }, { quoted: m });
    process.exit(0);
  } else if (command === "eval") {
    try {
      const code = args.slice(1).join(" ");
      let result = eval(code); // owner-only; be careful
      if (result instanceof Promise) result = await result;
      await Miara.sendMessage(m.chat, { text: `Result:\n${String(result).slice(0, 1500)}` }, { quoted: m });
    } catch (e) {
      await Miara.sendMessage(m.chat, { text: `Error: ${e.message}` }, { quoted: m });
    }
  } else {
    await Miara.sendMessage(m.chat, { text: "Owner commands: restart, eval" }, { quoted: m });
  }
}
