// src/commands/owner.js

import { config } from "../config.js";

export default {
  name: "owner",
  alias: ["creator", "dev"],
  description: "Get the contact information of the bot owner.",
  category: "owner", // This category triggers the owner check in the handler
  usage: ".owner",

  async execute(conn, m, args) {
    const { from } = m;

    try {
      if (config.OWNER_NUMBER.length === 0) {
        await conn.sendMessage(from, { text: "❌ Owner information is not set in the configuration." });
        return;
      }

      // Assuming the first number in the config is the primary owner
      const ownerNumber = config.OWNER_NUMBER[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net"; // Format as JID
      const ownerName = config.OWNER_NAME || "The Owner";

      // Send a contact card
      await conn.sendMessage(from, {
        contacts: {
          displayName: ownerName,
          contacts: [{ vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;type=CELL;type=VOICE;waid=${ownerNumber.split('@')[0]}:+${ownerNumber.split('@')[0]}\nEND:VCARD` }]
        }
      });

      console.log(`Owner contact sent to ${from}`);
    } catch (err) {
      console.error("Error in owner command:", err);
      await conn.sendMessage(from, { text: "❌ Failed to send owner information." });
    }
  },
};
