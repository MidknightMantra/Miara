module.exports = {
    name: 'ping',
    aliases: ['p'],
    description: 'Check bot latency',
    async execute(client, message, args) {
        const start = Date.now();
        const sent = await message.reply('🏓 Pinging...');
        const latency = Date.now() - start;
        
        await sent.edit(`🏓 Pong!\n⏱️ Latency: ${latency}ms`);
    }
};
