module.exports = {
    name: 'tagall',
    aliases: ['everyone', 'all'],
    description: 'Tag all group members',
    async execute(client, message, args) {
        try {
            const chat = await message.getChat();
            
            if (!chat.isGroup) {
                return await message.reply('❌ This command can only be used in groups!');
            }
            
            const text = args.join(' ') || 'Tagged!';
            
            let mentions = [];
            let mentionText = `${text}\n\n`;
            
            for (let participant of chat.participants) {
                mentions.push(await client.getContactById(participant.id._serialized));
                mentionText += `@${participant.id.user} `;
            }
            
            await chat.sendMessage(mentionText, {
                mentions
            });
            
        } catch (error) {
            console.error('Tag all error:', error);
            await message.reply('❌ Error tagging members: ' + error.message);
        }
    }
};
