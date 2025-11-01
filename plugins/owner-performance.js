/**
 * Performance Stats Command
 * View Miara's performance metrics and command statistics
 */

import performanceMonitor from '../src/libraries/performance.js';

const handler = async (m, { conn, isROwner, args }) => {
  if (!isROwner) return m.reply('⚠️ This command is only available for Miara\'s owner.');

  const action = args[0]?.toLowerCase();

  try {
    if (action === 'reset') {
      performanceMonitor.reset();
      return m.reply('✅ Performance statistics have been reset.');
    }

    if (action === 'report') {
      const report = performanceMonitor.getReport();
      const reportStr = JSON.stringify(report, null, 2);
      
      // Send as file if too long
      if (reportStr.length > 4000) {
        const buffer = Buffer.from(reportStr, 'utf-8');
        return await conn.sendMessage(m.chat, {
          document: buffer,
          fileName: `performance-report-${Date.now()}.json`,
          mimetype: 'application/json'
        }, { quoted: m });
      }
      
      return m.reply('```' + reportStr + '```');
    }

    // Default: Show performance overview
    const health = performanceMonitor.getSystemHealth();
    const slowest = performanceMonitor.getSlowestCommands(5);
    const mostUsed = performanceMonitor.getMostUsedCommands(5);

    let message = `╭─⬣「 📊 *PERFORMANCE STATS* 」⬣\n│\n`;
    
    // Overview
    message += `├─⬣「 📈 *OVERVIEW* 」\n│\n`;
    message += `├❯ *Uptime:* ${health.uptime}\n`;
    message += `├❯ *Total Commands:* ${health.stats.totalCommands}\n`;
    message += `├❯ *Total Errors:* ${health.stats.totalErrors}\n`;
    message += `├❯ *Error Rate:* ${health.stats.errorRate}\n│\n`;

    // Memory
    message += `├─⬣「 💾 *MEMORY* 」\n│\n`;
    message += `├❯ *Heap Used:* ${health.memory.heapUsed}\n`;
    message += `├❯ *Usage:* ${health.memory.percentage}%\n│\n`;

    // Slowest commands
    if (slowest.length > 0) {
      message += `├─⬣「 🐌 *SLOWEST COMMANDS* 」\n│\n`;
      slowest.forEach((cmd, i) => {
        message += `├❯ ${i + 1}. ${cmd.name}: ${Math.round(cmd.avgTime)}ms (${cmd.count}x)\n`;
      });
      message += `│\n`;
    }

    // Most used commands
    if (mostUsed.length > 0) {
      message += `├─⬣「 🔥 *MOST USED COMMANDS* 」\n│\n`;
      mostUsed.forEach((cmd, i) => {
        message += `├❯ ${i + 1}. ${cmd.name}: ${cmd.count}x (${Math.round(cmd.avgTime)}ms avg)\n`;
      });
      message += `│\n`;
    }

    message += `├─⬣「 💡 *COMMANDS* 」\n│\n`;
    message += `├❯ ${global.prefix}performance reset - Reset stats\n`;
    message += `├❯ ${global.prefix}performance report - Full JSON report\n│\n`;
    message += `╰─⬣ *Performance monitoring active* ⬣`;

    await m.reply(message);

  } catch (error) {
    await m.reply(`❌ Error getting performance stats:\n${error.message}`);
    console.error('Performance stats error:', error);
  }
};

handler.help = ['performance', 'perf'];
handler.tags = ['owner'];
handler.command = /^(performance|perf|stats)$/i;
handler.rowner = true;

export default handler;
