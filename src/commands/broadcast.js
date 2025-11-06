import { sleep } from "../utils/helpers.js";
import { config } from "../config.js";

export default {
  name: "broadcast",
  alias: ["bc"],
  description: "Send a message to all chats (owner only).",
  category: "owner",
  usage: ".bc <text>",

  async execute(conn, m, args, commands, store) {
    if (!config.OWNER_NUMBER.includes(m.sender.split("@")[0])) {
      await conn.sendMessage(m.from, { text: "❌ Only the owner can use this." });
      return;
    }

    if (!args.length) {
      await conn.sendMessage(m.from, { text: "📢 Usage: .broadcast <text>" });
      return;
    }

    const message = args.join(" ");
    const chats = [...store.data.chats.keys()];

    await conn.sendMessage(m.from, { text: `📣 Sending to ${chats.length} chats...` });

    for (const jid of chats) {
      await conn.sendMessage(jid, {
        text: `📢 *Broadcast Message*\n\n${message}\n\n— 🌸 _Miara_`,
      });
      await sleep(300);
    }

    await conn.sendMessage(m.from, { text: "✅ Broadcast complete!" });
  },
};