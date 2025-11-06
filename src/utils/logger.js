/**
 * 🌸 Miara 🌸— Logger Utility
 * by MidKnightMantra — 2025
 */

import chalk from "chalk";
import moment from "moment-timezone";

// Configuration constants
const LOG_TIMEZONE = "Africa/Nairobi"; // EAT (East Africa Time), based on user info; adjust as needed
const LOG_TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";
const LOG_LEVELS = {
  DEBUG: { color: chalk.gray, label: "DEBUG" },
  INFO: { color: chalk.green, label: "INFO" },
  WARN: { color: chalk.yellow, label: "WARN" },
  ERROR: { color: chalk.red, label: "ERROR" },
};

/**
 * Logs a message with the specified level, timestamp, and color.
 * @param {string} level - The log level (DEBUG, INFO, WARN, ERROR).
 * @param {string} message - The message to log.
 * @param {object} [options] - Optional parameters.
 * @param {boolean} [options.stack=false] - Whether to include stack trace (for errors).
 */
function logMessage(level, message, { stack = false } = {}) {
  const levelConfig = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
  const timestamp = moment().tz(LOG_TIMEZONE).format(LOG_TIMESTAMP_FORMAT);
  const coloredLevel = levelConfig.color(`[${levelConfig.label}]`);
  const coloredTimestamp = chalk.gray(timestamp);

  let logString = `${coloredLevel} ${coloredTimestamp} - ${message}`;

  if (stack && level === "ERROR") {
    const errorStack = new Error().stack.split("\n").slice(2).join("\n"); // Skip first two lines (Error and this function)
    logString += `\n${chalk.dim(errorStack)}`;
  }

  console.log(logString);
}

/**
 * Logger object with methods for each log level.
 */
export const logger = {
  /**
   * Logs a debug message.
   * @param {string} message - The message to log.
   */
  debug: (message) => logMessage("DEBUG", message),

  /**
   * Logs an info message.
   * @param {string} message - The message to log.
   */
  info: (message) => logMessage("INFO", message),

  /**
   * Logs a warning message.
   * @param {string} message - The message to log.
   */
  warn: (message) => logMessage("WARN", message),

  /**
   * Logs an error message, optionally with stack trace.
   * @param {string|Error} message - The message or Error object to log.
   * @param {boolean} [stack=true] - Whether to include stack trace.
   */
  error: (message, stack = true) => {
    if (message instanceof Error) {
      logMessage("ERROR", message.message, { stack: true });
      if (stack) {
        console.log(chalk.dim(message.stack));
      }
    } else {
      logMessage("ERROR", message, { stack });
    }
  },
};

// Optional: Set global error handlers if needed
// process.on("uncaughtException", (err) => logger.error(err, true));
// process.on("unhandledRejection", (reason) => logger.error(reason, true));