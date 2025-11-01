const config = require('../../config');

async function handleGroup(client, notification, type) {
    try {
        const chat = await notification.getChat();
        
        if (!chat.isGroup) return;
        
        if (type === 'join' && config.groups.welcome) {
            const contact = await client.getContactById(notification.id.participant);
            const welcomeMessage = `👋 Welcome @${contact.number}!\n\nWelcome to *${chat.name}*!\nEnjoy your stay and follow the group rules.`;
            
            await chat.sendMessage(welcomeMessage, {
                mentions: [contact]
            });
        }
        
        if (type === 'leave' && config.groups.goodbye) {
            const contact = await client.getContactById(notification.id.participant);
            const goodbyeMessage = `👋 Goodbye @${contact.number}!\n\nThanks for being part of *${chat.name}*.`;
            
            await chat.sendMessage(goodbyeMessage, {
                mentions: [contact]
            });
        }
        
    } catch (error) {
        console.error('Error in group handler:', error);
    }
}

module.exports = { handleGroup };
