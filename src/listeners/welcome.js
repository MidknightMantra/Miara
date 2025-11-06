/**
 * 🌠 Miara Listener: Auto Welcome Handler
 * ---------------------------------------
 * Listens for group participant changes and sends a beautiful welcome message
 * when a user joins (uses per-group settings stored in /data/group_settings.json).
 *
 * Place this after your Baileys `conn` is created (for example in src/main.js).
 *
 * Author: MidKnightMantra 🌸 — Enhanced by GPT-5
 */

import fs from "fs";
import path from "path";
import moment from "moment-timezone";
import { getBuffer } from "../utils/helpers.js"; // uses your helper
import { config } from "../config.js";

const DATA_FILE = path.join(process.cwd(), "data", "group_settings.json");
if (!fs.existsSync(path.join(process.cwd(), "data"))) fs.mkdirSync(path.join(process.cwd(), "data"));
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");

const readSettings = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
const writeSettings = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Default welcome template — placeholders: @user, @group, @owner, @members, @time
const DEFAULT_WELCOME = `🪷 *Welcome @user to @group!*  
━━━━━━━━━━━━━━━━━━━  
🌠 We bloom because you joined.  
👋 Click the petals and say hi.  
🕒 Joined: @time  
📊 Now in: @members members  
────────────────────────  
🪬 *— Miara*`;

export default function attachWelcomeListener(conn) {
  // Ensure conn.ev exists (Baileys v4/v5)
  if (!conn || !conn.ev || !conn.sendMessage) {
    console.warn("attachWelcomeListener: Invalid conn object — cannot attach welcome listener.");
    return;
  }

  conn.ev.on("group-participants.update", async (update) => {
    try {
      const settings = readSettings();

      // update has shape { id: '123@g.us', participants: ['123@s.whatsapp.net'], action: 'add'|'remove'|'promote'|'demote' }
      const groupId = update.id;
      const action = update.action; // 'add' | 'remove' ...
      const participants = update.participants || [];

      // Only react to joins
      if (action !== "add") return;

      // Check if welcome is enabled for this group
      if (!settings[groupId] || !settings[groupId].welcome) return;

      // fetch group metadata
      const metadata = await conn.groupMetadata(groupId).catch(() => null);
      const subject = metadata?.subject || "this group";
      const owner = metadata?.owner || metadata?.subjectOwner || (config.OWNER_NUMBER && config.OWNER_NUMBER[0] ? `${config.OWNER_NUMBER[0]}@s.whatsapp.net` : null);
      const membersCount = metadata?.participants?.length || "unknown";

      // assemble mentions array
      const mentions = [...participants];

      // build welcome template (custom or default)
      const template = settings[groupId].customWelcome && settings[groupId].customWelcome.trim().length > 0
        ? settings[groupId].customWelcome
        : DEFAULT_WELCOME;

      // For each participant, send a personalized welcome (or send one combined message with multiple mentions)
      // We'll send a single combined message when multiple join at once.
      const names = await Promise.all(participants.map(async (jid) => {
        try {
          const v = await conn.getName(jid).catch(() => jid.split("@")[0]);
          return v || jid.split("@")[0];
        } catch {
          return jid.split("@")[0];
        }
      }));

      // Try to fetch the participant(s) profile pictures — prefer first participant's avatar
      let headerImage = null;
      for (const p of participants) {
        try {
          const ppUrl = await conn.profilePictureUrl(p, "image").catch(() => null);
          if (ppUrl) {
            headerImage = await getBuffer(ppUrl).catch(() => null);
            if (headerImage) break;
          }
        } catch {
          headerImage = null;
        }
      }

      // If no participant avatar found, try group profile pic
      if (!headerImage) {
        try {
          const groupPp = await conn.profilePictureUrl(groupId, "image").catch(() => null);
          if (groupPp) headerImage = await getBuffer(groupPp).catch(() => null);
        } catch {
          headerImage = null;
        }
      }

      // Finally fallback to local asset or small placeholder
      if (!headerImage) {
        try {
          const fallbackPath = path.join(process.cwd(), "assets", "welcome.jpg");
          if (fs.existsSync(fallbackPath)) headerImage = fs.readFileSync(fallbackPath);
        } catch {
          headerImage = null;
        }
      }

      // Replace placeholders in template
      const timeStr = moment().tz(config.TIMEZONE || "Africa/Nairobi").format("DD MMM YYYY • HH:mm");
      const userMentionText = participants.map((p, i) => `@${p.split("@")[0]}`).join(", ");
      let finalText = template
        .replace(/@user/g, userMentionText)
        .replace(/@group/g, subject)
        .replace(/@owner/g, owner ? `@${owner.split("@")[0]}` : "the curator")
        .replace(/@members/g, `${membersCount}`)
        .replace(/@time/g, timeStr);

      // Small cosmetic enhancements
      finalText = finalText + `\n\n🌸 *Remember:* Be kind, be curious — Miara watches kindly.`;

      // Send message (image + caption if image available)
      const sendOptions = {
        mentions,
      };

      if (headerImage) {
        await conn.sendMessage(groupId, { image: headerImage, caption: finalText, mentions }, { });
      } else {
        await conn.sendMessage(groupId, { text: finalText, mentions }, { });
      }
    } catch (err) {
      console.error("❌ Welcome listener error:", err);
    }
  });

  console.log("🌸 Welcome listener attached.");
}
