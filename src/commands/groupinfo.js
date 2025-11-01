module.exports = {
    name: 'groupinfo',
    aliases: ['ginfo', 'infogroup'],
    description: 'Get group information',
    async execute(client, message, args) {
        try {
            const chat = await message.getChat();
            
            if (!chat.isGroup) {
                return await message.reply('❌ This command can only be used in groups!');
            }
            
            const groupMetadata = chat;
            const admins = groupMetadata.participants.filter(p => p.isAdmin).length;
            const members = groupMetadata.participants.length;
            
            const creationDate = new Date(groupMetadata.createdAt * 1000).toLocaleDateString();
            
            const info = `
╔════════════════════════╗
║   Group Information   ║
╚════════════════════════╝

📌 *Name:* ${groupMetadata.name}
🆔 *ID:* ${groupMetadata.id._serialized}
📅 *Created:* ${creationDate}
👥 *Members:* ${members}
👑 *Admins:* ${admins}

📝 *Description:*
${groupMetadata.description || 'No description'}

⚙️ *Settings:*
${groupMetadata.announce ? '🔒 Only admins can send messages' : '✅ All participants can send messages'}
${groupMetadata.restrict ? '🔒 Only admins can edit group info' : '✅ All participants can edit group info'}
            `.trim();
            
            await message.reply(info);
            
        } catch (error) {
            console.error('Group info error:', error);
            await message.reply('❌ Error getting group info: ' + error.message);
        }
    }
};
