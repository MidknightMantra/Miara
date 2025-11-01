/**
 * Health Check System for Miara
 * Monitor Miara's health and provide status endpoint
 */

import os from 'os';
import fs from 'fs';

class HealthCheck {
    constructor() {
        this.checks = new Map();
        this.status = 'healthy';
        this.lastCheck = null;
        this.startTime = Date.now();
    }

    /**
     * Register a health check
     * @param {string} name - Check name
     * @param {Function} checkFn - Check function (should return true/false)
     */
    register(name, checkFn) {
        this.checks.set(name, checkFn);
    }

    /**
     * Run all health checks
     */
    async runChecks() {
        const results = {};
        let allHealthy = true;

        for (const [name, checkFn] of this.checks.entries()) {
            try {
                const result = await checkFn();
                results[name] = {
                    status: result ? 'healthy' : 'unhealthy',
                    success: result
                };
                
                if (!result) allHealthy = false;
            } catch (error) {
                results[name] = {
                    status: 'error',
                    success: false,
                    error: error.message
                };
                allHealthy = false;
            }
        }

        this.status = allHealthy ? 'healthy' : 'unhealthy';
        this.lastCheck = new Date().toISOString();

        return {
            status: this.status,
            timestamp: this.lastCheck,
            checks: results
        };
    }

    /**
     * Get full health report
     */
    async getReport() {
        const checksResult = await this.runChecks();
        
        return {
            ...checksResult,
            uptime: this.getUptime(),
            system: this.getSystemInfo(),
            memory: this.getMemoryInfo(),
            bot: this.getBotInfo()
        };
    }

    /**
     * Get uptime
     */
    getUptime() {
        const uptimeMs = Date.now() - this.startTime;
        const seconds = Math.floor(uptimeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        return {
            ms: uptimeMs,
            formatted: `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`,
            days,
            hours: hours % 24,
            minutes: minutes % 60,
            seconds: seconds % 60
        };
    }

    /**
     * Get system information
     */
    getSystemInfo() {
        return {
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            hostname: os.hostname(),
            loadAverage: os.loadavg(),
            totalMemory: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
            freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB'
        };
    }

    /**
     * Get memory information
     */
    getMemoryInfo() {
        const mem = process.memoryUsage();
        return {
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + ' MB',
            external: Math.round(mem.external / 1024 / 1024) + ' MB',
            rss: Math.round(mem.rss / 1024 / 1024) + ' MB',
            heapUsagePercent: Math.round((mem.heapUsed / mem.heapTotal) * 100) + '%'
        };
    }

    /**
     * Get Miara information
     */
    getBotInfo() {
        return {
            name: 'Miara',
            version: '1.0.0',
            author: 'MidknightMantra',
            node: process.version,
            pid: process.pid,
            status: this.status,
            lastHealthCheck: this.lastCheck
        };
    }

    /**
     * Quick health status
     */
    isHealthy() {
        return this.status === 'healthy';
    }
}

// Create singleton instance
const healthCheck = new HealthCheck();

// Register default checks
healthCheck.register('database', () => {
    try {
        return global.db && global.db.data !== null;
    } catch {
        return false;
    }
});

healthCheck.register('connection', () => {
    try {
        return global.conn && global.conn.user;
    } catch {
        return false;
    }
});

healthCheck.register('memory', () => {
    const mem = process.memoryUsage();
    const heapPercent = (mem.heapUsed / mem.heapTotal) * 100;
    return heapPercent < 90; // Unhealthy if using more than 90% heap
});

healthCheck.register('disk', () => {
    try {
        const tempDir = './tmp';
        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir);
            return files.length < 1000; // Unhealthy if more than 1000 temp files
        }
        return true;
    } catch {
        return true; // If can't check, assume healthy
    }
});

export default healthCheck;
