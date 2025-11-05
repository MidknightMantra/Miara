import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  BOT_NAME: process.env.BOT_NAME || "Miara🌸",
  OWNER_NAME: process.env.OWNER_NAME || "MidknightMantra",
  OWNER_NUMBER: process.env.OWNER_NUMBER ? process.env.OWNER_NUMBER.split(",") : [],
  PREFIX: process.env.PREFIX || ".",
  REGION: process.env.REGION || "Unknown",
  SESSION_PATH: process.env.SESSION_PATH || "./src/session",
  DATABASE_PATH: process.env.DATABASE_PATH || "./src/database/database.json",
  MONGO_URI: process.env.MONGO_URI || "",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || ""
};
