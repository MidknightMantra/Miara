module.exports = {
    name: 'demote',
    aliases: ['unadmin'],
    description: 'Remove admin privileges',
    async execute(client, message, args) {
        try {
            const chat = await message.getChat();
            
            if (!chat.isGroup) {
                return await message.reply('❌ This command can only be used in groups!');
            }
            
            const botParticipant = chat.participants.find(p => p.id._serialized === client.info.wid._serialized);
            if (!botParticipant || !botParticipant.isAdmin) {
                return await message.reply('❌ Bot needs to be admin to demote members!');
            }
            
            const mentionedUsers = await message.getMentions();
            
            if (mentionedUsers.length === 0) {
                return await message.reply('❌ Please mention a user to demote!\nUsage: !demote @user');
            }
            
            await message.reply('⏳ Demoting member...');
            
            for (const user of mentionedUsers) {
                await chat.demoteParticipants([user.id._serialized]);
            }
            
            await message.reply(`✅ Successfully demoted ${mentionedUsers.length} member(s)!`);
            
        } catch (error) {
            console.error('Demote error:', error);
            await message.reply('❌ Error demoting member: ' + error.message);
        }
    }
};
