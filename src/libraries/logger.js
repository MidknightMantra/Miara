/**
 * Enhanced Logger System for Miara
 * Provides structured logging with levels, timestamps, and colors
 */

import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

class Logger {
    constructor() {
        this.logDir = './logs';
        this.logFile = path.join(this.logDir, `bot-${new Date().toISOString().split('T')[0]}.log`);
        this.enabled = true;
        this.logToFile = true;
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Get formatted timestamp
     */
    getTimestamp() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').substring(0, 19);
    }

    /**
     * Write log to file
     */
    writeToFile(level, message, data = null) {
        if (!this.logToFile) return;
        
        try {
            const timestamp = this.getTimestamp();
            const logEntry = data 
                ? `[${timestamp}] [${level}] ${message} ${JSON.stringify(data)}\n`
                : `[${timestamp}] [${level}] ${message}\n`;
            
            fs.appendFileSync(this.logFile, logEntry);
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    /**
     * Info level log
     */
    info(message, data = null) {
        if (!this.enabled) return;
        
        const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
        const level = chalk.blue('[INFO]');
        const msg = chalk.white(message);
        
        console.log(`${timestamp} ${level} ${msg}`, data ? data : '');
        this.writeToFile('INFO', message, data);
    }

    /**
     * Success level log
     */
    success(message, data = null) {
        if (!this.enabled) return;
        
        const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
        const level = chalk.green('[SUCCESS]');
        const msg = chalk.white(message);
        
        console.log(`${timestamp} ${level} ${msg}`, data ? data : '');
        this.writeToFile('SUCCESS', message, data);
    }

    /**
     * Warning level log
     */
    warn(message, data = null) {
        if (!this.enabled) return;
        
        const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
        const level = chalk.yellow('[WARN]');
        const msg = chalk.white(message);
        
        console.log(`${timestamp} ${level} ${msg}`, data ? data : '');
        this.writeToFile('WARN', message, data);
    }

    /**
     * Error level log
     */
    error(message, error = null) {
        if (!this.enabled) return;
        
        const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
        const level = chalk.red('[ERROR]');
        const msg = chalk.white(message);
        
        console.log(`${timestamp} ${level} ${msg}`);
        if (error) {
            console.log(chalk.red(error.stack || error.message || error));
        }
        
        this.writeToFile('ERROR', message, error ? error.stack || error.message : null);
    }

    /**
     * Debug level log
     */
    debug(message, data = null) {
        if (!this.enabled) return;
        
        const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
        const level = chalk.magenta('[DEBUG]');
        const msg = chalk.white(message);
        
        console.log(`${timestamp} ${level} ${msg}`, data ? data : '');
        this.writeToFile('DEBUG', message, data);
    }

    /**
     * Command execution log
     */
    command(user, command, chat) {
        if (!this.enabled) return;
        
        const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
        const level = chalk.cyan('[CMD]');
        const msg = chalk.white(`${user} executed ${chalk.yellow(command)} in ${chat}`);
        
        console.log(`${timestamp} ${level} ${msg}`);
        this.writeToFile('CMD', `${user} executed ${command} in ${chat}`);
    }

    /**
     * Clean old log files (keep last 7 days)
     */
    cleanOldLogs() {
        try {
            const files = fs.readdirSync(this.logDir);
            const now = Date.now();
            const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
            
            files.forEach(file => {
                const filePath = path.join(this.logDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtimeMs < sevenDaysAgo) {
                    fs.unlinkSync(filePath);
                    this.info(`Deleted old log file: ${file}`);
                }
            });
        } catch (error) {
            this.error('Failed to clean old logs', error);
        }
    }

    /**
     * Toggle logging on/off
     */
    toggle(enabled) {
        this.enabled = enabled;
    }

    /**
     * Toggle file logging on/off
     */
    toggleFileLogging(enabled) {
        this.logToFile = enabled;
    }
}

// Create singleton instance
const logger = new Logger();

export default logger;
