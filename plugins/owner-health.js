/**
 * Health Check Command
 * Check Miara's health status and performance metrics
 */

import healthCheck from '../src/libraries/healthCheck.js';
import performanceMonitor from '../src/libraries/performance.js';

const handler = async (m, { conn, isROwner }) => {
  if (!isROwner) return m.reply('⚠️ This command is only available for Miara\'s owner.');

  await m.reply('🔍 Running health checks on Miara...');

  try {
    // Get health report
    const health = await healthCheck.getReport();
    const perf = performanceMonitor.getSystemHealth();

    // Build response message
    let message = `╭─⬣「 🏥 *MIARA HEALTH STATUS* 」⬣\n│\n`;
    
    // Overall status
    message += `├❯ *Overall Status:* ${health.status === 'healthy' ? '✅ Healthy' : '⚠️ Unhealthy'}\n`;
    message += `├❯ *Uptime:* ${health.uptime.formatted}\n`;
    message += `├❯ *Last Check:* ${new Date(health.timestamp).toLocaleString()}\n│\n`;

    // Health checks
    message += `├─⬣「 📋 *HEALTH CHECKS* 」\n│\n`;
    for (const [check, result] of Object.entries(health.checks)) {
      const icon = result.status === 'healthy' ? '✅' : result.status === 'error' ? '❌' : '⚠️';
      message += `├❯ ${icon} ${check.charAt(0).toUpperCase() + check.slice(1)}: ${result.status}\n`;
      if (result.error) {
        message += `├   └─ Error: ${result.error}\n`;
      }
    }
    message += `│\n`;

    // Memory info
    message += `├─⬣「 💾 *MEMORY* 」\n│\n`;
    message += `├❯ *Heap Used:* ${health.memory.heapUsed}\n`;
    message += `├❯ *Heap Total:* ${health.memory.heapTotal}\n`;
    message += `├❯ *Usage:* ${health.memory.heapUsagePercent}\n`;
    message += `├❯ *RSS:* ${health.memory.rss}\n│\n`;

    // System info
    message += `├─⬣「 🖥️ *SYSTEM* 」\n│\n`;
    message += `├❯ *Platform:* ${health.system.platform}\n`;
    message += `├❯ *Architecture:* ${health.system.arch}\n`;
    message += `├❯ *CPUs:* ${health.system.cpus}\n`;
    message += `├❯ *Total Memory:* ${health.system.totalMemory}\n`;
    message += `├❯ *Free Memory:* ${health.system.freeMemory}\n│\n`;

    // Performance stats
    message += `├─⬣「 📊 *PERFORMANCE* 」\n│\n`;
    message += `├❯ *Total Commands:* ${perf.stats.totalCommands}\n`;
    message += `├❯ *Total Errors:* ${perf.stats.totalErrors}\n`;
    message += `├❯ *Error Rate:* ${perf.stats.errorRate}\n│\n`;

    // Miara info
    message += `├─⬣「 🤖 *MIARA INFO* 」\n│\n`;
    message += `├❯ *Name:* ${health.bot.name}\n`;
    message += `├❯ *Author:* ${health.bot.author || 'MidknightMantra'}\n`;
    message += `├❯ *Version:* ${health.bot.version}\n`;
    message += `├❯ *Node:* ${health.bot.node}\n`;
    message += `├❯ *PID:* ${health.bot.pid}\n│\n`;
    
    message += `╰─⬣ *Health check completed* ⬣`;

    await m.reply(message);

  } catch (error) {
    await m.reply(`❌ Error running health check:\n${error.message}`);
    console.error('Health check error:', error);
  }
};

handler.help = ['health'];
handler.tags = ['owner'];
handler.command = /^(health|healthcheck|status|sys)$/i;
handler.rowner = true;

export default handler;
