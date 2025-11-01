/**
 * Graceful Shutdown Handler for Miara
 * Properly cleanup resources on shutdown
 */

import logger from './logger.js';

class GracefulShutdown {
    constructor() {
        this.handlers = [];
        this.isShuttingDown = false;
        this.timeout = 30000; // 30 seconds timeout
        
        // Register signal handlers
        this.registerSignals();
    }

    /**
     * Register shutdown handlers
     */
    registerSignals() {
        // Handle different termination signals
        process.on('SIGTERM', () => this.shutdown('SIGTERM'));
        process.on('SIGINT', () => this.shutdown('SIGINT'));
        process.on('SIGUSR2', () => this.shutdown('SIGUSR2')); // Nodemon restart
        
        // Handle errors
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught Exception:', error);
            this.shutdown('uncaughtException', 1);
        });
    }

    /**
     * Register a cleanup handler
     * @param {string} name - Handler name
     * @param {Function} handler - Cleanup function
     */
    register(name, handler) {
        this.handlers.push({ name, handler });
        logger.debug(`Registered shutdown handler: ${name}`);
    }

    /**
     * Perform graceful shutdown
     * @param {string} signal - Signal that triggered shutdown
     * @param {number} exitCode - Exit code
     */
    async shutdown(signal, exitCode = 0) {
        if (this.isShuttingDown) {
            logger.warn('Shutdown already in progress...');
            return;
        }

        this.isShuttingDown = true;
        logger.info(`Received ${signal}, starting graceful shutdown...`);

        // Set timeout for forced exit
        const forceExitTimer = setTimeout(() => {
            logger.error('Forced exit after timeout!');
            process.exit(1);
        }, this.timeout);

        try {
            // Run all cleanup handlers
            for (const { name, handler } of this.handlers) {
                try {
                    logger.info(`Running cleanup: ${name}...`);
                    await handler();
                    logger.success(`✓ Cleanup completed: ${name}`);
                } catch (error) {
                    logger.error(`✗ Cleanup failed: ${name}`, error);
                }
            }

            logger.success('Graceful shutdown completed');
            clearTimeout(forceExitTimer);
            process.exit(exitCode);

        } catch (error) {
            logger.error('Error during shutdown:', error);
            clearTimeout(forceExitTimer);
            process.exit(1);
        }
    }

    /**
     * Get shutdown status
     */
    isShutdownInProgress() {
        return this.isShuttingDown;
    }
}

// Create singleton instance
const gracefulShutdown = new GracefulShutdown();

// Register default cleanup handlers
gracefulShutdown.register('database', async () => {
    if (global.db && global.db.data) {
        await global.db.write();
        logger.info('Database saved');
    }
});

gracefulShutdown.register('connection', async () => {
    if (global.conn && global.conn.ws) {
        try {
            global.conn.ws.close();
            logger.info('WhatsApp connection closed');
        } catch (error) {
            logger.warn('Could not close connection properly');
        }
    }
});

gracefulShutdown.register('temp-files', async () => {
    try {
        const fs = await import('fs');
        const path = await import('path');
        
        const tmpDir = './tmp';
        if (fs.existsSync(tmpDir)) {
            const files = fs.readdirSync(tmpDir);
            let cleaned = 0;
            
            for (const file of files) {
                try {
                    fs.unlinkSync(path.join(tmpDir, file));
                    cleaned++;
                } catch {}
            }
            
            logger.info(`Cleaned ${cleaned} temporary files`);
        }
    } catch (error) {
        logger.warn('Could not clean temp files');
    }
});

gracefulShutdown.register('cache', async () => {
    try {
        // Clear any in-memory caches
        if (global.cache) {
            global.cache.clear();
        }
        logger.info('Caches cleared');
    } catch {}
});

export default gracefulShutdown;
