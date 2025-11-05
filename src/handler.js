/**
 * 🌸 Miara Bot — Message Handler (No Buttons)
 * Compatible with Baileys 7.x RC and Node 20+
 * Author: MidKnight
 */

import chalk from "chalk";
import { smsg, isUrl, sleep, getBuffer } from "./utils/helpers.js";

/**
 * Handles all incoming messages
 * @param {import('@whiskeysockets/baileys').WASocket} conn
 * @param {import('@whiskeysockets/baileys').BaileysEventMap['messages.upsert']} event
 * @param {object} store
 */
export async function messageHandler(conn, event, store) {
  const msgObj = event.messages?.[0];
  if (!msgObj?.message || msgObj.key.remoteJid === "status@broadcast") return;

  const m = smsg(conn, msgObj, store);
  const sender = m.sender;
  const from = m.from;
  const text = m.text?.trim() || "";
  const isGroup = m.isGroup;

  const prefix = /^[.!#?/]/.test(text) ? text[0] : ".";
  const command = text.startsWith(prefix)
    ? text.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const args = text.split(" ").slice(1);

  const reply = (msg) =>
    conn.sendMessage(from, { text: msg }, { quoted: msgObj });

  // 🧠 Log incoming messages
  console.log(
    chalk.greenBright(`[MSG]`),
    chalk.yellow(isGroup ? `[Group]` : `[DM]`),
    chalk.cyan(sender),
    "→",
    chalk.whiteBright(text || "[media]")
  );

  // ─────────────────────────────────────────────
  // 💬 Core Commands
  // ─────────────────────────────────────────────
  switch (command) {
    case "ping": {
      const start = Date.now();
      await reply("🏓 Pinging...");
      const latency = Date.now() - start;
      await reply(`✅ Pong! *${latency}ms*`);
      break;
    }

    case "menu":
    case "help": {
      const menuText = `
🌸 *Miara Bot — Main Menu* 🌸

╭───❏  *User Commands*
│ 💫 ${prefix}ping — Check latency
│ 🖼️ ${prefix}sticker — Make a sticker from image/video
│ 🌐 ${prefix}fetch <url> — Download image from a link
│ 📜 ${prefix}commands — Show all commands
╰───────────────❏

👑 *Owner Commands*
• .broadcast <text>
• .setbio <new bio>
• .restart

© 2025 Miara Bot | by MidKnight
`;
      await reply(menuText);
      break;
    }

    case "commands":
    case "commands_menu": {
      const cmdText = `
✨ *Available Commands*

🧩 ${prefix}ping — Check latency
🖼️ ${prefix}sticker — Convert image/video to sticker
🌐 ${prefix}fetch <url> — Download image from URL
📜 ${prefix}menu — Show main menu

👑 Owner commands:
• ${prefix}restart
• ${prefix}broadcast <text>
• ${prefix}setbio <text>

💫 _Bot by MidKnight_
`;
      await reply(cmdText);
      break;
    }

    case "sticker":
    case "s": {
      const mediaMsg =
        msgObj.message.imageMessage || msgObj.message.videoMessage;
      if (!mediaMsg) {
        await reply("📸 Reply to an image or short video with `.s` to make a sticker.");
        return;
      }
      try {
        const buffer = await conn.downloadMediaMessage(msgObj);
        await conn.sendMessage(from, { sticker: buffer });
        await conn.sendMessage(from, { react: { text: "🌸", key: msgObj.key } });
      } catch (err) {
        console.error(err);
        await reply("❌ Failed to create sticker.");
      }
      break;
    }

    case "fetch": {
      if (!args[0] || !isUrl(args[0])) {
        await reply(`🔗 Usage: ${prefix}fetch <image_url>`);
        return;
      }
      try {
        const media = await getBuffer(args[0]);
        await conn.sendMessage(from, {
          image: media,
          caption: "✅ Fetched successfully!",
        });
      } catch (err) {
        console.error(err);
        await reply("❌ Could not fetch media.");
      }
      break;
    }

    default: {
      if (text && text.startsWith(prefix)) {
        await reply(`🤖 Unknown command. Try *${prefix}menu*.`);
      }
      break;
    }
  }

  // ─────────────────────────────────────────────
  // 🎭 Auto-sticker trigger (on keyword)
  // ─────────────────────────────────────────────
  if (
    !command &&
    (msgObj.message.imageMessage || msgObj.message.videoMessage) &&
    text.toLowerCase().includes("sticker")
  ) {
    try {
      const buffer = await conn.downloadMediaMessage(msgObj);
      await conn.sendMessage(from, { sticker: buffer });
      await conn.sendMessage(from, { react: { text: "✨", key: msgObj.key } });
    } catch (err) {
      console.error("Auto-sticker error:", err);
    }
  }

  // ─────────────────────────────────────────────
  // 👑 Owner-only Commands
  // ─────────────────────────────────────────────
  const OWNER_NUMBER = "2547xxxxxxxx@s.whatsapp.net"; // Replace with your JID

  if (sender === OWNER_NUMBER && command) {
    (async () => {
      switch (command) {
        case "restart":
          await reply("♻️ Restarting Miara...");
          await sleep(1000);
          process.exit(0);
          break;

        case "broadcast":
        case "bc": {
          if (!args.length) {
            await reply("📢 Usage: .broadcast <text>");
            return;
          }
          const bcMsg = args.join(" ");
          const chats = Object.keys(store.data.chats || {});
          await reply(`📣 Broadcasting to *${chats.length}* chats...`);
          for (const jid of chats) {
            await conn.sendMessage(jid, {
              text: `📢 *Broadcast Message*\n\n${bcMsg}\n\n— _Miara Admin_`,
            });
            await sleep(400);
          }
          await reply("✅ Broadcast completed!");
          break;
        }

        case "setbio": {
          if (!args.length) {
            await reply("📝 Usage: .setbio <new bio text>");
            return;
          }
          const bio = args.join(" ");
          await conn.query({
            tag: "iq",
            attrs: { to: "@s.whatsapp.net", type: "set", xmlns: "status" },
            content: [
              { tag: "status", attrs: {}, content: Buffer.from(bio, "utf-8") },
            ],
          });
          await reply("✅ Bio updated successfully!");
          break;
        }
      }
    })();
  }
}
