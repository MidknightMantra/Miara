const { MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');
const mime = require('mime-types');

module.exports = {
    name: 'download',
    aliases: ['dl', 'get'],
    description: 'Download media from URL',
    async execute(client, message, args) {
        try {
            if (args.length === 0) {
                return await message.reply('❌ Please provide a URL!\nUsage: !download <url>');
            }
            
            const url = args[0];
            
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return await message.reply('❌ Invalid URL! Must start with http:// or https://');
            }
            
            await message.reply('⏳ Downloading...');
            
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                maxContentLength: 50 * 1024 * 1024
            });
            
            const mimeType = response.headers['content-type'] || mime.lookup(url) || 'application/octet-stream';
            const base64 = Buffer.from(response.data).toString('base64');
            
            const media = new MessageMedia(mimeType, base64);
            
            await client.sendMessage(message.from, media, {
                caption: '✅ Downloaded successfully'
            });
            
        } catch (error) {
            console.error('Download error:', error);
            if (error.code === 'ECONNABORTED') {
                await message.reply('❌ Download timeout! File too large or server is slow.');
            } else {
                await message.reply('❌ Error downloading: ' + error.message);
            }
        }
    }
};
