const config = require('../../config');

module.exports = {
    name: 'broadcast',
    aliases: ['bc'],
    description: 'Broadcast message to all chats',
    async execute(client, message, args) {
        try {
            if (!config.owner || message.from !== config.owner) {
                return await message.reply('❌ Only the bot owner can use this command!');
            }
            
            if (args.length === 0) {
                return await message.reply('❌ Please provide a message to broadcast!\nUsage: !broadcast <message>');
            }
            
            const text = args.join(' ');
            const chats = await client.getChats();
            
            await message.reply(`⏳ Broadcasting to ${chats.length} chats...`);
            
            let success = 0;
            let failed = 0;
            
            for (const chat of chats) {
                try {
                    await chat.sendMessage(`📢 *BROADCAST MESSAGE*\n\n${text}`);
                    success++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`Failed to broadcast to ${chat.id._serialized}:`, error);
                    failed++;
                }
            }
            
            await message.reply(`✅ Broadcast complete!\n✅ Success: ${success}\n❌ Failed: ${failed}`);
            
        } catch (error) {
            console.error('Broadcast error:', error);
            await message.reply('❌ Error broadcasting: ' + error.message);
        }
    }
};
