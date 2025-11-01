const config = require('../../config');

module.exports = {
    name: 'shutdown',
    aliases: ['stop', 'exit'],
    description: 'Stop the bot',
    async execute(client, message, args) {
        try {
            if (!config.owner || message.from !== config.owner) {
                return await message.reply('❌ Only the bot owner can use this command!');
            }
            
            await message.reply('⏹️ Shutting down bot...');
            
            setTimeout(async () => {
                await client.destroy();
                process.exit(0);
            }, 2000);
            
        } catch (error) {
            console.error('Shutdown error:', error);
            await message.reply('❌ Error shutting down: ' + error.message);
        }
    }
};
