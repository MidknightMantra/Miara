const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    description: 'Convert image/video to sticker',
    async execute(client, message, args) {
        try {
            const quotedMsg = await message.getQuotedMessage();
            const targetMessage = quotedMsg || message;
            
            if (!targetMessage.hasMedia) {
                return await message.reply('❌ Please send or reply to an image/video/gif!');
            }
            
            await message.reply('⏳ Creating sticker...');
            
            const media = await targetMessage.downloadMedia();
            
            if (!media) {
                return await message.reply('❌ Failed to download media!');
            }
            
            if (!media.mimetype.includes('image') && !media.mimetype.includes('video')) {
                return await message.reply('❌ Only images and videos are supported!');
            }
            
            await client.sendMessage(message.from, media, {
                sendMediaAsSticker: true,
                stickerAuthor: 'Miara Bot',
                stickerName: 'Sticker'
            });
            
        } catch (error) {
            console.error('Sticker error:', error);
            await message.reply('❌ Error creating sticker: ' + error.message);
        }
    }
};
