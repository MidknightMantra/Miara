const config = require('../../config');

module.exports = {
    name: 'join',
    aliases: ['joingroup'],
    description: 'Join group via invite link',
    async execute(client, message, args) {
        try {
            if (!config.owner || message.from !== config.owner) {
                return await message.reply('❌ Only the bot owner can use this command!');
            }
            
            if (args.length === 0) {
                return await message.reply('❌ Please provide a group invite link!\nUsage: !join <link>');
            }
            
            const inviteCode = args[0].split('/').pop();
            
            if (!inviteCode) {
                return await message.reply('❌ Invalid invite link!');
            }
            
            await message.reply('⏳ Joining group...');
            
            const result = await client.acceptInvite(inviteCode);
            
            await message.reply(`✅ Successfully joined group: ${result}`);
            
        } catch (error) {
            console.error('Join group error:', error);
            if (error.message.includes('already')) {
                await message.reply('❌ Bot is already in this group!');
            } else {
                await message.reply('❌ Error joining group: ' + error.message);
            }
        }
    }
};
