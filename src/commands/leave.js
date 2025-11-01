module.exports = {
    name: 'leave',
    aliases: ['exit'],
    description: 'Bot leaves the group',
    async execute(client, message, args) {
        try {
            const chat = await message.getChat();
            
            if (!chat.isGroup) {
                return await message.reply('❌ This command can only be used in groups!');
            }
            
            await message.reply('👋 Goodbye everyone! Leaving the group...');
            
            setTimeout(async () => {
                await chat.leave();
            }, 2000);
            
        } catch (error) {
            console.error('Leave group error:', error);
            await message.reply('❌ Error leaving group: ' + error.message);
        }
    }
};
