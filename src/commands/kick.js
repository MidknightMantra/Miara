module.exports = {
    name: 'kick',
    aliases: ['remove'],
    description: 'Remove member from group',
    async execute(client, message, args) {
        try {
            const chat = await message.getChat();
            
            if (!chat.isGroup) {
                return await message.reply('❌ This command can only be used in groups!');
            }
            
            const botParticipant = chat.participants.find(p => p.id._serialized === client.info.wid._serialized);
            if (!botParticipant || !botParticipant.isAdmin) {
                return await message.reply('❌ Bot needs to be admin to remove members!');
            }
            
            const mentionedUsers = await message.getMentions();
            
            if (mentionedUsers.length === 0) {
                return await message.reply('❌ Please mention a user to kick!\nUsage: !kick @user');
            }
            
            await message.reply('⏳ Removing member...');
            
            for (const user of mentionedUsers) {
                await chat.removeParticipants([user.id._serialized]);
            }
            
            await message.reply(`✅ Successfully removed ${mentionedUsers.length} member(s)!`);
            
        } catch (error) {
            console.error('Kick member error:', error);
            await message.reply('❌ Error removing member: ' + error.message);
        }
    }
};
