module.exports = {
    name: 'setdesc',
    aliases: ['setdescription', 'desc'],
    description: 'Set group description',
    async execute(client, message, args) {
        try {
            const chat = await message.getChat();
            
            if (!chat.isGroup) {
                return await message.reply('❌ This command can only be used in groups!');
            }
            
            const botParticipant = chat.participants.find(p => p.id._serialized === client.info.wid._serialized);
            if (!botParticipant || !botParticipant.isAdmin) {
                return await message.reply('❌ Bot needs to be admin to change description!');
            }
            
            if (args.length === 0) {
                return await message.reply('❌ Please provide a description!\nUsage: !setdesc <text>');
            }
            
            const description = args.join(' ');
            
            await message.reply('⏳ Changing description...');
            
            await chat.setDescription(description);
            
            await message.reply('✅ Group description updated successfully!');
            
        } catch (error) {
            console.error('Set description error:', error);
            await message.reply('❌ Error setting description: ' + error.message);
        }
    }
};
