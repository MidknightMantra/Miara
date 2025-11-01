const config = require('../../config');
const os = require('os');

module.exports = {
    name: 'info',
    aliases: ['botinfo'],
    description: 'Get bot information',
    async execute(client, message, args) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const chats = await client.getChats();
        const groupChats = chats.filter(c => c.isGroup).length;
        const privateChats = chats.filter(c => !c.isGroup).length;
        
        const info = `
╔════════════════════════╗
║   Bot Information   ║
╚════════════════════════╝

🤖 *Bot Name:* ${config.botName}
📱 *Number:* ${client.info.wid.user}
⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s

💬 *Chats:*
  • Groups: ${groupChats}
  • Private: ${privateChats}
  • Total: ${chats.length}

💻 *System:*
  • Platform: ${os.platform()}
  • Memory: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB
  • Node: ${process.version}

📋 *Features:*
  ✅ Stickers
  ✅ Media Download
  ✅ Group Management
  ✅ Anti-Spam
  ✅ Broadcast Messages
        `.trim();
        
        await message.reply(info);
    }
};
