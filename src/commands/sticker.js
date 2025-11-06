// Filename: ./src/commands/sticker.js

// Import necessary modules using ES6 syntax
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { config } from "../config.js"; // Import config for default pack/author

// Define default configuration fallbacks
const DEFAULT_PACK_NAME = "MyStickerPack";
const DEFAULT_AUTHOR_NAME = "MiaraBot";
const MAX_VIDEO_DURATION_SEC = 10; // Maximum allowed video duration in seconds

/**
 * Sticker Command Module
 * Creates a sticker from an image or short video.
 */
export default {
  name: "sticker",
  alias: ["s", "stiker"], // Added a common alias
  description: "Create a sticker from an image or short video.",
  category: "media",
  usage: ".s [pack:<name>] [author:<name>]",

  /**
   * Executes the sticker command.
   * @async
   * @param {object} conn - The Baileys connection object.
   * @param {object} m - The processed message object from the handler (smsg output).
   * @param {string[]} args - The command arguments.
   * @param {Map} commands - Map of all loaded commands (optional, for potential future use).
   * @param {object} store - The message store (optional, for potential future use).
   */
  async execute(conn, m, args, commands, store) {
    const { from, quoted, message, key } = m; // Destructure the processed message object

    try {
      // 1. Parse arguments for pack/author names using the provided args array
      const argsText = args.join(" ").trim();
      const packMatch = argsText.match(/pack:(.+?)(?:\s|$)/i);
      const authorMatch = argsText.match(/author:(.+?)(?:\s|$)/i);

      const packName = packMatch ? packMatch[1].trim() : config.STICKER_PACK_NAME || DEFAULT_PACK_NAME;
      const authorName = authorMatch ? authorMatch[1].trim() : config.STICKER_AUTHOR || DEFAULT_AUTHOR_NAME;

      // 2. Identify the media message (it should be in the 'quoted' part if the command was a reply)
      // The smsg helper correctly identifies the quoted message structure.
      const quotedMsg = m.quoted; // This comes from smsg
      const mediaMsg = quotedMsg?.imageMessage || quotedMsg?.videoMessage;

      // 3. Validate media presence in the quoted message
      if (!mediaMsg) {
        await conn.sendMessage(from, {
          text: "📸 Please reply to an image or a short video (under 10 seconds) to create a sticker using `.s`.",
        });
        console.log(`Sticker command: No media found in quoted message from ${m.sender}`);
        return;
      }

      // 4. Validate video duration if it's a video message
      if (quotedMsg.videoMessage && quotedMsg.videoMessage.seconds > MAX_VIDEO_DURATION_SEC) {
        await conn.sendMessage(from, { text: `🎞️ Video is too long! Please use a video under ${MAX_VIDEO_DURATION_SEC} seconds.` });
        console.log(`Sticker command: Video too long (${quotedMsg.videoMessage.seconds}s) from ${m.sender}`);
        return;
      }

      // 5. Download the media content as a buffer using Baileys helper
      // The downloadMediaMessage function expects the full message object containing the media.
      // Since 'quoted' is the object containing imageMessage/videoMessage, we pass { message: { [type]: mediaMsg } }
      // But Baileys is smart enough if we pass the 'quoted' object itself IF it has the message structure like { imageMessage: {...} }
      // Let's pass the correct structure expected by downloadMediaMessage: { key: ..., message: { ...Media } }
      // The 'quoted' object from smsg is the *content* of the quoted message, not the full WA message event format.
      // The original message event structure containing the quoted message contextInfo is in m.message.extendedTextMessage.contextInfo
      // However, downloadMediaMessage can work with the content directly if we construct the minimal object.
      // The safest way using the smsg output 'm' is to get the key of the quoted message if available, but smsg doesn't provide it directly.
      // The original key is in m.message.extendedTextMessage.contextInfo.participant and stanzaId, reconstructed within smsg.
      // The quoted content from smsg (m.quoted) is the message content (e.g., { imageMessage: {...} }).
      // So, we reconstruct the minimal object for downloadMediaMessage:
      const mediaKey = m.message?.extendedTextMessage?.contextInfo?.stanzaId; // Get the ID of the quoted message
      const participant = m.message?.extendedTextMessage?.contextInfo?.participant; // Get the sender of the quoted message
      const remoteJid = m.from; // The chat where the quote happened

      if (!mediaKey) {
          console.error("Could not get the key of the quoted media message.");
          await conn.sendMessage(from, { text: "❌ Could not process the media: missing message key." });
          return;
      }

      // Reconstruct the minimal message object for downloadMediaMessage
      const messageForDownload = {
          key: {
              id: mediaKey,
              remoteJid: remoteJid,
              fromMe: participant === conn.user?.id?.split(':')[0] + "@s.whatsapp.net", // Attempt to determine if media was sent by bot
              participant: participant // Needed for group messages
          },
          message: {
              // Attach the correct message type based on what was found
              ...(quotedMsg.imageMessage && { imageMessage: quotedMsg.imageMessage }),
              ...(quotedMsg.videoMessage && { videoMessage: quotedMsg.videoMessage })
          }
      };

      console.log(`Downloading media from quoted message ID: ${mediaKey}`);
      const buffer = await downloadMediaMessage(
        messageForDownload, // Pass the reconstructed message object
        "buffer",
        { logger: console } // Pass logger options if needed
      );

      // Check if buffer is empty or invalid (optional but good practice)
      if (!buffer || buffer.length === 0) {
          console.error("Downloaded media buffer is empty.");
          await conn.sendMessage(from, { text: "❌ Could not process the media file (empty buffer)." });
          return;
      }
      console.log(`Downloaded media buffer, size: ${buffer.length} bytes`);

      // 6. Create the sticker using wa-sticker-formatter
      const sticker = new Sticker(buffer, {
        pack: packName, // The pack name
        author: authorName, // The author name
        type: StickerTypes.FULL, // Or StickerTypes.CROPPED - check wa-sticker-formatter docs
        quality: 80, // Quality of the output webp
        // Optional: Add background color if needed for transparent images (for FULL type)
        // backgroundColor: '#000000' // Example: black background
      });

      // 7. Build the sticker buffer
      console.log(`Building sticker with pack: ${packName}, author: ${authorName}`);
      const stickerBuffer = await sticker.build();
      console.log(`Sticker built successfully, size: ${stickerBuffer.length} bytes`);

      // 8. Send the created sticker back to the user
      await conn.sendMessage(from, { sticker: stickerBuffer });
      console.log(`Sticker sent successfully to ${from}`);

      // 9. React to the original command message
      await conn.sendMessage(from, { react: { text: "🪄", key: key } });
      console.log(`Reacted to command message with ✨`);

    } catch (err) {
      // 10. Comprehensive error handling
      console.error("Error in sticker command:", err); // Log the full error

      let errorMessage = "❌ Sticker creation failed due to an unexpected error.";
      if (err.message) {
          // Attempt to provide more specific error messages based on common issues
          if (err.message.includes("download") || err.message.includes("buffer") || err.message.includes("404") || err.message.includes("403")) {
              errorMessage = "❌ Failed to download the media file. It might have expired or be inaccessible.";
          } else if (err.message.includes("sticker") || err.message.includes("webp") || err.message.includes("sharp")) {
              errorMessage = "❌ Failed to process the media into a sticker. It might be too large, corrupted, or an unsupported format.";
          } else if (err.message.includes("QR") || err.message.includes("connection")) {
              errorMessage = "❌ Bot connection issue. Please check the bot status.";
          } else if (err.message.includes("missing message key")) {
              errorMessage = "❌ Could not process the media: internal error retrieving message details.";
          }
          // Add other specific checks if needed based on wa-sticker-formatter errors
      }

      try {
        // Attempt to send the error message back to the user
        await conn.sendMessage(from, { text: errorMessage });
        console.log(`Sent error message to ${from}: ${errorMessage}`);
      } catch (sendErr) {
        // If sending the error message also fails, log it
        console.error("Failed to send error message to user:", sendErr);
      }
    }
  },
};
