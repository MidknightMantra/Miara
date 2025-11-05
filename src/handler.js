/**
 * 🌸 Miara
 * MidKnight Mantra
 */
import chalk from "chalk";
import moment from "moment-timezone";
import os from "os";
import fs from "fs";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { fileTypeFromBuffer } from "file-type";
import { smsg, isUrl, sleep, getBuffer, detectFileType } from "./utils/helpers.js";
import { config } from "./config.js";
import { t } from "./lang.js";

/**
 * Handles all incoming messages
 * @param {import('@whiskeysockets/baileys').WASocket} conn
 * @param {import('@whiskeysockets/baileys').BaileysEventMap['messages.upsert']} event
 * @param {object} store
 */
export async function messageHandler(conn, event, store) {
  const msgObj = event.messages?.[0];
  if (!msgObj?.message || msgObj.key.remoteJid === "status@broadcast") return;

  const LANGUAGE = config.LANGUAGE;
  const lang = LANGUAGE || "en";
  const m = smsg(conn, msgObj, store);
  const sender = m.sender;
  const from = m.from;
  const text = m.text?.trim() || "";
  const isGroup = m.isGroup;

  const prefix = config.PREFIX || ".";
  const command = text.startsWith(prefix)
    ? text.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  // 🔒 If bot is in private mode, only owner can use commands
  if (config.MODE === "private" && sender !== config.OWNER_NUMBER) {
  if (command) {
    await reply(t(lang, "🔒 Miara is currently in *private mode*. Only the owner can use commands."));
    return;
  }
}

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

  // 💬 Random Fun & Motivational Quotes
const quotes = [
  "I'm not lazy, I'm just on my energy-saving mode.",
  "Life is short — smile while you still have teeth.",
  "If you think nobody cares, try missing a couple of payments.",
  "Some people need a high-five. In the face. With a chair.",
  "I'm not saying I'm Batman, but no one has ever seen us together.",
  "My bed is magical; it makes me remember everything I forgot to do.",
  "Why do they call it beauty sleep if you wake up looking like a troll?",
  "I'm great at multitasking — I can waste time and procrastinate all at once.",
  "The road to success is always under construction.",
  "Dream big, hustle smart, and stay kind. 🌸",
  "Don’t count the days — make the days count.",
  "Confidence is not ‘they will like me’, it’s ‘I’ll be fine if they don’t’.",
  "Even the stars need darkness to shine. ✨",
  "Keep your face always toward the sunshine — shadows will fall behind you.",
  "You can’t pour from an empty cup. Take care of yourself first.",
  "Every flower blooms at its own pace — keep growing 🌸.",
  "Happiness is homemade — and so is coffee ☕.",
  "A smile is the prettiest thing you can wear.",
  "The best time for new beginnings is now.",
];
  // ─────────────────────────────────────────────
  // 💬 Core Commands
  // ─────────────────────────────────────────────
  switch (command) {
    case "ping": {
  const start = Date.now();
  await reply("🏃 Pinging...");

  const latency = Date.now() - start;
  const now = new Date();

  const dateString = now.toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

   // 🕓 Detect system timezone
  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const BOT_NAME = config?.BOT_NAME || "Miara🌸";

  // Calculate uptime
  const uptimeMs = process.uptime() * 1000;
  const hours = Math.floor(uptimeMs / 3600000);
  const minutes = Math.floor((uptimeMs % 3600000) / 60000);
  const seconds = Math.floor((uptimeMs % 60000) / 1000);
  const uptime = `${hours}h ${minutes}m ${seconds}s`;

  const pingMsg = `
✨ *${BOT_NAME}*
⚡ Speed: *${latency}ms*
🌍 Timezone: ${timeZone}
📅 Date: ${dateString}
🕐 Time: ${timeString}
🕒 Uptime: ${uptime}
`;

 await reply(pingMsg);

  // 🌸 React to ping with emoji
  await conn.sendMessage(from, {
    react: { text: "💫", key: msgObj.key },
  });

  break;
}

  case "menu":
    case "help": {
      const d = new Date();
      const BOT_NAME = config.BOT_NAME || "Miara🌸";
      const OWNER_NAME = config.OWNER_NAME || "MidKnightMantra";
      const locale = "en";
      const week = d.toLocaleDateString(locale, { weekday: "long" });
      const date = d.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const uptime = clockString(process.uptime() * 1000);
      const taguser = "@" + m.sender.split("@")[0];
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      const greeting = getGreeting();
      const platform = os.platform();
      const totalMem = Math.round(os.totalmem() / 1024 / 1024);
      const freeMem = Math.round(os.freemem() / 1024 / 1024);

      const menuText = `
╭━━━⊰ *${BOT_NAME}🌸* ⊱━━━╮
┃ 👋Hello, ${taguser}!
┃ ${greeting}
┃
┃ 📜 *${quote}*
╰━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━⊰ *TODAY* ⊱━━━╮
┃ 📅 *Date:* ${week}, ${date}
┃ ⏰ *Time:* ${time}
┃ 🌍 *Timezone:* ${timezone}
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━⊰ *BOT INFO* ⊱━━━╮
┃ 🤖 *Bot:*🌸${BOT_NAME}
┃ 👑 *Owner:* ${OWNER_NAME}
┃ ⌨️ *Prefix:* ${prefix}
┃ ⏱️ *Uptime:* ${uptime}
┃ 🖥️ *Platform:* ${platform}
┃ 💾 *RAM:* ${freeMem}MB / ${totalMem}MB
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━━⊰ *COMMANDS* ⊱━━━╮
┃ 🧩 ${prefix}ping — Bot status
┃ 🖼️ ${prefix}sticker — Make a sticker
┃ 🌐 ${prefix}fetch <url> — Download media
┃ 📜 ${prefix}menu — Show this menu
┃ ♻️ ${prefix}restart — Restart bot (owner)
┃ 📝 ${prefix}setbio — Change bio (owner)
╰━━━━━━━━━━━━━━━━━━━━╯

© 2025 *Miara* | *MidKnightMantra*🌸
`.trim();
      try {
    // 🖼️ Load menu image from local path
    const imagePath = "./assets/menu.jpg";
    const imageBuffer = fs.readFileSync(imagePath);

    await conn.sendMessage(
      from,
      {
        image: imageBuffer,
        caption: menuText,
        mentions: [m.sender],
      },
      { quoted: msgObj }
    );

    // 🌸 React with an emoji
    await conn.sendMessage(from, { react: { text: "🌸", key: msgObj.key } });
  } catch (err) {
    console.error("Menu image error:", err);
    await reply("⚠️ Failed to load menu image. Check if `assets/menu.jpg` exists.");
  }

  break;
}

    case "sticker":
    case "s": {
  const argsText = args.join(" ");
  const packMatch = argsText.match(/pack:(.+?)(?:\s|$)/i);
  const authorMatch = argsText.match(/author:(.+?)(?:\s|$)/i);

  const packName = packMatch ? packMatch[1].trim() : config.STICKER_PACK_NAME;
  const authorName = authorMatch ? authorMatch[1].trim() : config.STICKER_AUTHOR;

  // Handle quoted or direct media
  const quoted =
    msgObj.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    msgObj.message;
  const mediaMsg = quoted.imageMessage || quoted.videoMessage;

  if (!mediaMsg) {
    await reply(
      "📸 Reply to an image or short video with `.s` to make a sticker.\n\n💡 You can also use:\n`.s pack:Miara author:MidKnight`"
    );
    return;
  }

  // 🕓 Restrict long videos to prevent memory overload
  if (mediaMsg.seconds && mediaMsg.seconds > 10) {
    await reply("🎞️ Video too long! Please send a clip under 10 seconds.");
    return;
  }

  try {
    // 🧩 Download media buffer
    const buffer = await downloadMediaMessage(
      { message: quoted },
      "buffer",
      {},
      { logger: console }
    );

    if (!buffer || buffer.length < 1000) {
      await reply("⚠️ Could not process this media. Try again.");
      return;
    }

    // ✨ Create sticker with metadata
    const sticker = new Sticker(buffer, {
      pack: packName,
      author: authorName,
      type: StickerTypes.FULL, // FULL = standard square sticker
      quality: 80,
    });

    const stickerBuffer = await sticker.build();

    // 🖼️ Send sticker with embedded EXIF info
    await conn.sendMessage(from, { sticker: stickerBuffer });

    // 🪄 React with a fun emoji
    await conn.sendMessage(from, { react: { text: "🪄", key: msgObj.key } });
  } catch (err) {
    console.error("Sticker error:", err);
    await reply("❌ Failed to create sticker. Try again with a clear image or short video.");
  }
  break;
    }

case "fetch": {
  if (!args[0] || !isUrl(args[0])) {
    await reply(`🔗 Usage: ${prefix}fetch <url>\nExample: ${prefix}fetch https://placekitten.com/400/400`);
    return;
  }

  const url = args[0];
  await reply(`📥 Fetching media from:\n${url}`);

  try {
    const buffer = await getBuffer(url);
    const type = await detectFileType(buffer);
    const sizeKB = (buffer.length / 1024).toFixed(2);
    const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");

    const mime = type?.mime || "application/octet-stream";
    const ext = type?.ext || "bin";

    // Shorten URL for display
    const shortUrl = new URL(url).hostname.replace("www.", "");

    // 🏷️ Caption Template
    const emoji =
  mime.startsWith("image/") ? "🖼️" :
  mime.startsWith("video/") ? "🎥" :
  mime.startsWith("audio/") ? "🎧" :
  mime.includes("pdf") ? "📄" :
  mime.includes("zip") ? "📦" : "📁";

const caption = `
${emoji} *Fetched Successfully!*

📄 *Type:* ${mime}
📦 *Size:* ${sizeKB} KB
🌐 *Source:* ${shortUrl}
🕐 *Time:* ${time}

— *${config.BOT_NAME || "Miara"}* 🌸
    `.trim();

    console.log(`📂 Detected MIME: ${mime}`);

    if (mime.startsWith("image/")) {
      await conn.sendMessage(from, { image: buffer, caption });
      await conn.sendMessage(from, { react: { text: "🖼️", key: msgObj.key } });
    } else if (mime.startsWith("video/")) {
      await conn.sendMessage(from, { video: buffer, caption });
      await conn.sendMessage(from, { react: { text: "🎥", key: msgObj.key } });
    } else if (mime.startsWith("audio/")) {
      await conn.sendMessage(from, {
        audio: buffer,
        mimetype: mime,
        ptt: false,
        caption,
      });
      await conn.sendMessage(from, { react: { text: "🎧", key: msgObj.key } });
    } else if (
      mime === "application/pdf" ||
      mime.includes("zip") ||
      mime.includes("msword")
    ) {
      await conn.sendMessage(from, {
        document: buffer,
        mimetype: mime,
        fileName: `file.${ext}`,
        caption,
      });
      await conn.sendMessage(from, { react: { text: "📚", key: msgObj.key } });
    } else {
      await conn.sendMessage(from, {
        document: buffer,
        mimetype: mime,
        fileName: `file.${ext}`,
        caption,
      });
      await conn.sendMessage(from, { react: { text: "📁", key: msgObj.key } });
    }
  } catch (err) {
    console.error("Fetch error:", err);
    await reply("❌ Failed to fetch or send this media. Try a direct file URL ending in .jpg, .mp4, etc.");
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
const OWNER_NUMBER = config.OWNER_NUMBER || "254105745317@s.whatsapp.net"; // replace as needed

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
  if (sender !== config.OWNER_NUMBER) {
    await reply("🔒 Only the owner can use this command.");
    return;
  }

  if (!args.length) {
    await reply("📝 Usage: .setbio <new bio text>");
    return;
  }

  const newBio = args.join(" ");
  const envPath = path.resolve("./.env");

  try {
    // 🪄 Step 1: Update WhatsApp Bio
    if (conn.updateProfileStatus) {
      await conn.updateProfileStatus(newBio);
      console.log(chalk.green("✅ WhatsApp bio updated successfully."));
    } else {
      throw new Error("updateProfileStatus not supported in this session.");
    }

    // 🪄 Step 2: Update or append BIO in .env
    let envContent = "";
    try {
      envContent = await fs.promises.readFile(envPath, "utf8");
    } catch {
      envContent = "";
    }

    const newLine = `BIO="${newBio}"`;
    if (/^BIO=.*$/m.test(envContent)) {
      envContent = envContent.replace(/^BIO=.*/m, newLine);
    } else {
      envContent += `\n${newLine}`;
    }

    await fs.promises.writeFile(envPath, envContent.trim() + "\n", "utf8");

    // 🪄 Step 3: Confirm success
    await reply(`✅ *Bio updated successfully!*\n\n📄 *New Bio:* ${newBio}`);
    await conn.sendMessage(from, { react: { text: "🌸", key: msgObj.key } });
  } catch (err) {
    console.error(chalk.red("❌ setbio error:"), err);

    if (String(err).includes("updateProfileStatus")) {
      await reply(
        "⚠️ Bio update failed. Miara might be running on a *linked device session*.\n\nTry logging in with a *main WhatsApp account* instead."
      );
    } else {
      await reply("❌ Failed to update bio. Please try again later.");
    }
  }

  break;
}

      default:
        await reply("🤖 Unknown owner command.");
        break;
    }
  })();
}


// ─────────────────────────────────────────────
// 🕓 Utility Functions
// ─────────────────────────────────────────────

// 🕓 Format uptime into HH:MM:SS
function clockString(ms) {
  const h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

// 🌅 Dynamic Greeting Based on Time
function getGreeting() {
  const hour = parseInt(moment().tz("Africa/Nairobi").format("HH"));
  
  if (hour >= 0 && hour < 4) return "Good Night 🌙 — time to rest and recharge.";
  if (hour >= 4 && hour < 12) return "Good Morning 🌄 — hope your day starts great!";
  if (hour >= 12 && hour < 16) return "Good Afternoon ☀️ — keep up the energy!";
  if (hour >= 16 && hour < 19) return "Good Evening 🌇 — the sun sets, but vibes stay up!";
  return "Good Night 🌙 — don’t forget to dream big.";
}

}