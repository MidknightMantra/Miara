module.exports = {
    name: 'promote',
    aliases: ['admin'],
    description: 'Make member admin',
    async execute(client, message, args) {
        try {
            const chat = await message.getChat();
            
            if (!chat.isGroup) {
                return await message.reply('❌ This command can only be used in groups!');
            }
            
            const botParticipant = chat.participants.find(p => p.id._serialized === client.info.wid._serialized);
            if (!botParticipant || !botParticipant.isAdmin) {
                return await message.reply('❌ Bot needs to be admin to promote members!');
            }
            
            const mentionedUsers = await message.getMentions();
            
            if (mentionedUsers.length === 0) {
                return await message.reply('❌ Please mention a user to promote!\nUsage: !promote @user');
            }
            
            await message.reply('⏳ Promoting member...');
            
            for (const user of mentionedUsers) {
                await chat.promoteParticipants([user.id._serialized]);
            }
            
            await message.reply(`✅ Successfully promoted ${mentionedUsers.length} member(s) to admin!`);
            
        } catch (error) {
            console.error('Promote error:', error);
            await message.reply('❌ Error promoting member: ' + error.message);
        }
    }
};
