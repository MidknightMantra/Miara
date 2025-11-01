/**
 * Performance Monitoring Utilities for Miara
 * Track command execution times, memory usage, and system health
 */

import os from 'os';

class PerformanceMonitor {
    constructor() {
        this.commandStats = new Map();
        this.startTime = Date.now();
        this.totalCommands = 0;
        this.totalErrors = 0;
    }

    /**
     * Start timing a command
     */
    startCommand(commandName) {
        return {
            name: commandName,
            startTime: Date.now(),
            startMemory: process.memoryUsage().heapUsed
        };
    }

    /**
     * End timing a command and record stats
     */
    endCommand(timer, success = true) {
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;
        const duration = endTime - timer.startTime;
        const memoryDelta = endMemory - timer.startMemory;

        // Update command stats
        if (!this.commandStats.has(timer.name)) {
            this.commandStats.set(timer.name, {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                minTime: Infinity,
                maxTime: 0,
                errors: 0,
                memoryUsage: []
            });
        }

        const stats = this.commandStats.get(timer.name);
        stats.count++;
        stats.totalTime += duration;
        stats.avgTime = stats.totalTime / stats.count;
        stats.minTime = Math.min(stats.minTime, duration);
        stats.maxTime = Math.max(stats.maxTime, duration);
        
        if (!success) {
            stats.errors++;
            this.totalErrors++;
        }

        // Keep last 10 memory readings
        stats.memoryUsage.push(memoryDelta);
        if (stats.memoryUsage.length > 10) {
            stats.memoryUsage.shift();
        }

        this.totalCommands++;

        return {
            duration,
            memoryDelta
        };
    }

    /**
     * Get stats for a specific command
     */
    getCommandStats(commandName) {
        return this.commandStats.get(commandName) || null;
    }

    /**
     * Get all command stats
     */
    getAllStats() {
        const stats = {};
        this.commandStats.forEach((value, key) => {
            stats[key] = {
                count: value.count,
                avgTime: Math.round(value.avgTime),
                minTime: Math.round(value.minTime),
                maxTime: Math.round(value.maxTime),
                errors: value.errors,
                avgMemory: Math.round(
                    value.memoryUsage.reduce((a, b) => a + b, 0) / value.memoryUsage.length
                )
            };
        });
        return stats;
    }

    /**
     * Get top N slowest commands
     */
    getSlowestCommands(n = 5) {
        const commands = Array.from(this.commandStats.entries())
            .map(([name, stats]) => ({
                name,
                avgTime: stats.avgTime,
                count: stats.count
            }))
            .sort((a, b) => b.avgTime - a.avgTime)
            .slice(0, n);
        
        return commands;
    }

    /**
     * Get top N most used commands
     */
    getMostUsedCommands(n = 5) {
        const commands = Array.from(this.commandStats.entries())
            .map(([name, stats]) => ({
                name,
                count: stats.count,
                avgTime: stats.avgTime
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, n);
        
        return commands;
    }

    /**
     * Get system health metrics
     */
    getSystemHealth() {
        const uptime = Date.now() - this.startTime;
        const memory = process.memoryUsage();
        const cpu = process.cpuUsage();
        
        return {
            uptime: this.formatUptime(uptime),
            uptimeMs: uptime,
            memory: {
                heapUsed: this.formatBytes(memory.heapUsed),
                heapTotal: this.formatBytes(memory.heapTotal),
                external: this.formatBytes(memory.external),
                rss: this.formatBytes(memory.rss),
                percentage: Math.round((memory.heapUsed / memory.heapTotal) * 100)
            },
            cpu: {
                user: Math.round(cpu.user / 1000),
                system: Math.round(cpu.system / 1000)
            },
            system: {
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                totalMemory: this.formatBytes(os.totalmem()),
                freeMemory: this.formatBytes(os.freemem()),
                loadAvg: os.loadavg()
            },
            stats: {
                totalCommands: this.totalCommands,
                totalErrors: this.totalErrors,
                errorRate: this.totalCommands > 0 
                    ? ((this.totalErrors / this.totalCommands) * 100).toFixed(2) + '%'
                    : '0%'
            }
        };
    }

    /**
     * Format bytes to human readable
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Format uptime to human readable
     */
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
        if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * Reset all stats
     */
    reset() {
        this.commandStats.clear();
        this.totalCommands = 0;
        this.totalErrors = 0;
        this.startTime = Date.now();
    }

    /**
     * Get performance report
     */
    getReport() {
        return {
            overview: this.getSystemHealth(),
            slowest: this.getSlowestCommands(10),
            mostUsed: this.getMostUsedCommands(10),
            allCommands: this.getAllStats()
        };
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
