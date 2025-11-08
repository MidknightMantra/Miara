/**
 * 🌠 Miara Listener: Auto Welcome Handler
 * ---------------------------------------
 * Listens for group participant changes and sends a beautiful welcome message
 * when a user joins (uses per-group settings stored in /data/group_settings.json).
 *
 * Author: MidKnightMantra × GPT-5
 */

import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import { getBuffer } from "../utils/helpers.js";
import config from "../config.js";
import { logger } from "../utils/logger.js";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "group_settings.json");

// ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");

let settingsCache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
let lastCacheSync = Date.now();

/**
 * Light cache layer: reduces file I/O on frequent joins.
 */
function readSettings(force = false) {
  const now = Date.now();
  if (force || now - lastCacheSync > 60_000) {
    try {
      settingsCache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      lastCacheSync = now;
    } catch (err) {
      logger.warn(`Failed to read group settings: ${err.message}`, "Welcome");
    }
  }
  return settingsCache;
}

function writeSettings(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    settingsCache = data;
  } catch (err) {
    logger.error(`Failed to write group settings: ${err.message}`, false, "Welcome");
  }
}

// 🌸 Default welcome template
const DEFAULT_WELCOME = `🪷 *Welcome @user to @group!*  
━━━━━━━━━━━━━━━━━━━  
🌠 We bloom because you joined.  
👋 Click the petals and say hi.  
🕒 Joined: @time  
📊 Now in: @members members  
────────────────────────  
🪬 *— Miara*`;

export default function attachWelcomeListener(conn) {
  if (!conn?.ev?.on) {
    logger.warn("attachWelcomeListener: Invalid conn object — cannot attach listener.", "Welcome");
    return;
  }

  conn.ev.on("group-participants.update", async (update) => {
    try {
      const settings = readSettings();
      const groupId = update.id;
      const action = update.action;
      const participants = update.participants || [];

      // react only to joins
      if (action !== "add" || participants.length === 0) return;

      // check per-group toggle
      if (!settings[groupId]?.welcome) return;

      const metadata = await conn.groupMetadata(groupId).catch(() => null);
      const subject = metadata?.subject || "this group";
      const owner =
        metadata?.owner ||
        metadata?.subjectOwner ||
        (config.OWNER_NUMBER?.[0] ? `${config.OWNER_NUMBER[0]}@s.whatsapp.net` : null);
      const membersCount = metadata?.participants?.length || "unknown";

      const mentions = [...participants];

      const template =
        settings[groupId].customWelcome?.trim()?.length > 0
          ? settings[groupId].customWelcome
          : DEFAULT_WELCOME;

      // gather participant names
      const names = await Promise.all(
        participants.map(async (jid) => {
          try {
            return (await conn.getName(jid)) || jid.split("@")[0];
          } catch {
            return jid.split("@")[0];
          }
        })
      );

      // try participant avatar first
      let headerImage = null;
      for (const p of participants) {
        try {
          const ppUrl = await conn.profilePictureUrl(p, "image").catch(() => null);
          if (ppUrl) {
            headerImage = await getBuffer(ppUrl).catch(() => null);
            if (headerImage) break;
          }
        } catch {
          /* ignore */
        }
      }

      // fallback: group picture
      if (!headerImage) {
        try {
          const groupPp = await conn.profilePictureUrl(groupId, "image").catch(() => null);
          if (groupPp) headerImage = await getBuffer(groupPp).catch(() => null);
        } catch {
          /* ignore */
        }
      }

      // fallback: local placeholder
      if (!headerImage) {
        const fallbackPath = path.join(process.cwd(), "assets", "welcome.jpg");
        if (fs.existsSync(fallbackPath)) {
          headerImage = fs.readFileSync(fallbackPath);
        }
      }

      const timeStr = moment()
        .tz(config.TIMEZONE || "Africa/Nairobi")
        .format("DD MMM YYYY • HH:mm");
      const userMentionText = participants.map((p) => `@${p.split("@")[0]}`).join(", ");

      let finalText = template
        .replace(/@user/g, userMentionText)
        .replace(/@group/g, subject)
        .replace(/@owner/g, owner ? `@${owner.split("@")[0]}` : "the curator")
        .replace(/@members/g, `${membersCount}`)
        .replace(/@time/g, timeStr);

      finalText += `\n\n🌸 *Remember:* Be kind, be curious — Miara watches kindly.`;

      const messageContent = headerImage
        ? { image: headerImage, caption: finalText, mentions }
        : { text: finalText, mentions };

      await conn.sendMessage(groupId, messageContent);

      logger.info(`Welcomed ${userMentionText} in ${subject}.`, "Welcome");
    } catch (err) {
      logger.error(`Welcome listener error: ${err.message}`, false, "Welcome");
    }
  });

  logger.info("🌸 Welcome listener attached.", "Welcome");
}
