// ==========================================
// AUTO STATUS VIEWER - MIARA BOT
// Automatically views, saves, and reacts to statuses
// ==========================================

import { downloadContentFromMessage } from 'baileys';
import fs from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  autoView: true,
  autoReact: true,
  autoSave: true,
  reactions: ['👀', '❤️', '🔥', '😍', '👍', '💯'],
  saveDir: './temp/status_backup',
  checkInterval: 30000, // Check every 30 seconds
  maxStatusAge: 24 * 60 * 60 * 1000, // 24 hours
};

// Status cache
const statusCache = new Map();
const processedStatuses = new Set();
let isMonitoring = false;

//  ===========================
// MAIN HANDLER
// ===========================

export async function before(m) {
  // Start monitoring if not already started
  if (!isMonitoring && global.conn) {
    startStatusMonitor(global.conn);
    isMonitoring = true;
  }
  
  // Don't process non-status messages
  if (m.chat !== 'status@broadcast') return;
  
  try {
    await handleStatusMessage(m, global.conn);
  } catch (error) {
    console.error('Error handling status:', error);
  }
}

// ===========================
// STATUS MONITORING
// ===========================

async function startStatusMonitor(conn) {
  console.log('🎯 Status monitor started');
  
  // Ensure backup directory exists
  if (!fs.existsSync(CONFIG.saveDir)) {
    fs.mkdirSync(CONFIG.saveDir, { recursive: true });
  }
  
  // Initial check
  await checkAndProcessStatuses(conn);
  
  // Regular interval checks
  setInterval(async () => {
    try {
      await checkAndProcessStatuses(conn);
    } catch (error) {
      console.error('Error in status monitor interval:', error);
    }
  }, CONFIG.checkInterval);
  
  // Cleanup old files
  setInterval(() => {
    cleanupOldStatuses();
  }, 60 * 60 * 1000); // Cleanup every hour
}

async function checkAndProcessStatuses(conn) {
  try {
    // Get all status messages
    const statuses = await fetchAllStatuses(conn);
    
    if (!statuses || statuses.length === 0) {
      return;
    }
    
    console.log(`📱 Found ${statuses.length} status(es)`);
    
    for (const status of statuses) {
      const statusId = status.key.id;
      
      // Skip if already processed
      if (processedStatuses.has(statusId)) continue;
      
      // Process new status
      await processStatus(conn, status);
      
      // Mark as processed
      processedStatuses.add(statusId);
      statusCache.set(statusId, {
        ...status,
        processedAt: Date.now()
      });
    }
    
    // Cleanup old cache
    cleanupStatusCache();
  } catch (error) {
    console.error('Error checking statuses:', error);
  }
}

async function fetchAllStatuses(conn) {
  try {
    // Method 1: Use store
    if (conn.store && conn.store.messages && conn.store.messages['status@broadcast']) {
      const messages = Array.from(conn.store.messages['status@broadcast'].values());
      return messages.filter(msg => !msg.key.fromMe && isRecentStatus(msg));
    }
    
    // Method 2: Direct fetch
    const chats = await conn.groupFetchAllParticipating();
    const statusChat = chats['status@broadcast'];
    
    if (statusChat) {
      return statusChat.messages || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return [];
  }
}

// ===========================
// STATUS PROCESSING
// ===========================

async function processStatus(conn, status) {
  try {
    const sender = status.key.remoteJid;
    const name = status.pushName || sender.split('@')[0];
    
    console.log(`📸 Processing status from: ${name}`);
    
    // Auto view (mark as read)
    if (CONFIG.autoView) {
      await viewStatus(conn, status);
    }
    
    // Auto react
    if (CONFIG.autoReact) {
      await reactToStatusAuto(conn, status);
    }
    
    // Auto save
    if (CONFIG.autoSave) {
      await saveStatus(conn, status);
    }
    
    // Send notification to owner
    await notifyOwner(conn, status, name);
    
  } catch (error) {
    console.error('Error processing status:', error);
  }
}

async function viewStatus(conn, status) {
  try {
    await conn.readMessages([status.key]);
    console.log(`👀 Viewed status from: ${status.pushName}`);
  } catch (error) {
    console.error('Error viewing status:', error);
  }
}

async function reactToStatusAuto(conn, status) {
  try {
    const reaction = CONFIG.reactions[Math.floor(Math.random() * CONFIG.reactions.length)];
    
    await conn.sendMessage(status.key.remoteJid, {
      react: {
        text: reaction,
        key: status.key
      }
    });
    
    console.log(`💗 Reacted ${reaction} to status from: ${status.pushName}`);
  } catch (error) {
    console.error('Error reacting to status:', error);
  }
}

async function saveStatus(conn, status) {
  try {
    const message = status.message;
    if (!message) return;
    
    const type = Object.keys(message)[0];
    const content = message[type];
    
    // Skip text-only statuses
    if (type === 'conversation' || type === 'extendedTextMessage') {
      return await saveTextStatus(status);
    }
    
    // Download media
    if (content && (type.includes('image') || type.includes('video') || type.includes('audio'))) {
      await saveMediaStatus(conn, status, type, content);
    }
  } catch (error) {
    console.error('Error saving status:', error);
  }
}

async function saveTextStatus(status) {
  try {
    const text = status.message.conversation || status.message.extendedTextMessage?.text || '';
    const fileName = `${Date.now()}_${status.pushName || 'unknown'}_text.txt`;
    const filePath = path.join(CONFIG.saveDir, fileName);
    
    const content = `
Status from: ${status.pushName || 'Unknown'}
Time: ${new Date(status.messageTimestamp * 1000).toLocaleString()}
Number: ${status.key.remoteJid}

${text}
`;
    
    fs.writeFileSync(filePath, content);
    console.log(`💾 Saved text status: ${fileName}`);
  } catch (error) {
    console.error('Error saving text status:', error);
  }
}

async function saveMediaStatus(conn, status, type, content) {
  try {
    const buffer = await downloadMediaFromStatus(content, type);
    
    if (!buffer || buffer.length === 0) {
      console.log('❌ Failed to download media from status');
      return;
    }
    
    const ext = getFileExtension(type);
    const fileName = `${Date.now()}_${status.pushName || 'unknown'}.${ext}`;
    const filePath = path.join(CONFIG.saveDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`💾 Saved ${type} status: ${fileName} (${buffer.length} bytes)`);
    
    // Save caption if exists
    if (content.caption) {
      const captionFile = filePath + '.txt';
      fs.writeFileSync(captionFile, content.caption);
    }
  } catch (error) {
    console.error('Error saving media status:', error);
  }
}

async function downloadMediaFromStatus(content, type) {
  try {
    const mediaType = type.includes('image') ? 'image' 
                    : type.includes('video') ? 'video'
                    : type.includes('audio') ? 'audio'
                    : 'document';
    
    const stream = await downloadContentFromMessage(content, mediaType);
    let buffer = Buffer.from([]);
    
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    
    return buffer;
  } catch (error) {
    console.error('Error downloading media:', error);
    return null;
  }
}

async function notifyOwner(conn, status, name) {
  try {
    const owner = global.owner[0][0] + '@s.whatsapp.net';
    const type = getStatusType(status);
    
    let notificationText = `
╭─⬣「 📱 *NEW STATUS* 」⬣
│
│ 👤 *From:* ${name}
│ 📱 *Number:* ${status.key.remoteJid.split('@')[0]}
│ 📝 *Type:* ${type}
│ ⏰ *Time:* ${new Date(status.messageTimestamp * 1000).toLocaleString()}
│
╰─⬣

💡 *Actions taken:*
${CONFIG.autoView ? '✅ Viewed' : '⏹️ Not viewed'}
${CONFIG.autoReact ? '✅ Reacted' : '⏹️ Not reacted'}
${CONFIG.autoSave ? '✅ Saved' : '⏹️ Not saved'}
`;

    await conn.sendMessage(owner, { text: notificationText });
    
    // Forward status content if it's media
    await forwardStatusToOwner(conn, status, owner);
    
  } catch (error) {
    console.error('Error notifying owner:', error);
  }
}

async function forwardStatusToOwner(conn, status, owner) {
  try {
    const message = status.message;
    const type = Object.keys(message)[0];
    const content = message[type];
    
    switch (type) {
      case 'imageMessage':
        const imageBuffer = await downloadMediaFromStatus(content, type);
        if (imageBuffer) {
          await conn.sendMessage(owner, {
            image: imageBuffer,
            caption: content.caption || '📸 Status Image'
          });
        }
        break;
        
      case 'videoMessage':
        const videoBuffer = await downloadMediaFromStatus(content, type);
        if (videoBuffer) {
          await conn.sendMessage(owner, {
            video: videoBuffer,
            caption: content.caption || '🎥 Status Video'
          });
        }
        break;
        
      case 'audioMessage':
        const audioBuffer = await downloadMediaFromStatus(content, type);
        if (audioBuffer) {
          await conn.sendMessage(owner, {
            audio: audioBuffer,
            mimetype: 'audio/mp4',
            ptt: content.ptt || false
          });
        }
        break;
        
      case 'extendedTextMessage':
      case 'conversation':
        const text = content.text || message.conversation || '';
        await conn.sendMessage(owner, { text: `💬 *Status Text:*\n\n${text}` });
        break;
    }
  } catch (error) {
    console.error('Error forwarding status to owner:', error);
  }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

function isRecentStatus(status) {
  if (!status.messageTimestamp) return false;
  const age = Date.now() - (status.messageTimestamp * 1000);
  return age < CONFIG.maxStatusAge;
}

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

function getFileExtension(type) {
  if (type.includes('image')) return 'jpg';
  if (type.includes('video')) return 'mp4';
  if (type.includes('audio')) return 'ogg';
  if (type.includes('document')) return 'pdf';
  return 'bin';
}

function cleanupStatusCache() {
  const now = Date.now();
  for (const [id, status] of statusCache.entries()) {
    if (now - status.processedAt > CONFIG.maxStatusAge) {
      statusCache.delete(id);
      processedStatuses.delete(id);
    }
  }
}

function cleanupOldStatuses() {
  try {
    if (!fs.existsSync(CONFIG.saveDir)) return;
    
    const files = fs.readdirSync(CONFIG.saveDir);
    const now = Date.now();
    let deleted = 0;
    
    for (const file of files) {
      const filePath = path.join(CONFIG.saveDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;
      
      // Delete files older than 7 days
      if (age > 7 * 24 * 60 * 60 * 1000) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    }
    
    if (deleted > 0) {
      console.log(`🗑️ Cleaned up ${deleted} old status file(s)`);
    }
  } catch (error) {
    console.error('Error cleaning up old statuses:', error);
  }
}

// ===========================
// STATUS HANDLER MESSAGE
// ===========================

async function handleStatusMessage(m, conn) {
  // This handles status messages that come through the normal message flow
  const statusId = m.key.id;
  
  if (processedStatuses.has(statusId)) return;
  
  await processStatus(conn, m);
  processedStatuses.add(statusId);
}

// Export configuration
export const disabled = false;
export const priority = 10;
