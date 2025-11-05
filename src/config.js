import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  BOT_NAME: process.env.BOT_NAME || "Miara🌸",
  OWNER_NAME: process.env.OWNER_NAME || "MidknightMantra",
  OWNER_NUMBER: process.env.OWNER_NUMBER ? process.env.OWNER_NUMBER.split(",") : [],
  PREFIX: process.env.PREFIX || ".",
  MODE: process.env.MODE?.toLowerCase() === "private" ? "private" : "public",
  LANGUAGE: process.env.LANGUAGE || "en",
  REGION: process.env.REGION || "Unknown",
  BIO: process.env.BIO || "🌸 M I A R A 🌸",
  STICKER_PACK_NAME: process.env.STICKER_PACK_NAME || "Miara Pack",
  STICKER_AUTHOR: process.env.STICKER_AUTHOR || "MidKnightMantra🌸",
  SESSION_PATH: process.env.SESSION_PATH || "./src/session",
  STORE_PATH: process.env.STORE_PATH || "./src/database/baileys_store.json",
  DATABASE_PATH: process.env.DATABASE_PATH || "./src/database/database.json",
  MONGO_URI: process.env.MONGO_URI || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || ""
};
