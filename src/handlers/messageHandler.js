const config = require('../../config');
const commands = require('../commands');

async function handleMessage(client, message) {
    const body = message.body.trim();
    const chat = await message.getChat();
    
    if (body.startsWith(config.prefix)) {
        const args = body.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = commands[commandName];
        
        if (command) {
            try {
                await command.execute(client, message, args);
            } catch (error) {
                console.error(`Error executing command ${commandName}:`, error);
                await message.reply(`❌ Error executing command: ${error.message}`);
            }
        } else {
            await message.reply(`❌ Unknown command. Type ${config.prefix}help for available commands.`);
        }
    }
}

module.exports = { handleMessage };
