const { MessageMedia } = require('whatsapp-web.js');

module.exports = {
    name: 'toimg',
    aliases: ['toimage'],
    description: 'Convert sticker to image',
    async execute(client, message, args) {
        try {
            const quotedMsg = await message.getQuotedMessage();
            const targetMessage = quotedMsg || message;
            
            if (!targetMessage.hasMedia) {
                return await message.reply('❌ Please reply to a sticker!');
            }
            
            if (targetMessage.type !== 'sticker') {
                return await message.reply('❌ That is not a sticker!');
            }
            
            await message.reply('⏳ Converting to image...');
            
            const media = await targetMessage.downloadMedia();
            
            if (!media) {
                return await message.reply('❌ Failed to download sticker!');
            }
            
            media.mimetype = 'image/png';
            
            await client.sendMessage(message.from, media, {
                caption: '✅ Converted to image'
            });
            
        } catch (error) {
            console.error('ToImage error:', error);
            await message.reply('❌ Error converting sticker: ' + error.message);
        }
    }
};
