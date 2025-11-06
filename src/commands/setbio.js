import { config } from "../config.js";

export default {
  name: "setbio",
  description: "Change Miara’s WhatsApp bio (owner only).",
  category: "owner",
  usage: ".setbio <new bio>",

  async execute(conn, m, args) {
    if (!config.OWNER_NUMBER.includes(m.sender.split("@")[0])) {
      await conn.sendMessage(m.from, { text: "❌ Only the owner can change the bio." });
      return;
    }

    if (!args.length) {
      await conn.sendMessage(m.from, { text: "📝 Usage: .setbio <new bio text>" });
      return;
    }

    const newBio = args.join(" ");
    try {
      await conn.updateProfileStatus(newBio);
      await conn.sendMessage(m.from, {
        text: `✅ Bio updated!\n\n📄 *New Bio:* ${newBio}`,
      });
      await conn.sendMessage(m.from, { react: { text: "🌸", key: m.message.key } });
    } catch (err) {
      console.error("setbio error:", err);
      await conn.sendMessage(m.from, { text: "⚠️ Failed to update bio." });
    }
  },
};