module.exports = {
    name: 'add',
    aliases: ['addmember'],
    description: 'Add member to group',
    async execute(client, message, args) {
        try {
            const chat = await message.getChat();
            
            if (!chat.isGroup) {
                return await message.reply('❌ This command can only be used in groups!');
            }
            
            const botParticipant = chat.participants.find(p => p.id._serialized === client.info.wid._serialized);
            if (!botParticipant || !botParticipant.isAdmin) {
                return await message.reply('❌ Bot needs to be admin to add members!');
            }
            
            if (args.length === 0) {
                return await message.reply('❌ Please provide a phone number!\nUsage: !add 1234567890');
            }
            
            let number = args[0].replace(/[^0-9]/g, '');
            
            if (!number.startsWith('1') && number.length === 10) {
                number = '1' + number;
            }
            
            const numberId = number + '@c.us';
            
            await message.reply('⏳ Adding member...');
            
            await chat.addParticipants([numberId]);
            
            await message.reply(`✅ Successfully added +${number} to the group!`);
            
        } catch (error) {
            console.error('Add member error:', error);
            if (error.message.includes('participant')) {
                await message.reply('❌ User is already in the group or has privacy settings preventing addition!');
            } else {
                await message.reply('❌ Error adding member: ' + error.message);
            }
        }
    }
};
