module.exports = {
    name: 'setname',
    aliases: ['groupname', 'changename'],
    description: 'Set group name',
    async execute(client, message, args) {
        try {
            const chat = await message.getChat();
            
            if (!chat.isGroup) {
                return await message.reply('❌ This command can only be used in groups!');
            }
            
            const botParticipant = chat.participants.find(p => p.id._serialized === client.info.wid._serialized);
            if (!botParticipant || !botParticipant.isAdmin) {
                return await message.reply('❌ Bot needs to be admin to change group name!');
            }
            
            if (args.length === 0) {
                return await message.reply('❌ Please provide a name!\nUsage: !setname <text>');
            }
            
            const name = args.join(' ');
            
            await message.reply('⏳ Changing group name...');
            
            await chat.setSubject(name);
            
            await message.reply('✅ Group name updated successfully!');
            
        } catch (error) {
            console.error('Set name error:', error);
            await message.reply('❌ Error setting name: ' + error.message);
        }
    }
};
