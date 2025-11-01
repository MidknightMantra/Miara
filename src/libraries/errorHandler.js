/**
 * Enhanced Error Handler for Miara
 * Centralized error handling with logging and recovery
 */

import logger from './logger.js';
import fs from 'fs';
import path from 'path';

class ErrorHandler {
    constructor() {
        this.errorLog = './logs/errors.json';
        this.errors = [];
        this.maxErrors = 100; // Keep last 100 errors
        this.loadErrors();
    }

    /**
     * Load errors from file
     */
    loadErrors() {
        try {
            if (fs.existsSync(this.errorLog)) {
                const data = fs.readFileSync(this.errorLog, 'utf8');
                this.errors = JSON.parse(data);
            }
        } catch (error) {
            logger.warn('Could not load error log:', error.message);
        }
    }

    /**
     * Save errors to file
     */
    saveErrors() {
        try {
            const dir = path.dirname(this.errorLog);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(
                this.errorLog,
                JSON.stringify(this.errors, null, 2)
            );
        } catch (error) {
            logger.warn('Could not save error log:', error.message);
        }
    }

    /**
     * Handle error
     * @param {Error} error - Error object
     * @param {Object} context - Error context
     */
    handle(error, context = {}) {
        const errorObj = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code,
            context: {
                command: context.command || 'unknown',
                user: context.user || 'unknown',
                chat: context.chat || 'unknown',
                plugin: context.plugin || 'unknown',
                ...context
            }
        };

        // Add to error list
        this.errors.unshift(errorObj);
        
        // Keep only last maxErrors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }

        // Log error
        logger.error(`Error in ${context.plugin || 'unknown'}:`, error);

        // Save to file
        this.saveErrors();

        // Check for critical errors
        if (this.isCritical(error)) {
            this.handleCritical(error, context);
        }

        return errorObj;
    }

    /**
     * Check if error is critical
     */
    isCritical(error) {
        const criticalPatterns = [
            /ENOSPC/i, // No space left
            /EMFILE/i, // Too many open files
            /Maximum call stack/i,
            /Out of memory/i
        ];

        return criticalPatterns.some(pattern => 
            pattern.test(error.message) || pattern.test(error.code)
        );
    }

    /**
     * Handle critical error
     */
    handleCritical(error, context) {
        logger.error('⚠️ CRITICAL ERROR DETECTED!', error);
        
        // Try to notify owner
        try {
            if (global.conn && global.owner && global.owner[0]) {
                const ownerJid = global.owner[0][0] + '@s.whatsapp.net';
                global.conn.sendMessage(ownerJid, {
                    text: `🚨 *CRITICAL ERROR IN MIARA*\n\n` +
                          `*Error:* ${error.message}\n` +
                          `*Context:* ${context.plugin || 'unknown'}\n` +
                          `*Time:* ${new Date().toLocaleString()}\n\n` +
                          `Miara may need attention!`
                }).catch(() => {});
            }
        } catch {}
    }

    /**
     * Get error statistics
     */
    getStats() {
        const last24h = this.errors.filter(e => {
            const errorTime = new Date(e.timestamp).getTime();
            const now = Date.now();
            return now - errorTime < 24 * 60 * 60 * 1000;
        });

        const byType = {};
        const byPlugin = {};
        
        last24h.forEach(error => {
            // Count by error type
            byType[error.name] = (byType[error.name] || 0) + 1;
            
            // Count by plugin
            const plugin = error.context.plugin;
            byPlugin[plugin] = (byPlugin[plugin] || 0) + 1;
        });

        return {
            total: this.errors.length,
            last24h: last24h.length,
            byType,
            byPlugin,
            recent: this.errors.slice(0, 10)
        };
    }

    /**
     * Get recent errors
     */
    getRecent(limit = 10) {
        return this.errors.slice(0, limit);
    }

    /**
     * Clear error log
     */
    clear() {
        this.errors = [];
        this.saveErrors();
    }

    /**
     * Safe function wrapper
     * Wraps a function to automatically catch and handle errors
     */
    wrap(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                this.handle(error, context);
                throw error; // Re-throw after handling
            }
        };
    }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

// Global error handlers
process.on('uncaughtException', (error) => {
    errorHandler.handle(error, { 
        type: 'uncaughtException',
        critical: true 
    });
    
    // Don't exit immediately for non-critical errors
    if (!errorHandler.isCritical(error)) {
        logger.warn('Recovered from uncaught exception');
    }
});

process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    errorHandler.handle(error, { 
        type: 'unhandledRejection',
        promise: promise.toString()
    });
});

export default errorHandler;
