// ==========================================
// STATUS VIEWER & REACTOR - MIARA BOT
// Advanced WhatsApp Status Management
// ==========================================

import { downloadContentFromMessage } from 'baileys';
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const language = global.db.data.users[m.sender].language || global.defaultLanguage;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`));
  const translator = _translate.plugins.status_viewer || {
    texto1: "📱 *Status Viewer*",
    texto2: "No statuses available",
    texto3: "Status downloaded successfully",
    texto4: "Select a status to view",
    texto5: "Invalid status number"
  };

  try {
    switch (command) {
      case 'liststatus':
      case 'statuslist':
        await listStatuses(conn, m, translator);
        break;
        
      case 'getstatus':
      case 'viewstatus':
        await getStatus(conn, m, args, translator);
        break;
        
      case 'reactstatus':
        await reactToStatus(conn, m, args, translator);
        break;
        
      case 'downloadstatus':
      case 'dlstatus':
        await downloadStatus(conn, m, args, translator);
        break;
        
      default:
        await showStatusHelp(m, usedPrefix, translator);
    }
  } catch (error) {
    console.error('Error in status viewer:', error);
    await m.reply(`❌ Error: ${error.message}`);
  }
};

// List all available statuses
async function listStatuses(conn, m, translator) {
  try {
    const statuses = await conn.fetchStatus();
    
    if (!statuses || statuses.length === 0) {
      return await m.reply(`📱 ${translator.texto2}`);
    }

    let message = `╭─⬣「 📱 *STATUS VIEWER* 」⬣\n│\n`;
    
    statuses.forEach((status, index) => {
      const name = status.pushName || status.notify || 'Unknown';
      const time = new Date(status.messageTimestamp * 1000).toLocaleString();
      const type = getStatusType(status);
      
      message += `│ ${index + 1}. 👤 ${name}\n`;
      message += `│    📅 ${time}\n`;
      message += `│    📝 Type: ${type}\n`;
      message += `│\n`;
    });
    
    message += `╰─⬣\n\n`;
    message += `💡 *Commands:*\n`;
    message += `• View: \`.getstatus <number>\`\n`;
    message += `• React: \`.reactstatus <number> <emoji>\`\n`;
    message += `• Download: \`.downloadstatus <number>\``;

    await m.reply(message);
  } catch (error) {
    console.error('Error listing statuses:', error);
    await m.reply(`❌ ${translator.texto2}`);
  }
}

// Get specific status
async function getStatus(conn, m, args, translator) {
  try {
    if (!args[0]) {
      return await m.reply(`💡 Usage: .getstatus <number>\nUse .liststatus to see available statuses`);
    }

    const index = parseInt(args[0]) - 1;
    const statuses = await conn.fetchStatus();
    
    if (!statuses || index < 0 || index >= statuses.length) {
      return await m.reply(`❌ ${translator.texto5}`);
    }

    const status = statuses[index];
    await forwardStatus(conn, m, status);
  } catch (error) {
    console.error('Error getting status:', error);
    await m.reply(`❌ Error viewing status: ${error.message}`);
  }
}

// React to status
async function reactToStatus(conn, m, args, translator) {
  try {
    if (!args[0] || !args[1]) {
      return await m.reply(`💡 Usage: .reactstatus <number> <emoji>\nExample: .reactstatus 1 ❤️`);
    }

    const index = parseInt(args[0]) - 1;
    const emoji = args[1];
    const statuses = await conn.fetchStatus();
    
    if (!statuses || index < 0 || index >= statuses.length) {
      return await m.reply(`❌ ${translator.texto5}`);
    }

    const status = statuses[index];
    
    await conn.sendMessage(status.key.remoteJid, {
      react: {
        text: emoji,
        key: status.key
      }
    });

    await m.reply(`✅ Reacted with ${emoji} to status from ${status.pushName || 'User'}`);
  } catch (error) {
    console.error('Error reacting to status:', error);
    await m.reply(`❌ Error reacting: ${error.message}`);
  }
}

// Download status
async function downloadStatus(conn, m, args, translator) {
  try {
    if (!args[0]) {
      return await m.reply(`💡 Usage: .downloadstatus <number>\nUse .liststatus to see available statuses`);
    }

    const index = parseInt(args[0]) - 1;
    const statuses = await conn.fetchStatus();
    
    if (!statuses || index < 0 || index >= statuses.length) {
      return await m.reply(`❌ ${translator.texto5}`);
    }

    const status = statuses[index];
    await downloadAndForward(conn, m, status, translator);
  } catch (error) {
    console.error('Error downloading status:', error);
    await m.reply(`❌ Error downloading: ${error.message}`);
  }
}

// Forward status to user
async function forwardStatus(conn, m, status) {
  try {
    const message = status.message;
    const type = Object.keys(message)[0];

    switch (type) {
      case 'imageMessage':
        await conn.sendMessage(m.chat, {
          image: await downloadMedia(message.imageMessage),
          caption: message.imageMessage.caption || '📱 Status from: ' + (status.pushName || 'User')
        });
        break;

      case 'videoMessage':
        await conn.sendMessage(m.chat, {
          video: await downloadMedia(message.videoMessage),
          caption: message.videoMessage.caption || '📱 Status from: ' + (status.pushName || 'User')
        });
        break;

      case 'audioMessage':
        await conn.sendMessage(m.chat, {
          audio: await downloadMedia(message.audioMessage),
          mimetype: 'audio/mp4',
          ptt: message.audioMessage.ptt || false
        });
        break;

      case 'extendedTextMessage':
      case 'conversation':
        const text = message.extendedTextMessage?.text || message.conversation || '';
        await m.reply(`📱 *Status from ${status.pushName || 'User'}*\n\n${text}`);
        break;

      default:
        await m.reply(`📱 Status type: ${type}\n(Preview not available)`);
    }
  } catch (error) {
    console.error('Error forwarding status:', error);
    throw error;
  }
}

// Download media from status
async function downloadMedia(messageContent) {
  try {
    const stream = await downloadContentFromMessage(messageContent, messageContent.mimetype.split('/')[0]);
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    return buffer;
  } catch (error) {
    console.error('Error downloading media:', error);
    throw error;
  }
}

// Download and forward
async function downloadAndForward(conn, m, status, translator) {
  await forwardStatus(conn, m, status);
  await m.reply(`✅ ${translator.texto3}`);
}

// Get status type
function getStatusType(status) {
  if (!status.message) return 'Unknown';
  
  const type = Object.keys(status.message)[0];
  const types = {
    'imageMessage': '🖼️ Image',
    'videoMessage': '🎥 Video',
    'audioMessage': '🎵 Audio',
    'extendedTextMessage': '📝 Text',
    'conversation': '💬 Text',
    'documentMessage': '📄 Document'
  };
  
  return types[type] || `📱 ${type}`;
}

// Show help
async function showStatusHelp(m, prefix, translator) {
  const help = `
╭─⬣「 📱 *STATUS COMMANDS* 」⬣
│
│ 📋 *View Commands:*
│ • \`${prefix}liststatus\`
│   View all available statuses
│
│ • \`${prefix}getstatus <num>\`
│   View specific status
│
│ 💗 *React Commands:*
│ • \`${prefix}reactstatus <num> <emoji>\`
│   React to a status
│   Example: ${prefix}reactstatus 1 ❤️
│
│ 📥 *Download Commands:*
│ • \`${prefix}downloadstatus <num>\`
│   Download status media
│
╰─⬣

💡 *Tips:*
• Use .liststatus first to see numbers
• Reactions work with any emoji
• Media is automatically downloaded
`;

  await m.reply(help);
}

handler.help = ['liststatus', 'getstatus', 'reactstatus', 'downloadstatus'];
handler.tags = ['tools'];
handler.command = /^(liststatus|statuslist|getstatus|viewstatus|reactstatus|downloadstatus|dlstatus)$/i;

export default handler;
