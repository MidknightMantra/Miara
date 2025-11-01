const config = require('../../config');

module.exports = {
    name: 'block',
    aliases: ['blockuser'],
    description: 'Block a user',
    async execute(client, message, args) {
        try {
            if (!config.owner || message.from !== config.owner) {
                return await message.reply('❌ Only the bot owner can use this command!');
            }
            
            const mentionedUsers = await message.getMentions();
            
            if (mentionedUsers.length === 0) {
                return await message.reply('❌ Please mention a user to block!\nUsage: !block @user');
            }
            
            await message.reply('⏳ Blocking user...');
            
            for (const user of mentionedUsers) {
                await user.block();
            }
            
            await message.reply(`✅ Successfully blocked ${mentionedUsers.length} user(s)!`);
            
        } catch (error) {
            console.error('Block error:', error);
            await message.reply('❌ Error blocking user: ' + error.message);
        }
    }
};
