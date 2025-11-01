const config = require('../../config');

module.exports = {
    name: 'help',
    aliases: ['h', 'menu'],
    description: 'Display all available commands',
    async execute(client, message, args) {
        const helpText = `
╔════════════════════════╗
║   ${config.botName} Commands   ║
╚════════════════════════╝

📋 *General Commands*
${config.prefix}help - Show this menu
${config.prefix}ping - Check bot latency
${config.prefix}info - Bot information

🖼️ *Media Commands*
${config.prefix}sticker - Convert image/video to sticker
${config.prefix}toimg - Convert sticker to image
${config.prefix}download <url> - Download media

👥 *Group Commands*
${config.prefix}groupinfo - Group information
${config.prefix}tagall - Tag all members
${config.prefix}add <number> - Add member
${config.prefix}kick <@user> - Kick member
${config.prefix}promote <@user> - Make admin
${config.prefix}demote <@user> - Remove admin
${config.prefix}setdesc <text> - Set description
${config.prefix}setname <text> - Set group name
${config.prefix}leave - Bot leaves group

📨 *Utility Commands*
${config.prefix}broadcast <text> - Broadcast message
${config.prefix}block <@user> - Block user
${config.prefix}unblock <@user> - Unblock user
${config.prefix}getpic <@user> - Get profile picture

⚙️ *Owner Commands*
${config.prefix}join <link> - Join group via link
${config.prefix}shutdown - Stop bot

━━━━━━━━━━━━━━━━━━━━
Prefix: ${config.prefix}
Bot: ${config.botName}
        `.trim();
        
        await message.reply(helpText);
    }
};
