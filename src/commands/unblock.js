const config = require('../../config');

module.exports = {
    name: 'unblock',
    aliases: ['unblockuser'],
    description: 'Unblock a user',
    async execute(client, message, args) {
        try {
            if (!config.owner || message.from !== config.owner) {
                return await message.reply('❌ Only the bot owner can use this command!');
            }
            
            const mentionedUsers = await message.getMentions();
            
            if (mentionedUsers.length === 0) {
                return await message.reply('❌ Please mention a user to unblock!\nUsage: !unblock @user');
            }
            
            await message.reply('⏳ Unblocking user...');
            
            for (const user of mentionedUsers) {
                await user.unblock();
            }
            
            await message.reply(`✅ Successfully unblocked ${mentionedUsers.length} user(s)!`);
            
        } catch (error) {
            console.error('Unblock error:', error);
            await message.reply('❌ Error unblocking user: ' + error.message);
        }
    }
};
