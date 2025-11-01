const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const commands = require('./src/commands');
const { handleMessage } = require('./src/handlers/messageHandler');
const { handleGroup } = require('./src/handlers/groupHandler');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: config.sessionName,
        dataPath: './MiaraSession'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

const spamTracker = new Map();

client.on('qr', (qr) => {
    console.log('Scan the QR code below to login:');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('✅ Authentication successful!');
});

client.on('ready', async () => {
    console.log(`✅ ${config.botName} is ready!`);
    console.log(`📱 Connected as: ${client.info.pushname}`);
    console.log(`📞 Number: ${client.info.wid.user}`);
});

client.on('message', async (message) => {
    try {
        if (message.fromMe) return;
        
        const chat = await message.getChat();
        const sender = message.from;
        
        if (config.antiSpam.enabled) {
            if (!spamTracker.has(sender)) {
                spamTracker.set(sender, []);
            }
            const timestamps = spamTracker.get(sender);
            const now = Date.now();
            const recentMessages = timestamps.filter(t => now - t < config.antiSpam.timeWindow);
            
            if (recentMessages.length >= config.antiSpam.maxMessages) {
                await message.reply('⚠️ You are sending messages too quickly. Please slow down.');
                return;
            }
            
            recentMessages.push(now);
            spamTracker.set(sender, recentMessages);
        }
        
        if (config.features.autoRead) {
            await chat.sendSeen();
        }
        
        await handleMessage(client, message);
        
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

client.on('message_create', async (message) => {
    if (!message.fromMe) return;
    
    try {
        await handleMessage(client, message);
    } catch (error) {
        console.error('Error handling own message:', error);
    }
});

client.on('group_join', async (notification) => {
    try {
        await handleGroup(client, notification, 'join');
    } catch (error) {
        console.error('Error handling group join:', error);
    }
});

client.on('group_leave', async (notification) => {
    try {
        await handleGroup(client, notification, 'leave');
    } catch (error) {
        console.error('Error handling group leave:', error);
    }
});

client.on('disconnected', (reason) => {
    console.log('❌ Client was disconnected:', reason);
});

client.on('auth_failure', (message) => {
    console.error('❌ Authentication failed:', message);
});

process.on('SIGINT', async () => {
    console.log('\n⏹️  Stopping bot...');
    await client.destroy();
    process.exit(0);
});

console.log('🚀 Starting Miara WhatsApp Bot...');
client.initialize();
