/**
 * 🌸 Miara — Config Loader (Baileys 7.x+ Stable)
 * by MidKnight — 2025
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/**
 * Parses a comma-separated string environment variable into an array of strings.
 * Trims whitespace from each value and filters out empty items.
 * @param {string|undefined} envVar - The environment variable string.
 * @returns {string[]} An array of strings.
 */
function parseArrayEnv(envVar) {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map(item => item.trim())
    .filter(item => item.length > 0); // Filter out empty strings resulting from trailing commas
}

/**
 * Parses a boolean environment variable.
 * Treats "true", "1", "yes", "on" (case-insensitive) as true, everything else as false.
 * @param {string|undefined} envVar - The environment variable string.
 * @param {boolean} defaultValue - The default value if envVar is not present.
 * @returns {boolean} The parsed boolean value.
 */
function parseBooleanEnv(envVar, defaultValue = false) {
  if (envVar === undefined || envVar === null) return defaultValue;
  const lowerValue = envVar.toLowerCase();
  return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'on';
}

/**
 * Configuration object loaded from environment variables.
 * Falls back to default values if environment variables are not set.
 * Paths are resolved to absolute paths for consistency.
 */
export const config = {
  // Bot Info
  BOT_NAME: process.env.BOT_NAME || "Miara🌸",
  BIO: process.env.BIO || "🌸 M I A R A 🌸",

  // Owner Info
  OWNER_NAME: process.env.OWNER_NAME || "MidknightMantra",
  OWNER_NUMBER: parseArrayEnv(process.env.OWNER_NUMBER), // Handles comma-separated numbers

  // Core Settings
  PREFIX: process.env.PREFIX || ".",
  MODE: parseBooleanEnv(process.env.PRIVATE_MODE, false) ? "private" : "public", // Renamed env var for clarity
  LANGUAGE: process.env.LANGUAGE || "en",
  REGION: process.env.REGION || "Unknown",

  // Sticker Settings
  STICKER_PACK_NAME: process.env.STICKER_PACK_NAME || "Miara Pack",
  STICKER_AUTHOR: process.env.STICKER_AUTHOR || "MidKnightMantra🌸",

  // Paths (resolved to absolute paths)
  SESSION_PATH: path.resolve(process.env.SESSION_PATH || "./session"),
  STORE_PATH: path.resolve(process.env.STORE_PATH || "./src/database/baileys_store.json"),
  DATABASE_PATH: path.resolve(process.env.DATABASE_PATH || "./src/database/database.json"), // For local JSON DB if not using MongoDB

  // External Services
  MONGO_URI: process.env.MONGO_URI || "", // Leave empty if not using MongoDB
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "" // Leave empty if not using OpenAI
};

// Optional: Validate critical configuration values on startup
if (config.OWNER_NUMBER.length === 0) {
  console.warn("⚠️ OWNER_NUMBER not set in environment variables. Some owner-specific features may not work.");
}
if (!config.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY not found in environment variables. OpenAI features will be disabled.");
}
if (!config.MONGO_URI) {
  console.info("ℹ️ MONGO_URI not found in environment variables. Using local JSON store for data persistence.");
}
// Add other validations as needed