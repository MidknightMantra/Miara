// src/commands/qr.js

import QRCode from 'qrcode';
import { config } from "../config.js";

export default {
  name: "qr",
  alias: ["qrcode"],
  description: "Generate a QR code from text or URL.",
  category: "tools",
  usage: ".qr <text_or_url>",

  async execute(conn, m, args) {
    const { from } = m;
    const qrData = args.join(" ").trim();

    if (!qrData) {
      await conn.sendMessage(from, { text: "🧩 Please provide text or a URL to encode in the QR code. Usage: .qr Hello World" });
      return;
    }

    try {
      console.log(`Generating QR code for data: ${qrData}`);
      // Generate QR code as a Buffer (PNG format by default)
      const qrBuffer = await QRCode.toBuffer(qrData, {
          width: 300, // Adjust size as needed
          margin: 2,  // Adjust margin as needed
          color: {
              dark: '#000000', // Black dots
              light: '#FFFFFF' // White background
          }
      });

      // Send the QR code image
      await conn.sendMessage(from, { image: qrBuffer, caption: `QR Code for:\n\`\`\`${qrData}\`\`\`` });

      console.log(`QR code sent successfully to ${from}`);

    } catch (err) {
      console.error("Error in qr command:", err);
      let errorMessage = "❌ Failed to generate QR code.";
      if (err.message) {
          errorMessage += ` Error: ${err.message}`;
      }
      await conn.sendMessage(from, { text: errorMessage });
    }
  },
};
