const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'getpic',
    aliases: ['pp', 'profilepic'],
    description: 'Get profile picture',
    async execute(client, message, args) {
        try {
            const mentionedUsers = await message.getMentions();
            
            let targetUser;
            
            if (mentionedUsers.length > 0) {
                targetUser = mentionedUsers[0];
            } else {
                targetUser = await message.getContact();
            }
            
            await message.reply('⏳ Getting profile picture...');
            
            const profilePicUrl = await targetUser.getProfilePicUrl();
            
            if (!profilePicUrl) {
                return await message.reply('❌ User has no profile picture!');
            }
            
            const media = await MessageMedia.fromUrl(profilePicUrl);
            
            await client.sendMessage(message.from, media, {
                caption: `📸 Profile picture of ${targetUser.pushname || targetUser.number}`
            });
            
        } catch (error) {
            console.error('Get pic error:', error);
            await message.reply('❌ Error getting profile picture: ' + error.message);
        }
    }
};
