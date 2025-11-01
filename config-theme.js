/**
 * Miara Theme Configuration Addon
 * Modern Cyber Theme - Import after config.js
 */

// Override old menu styles with modern cyber theme
global.menuTop = '╔═══════════════════════╗';
global.menuBody = '║ ▶ ';
global.menuFooter = '╚═══════════════════════╝';
global.menuSeparator = '╠═══════════════════════╣';
global.menuSubBody = '║   › ';
global.menuArt = '\n━━━━━━━━━━━━━━━━━━━━━\n';

global.decorMenuTop = '┏━━━━━━━━━━━━━━━━━━━┓';
global.decorMenuBody = '┃ •';
global.decorMenuBody2 = '┃';
global.decorMenuFooter = '┗━━━━━━━━━━━━━━━━━━━┛';

global.separator = '━━━━━━━━━━━━━━━━━━━━━';
global.thinSeparator = '─────────────────────';
global.start = '╭─────────────────────╮';
global.end = '╰─────────────────────╯';

// Header Templates
global.header = {
    main: '『 ✦ MIARA ✦ 』',
    menu: '『 📋 MENU 』',
    help: '『 💡 HELP 』',
    info: '『 ℹ️ INFO 』',
    download: '『 📥 DOWNLOAD 』',
    search: '『 🔍 SEARCH 』',
    game: '『 🎮 GAME 』',
    tools: '『 🔧 TOOLS 』',
    group: '『 👥 GROUP 』',
    owner: '『 👑 OWNER 』',
    rpg: '『 ⚔️ RPG 』',
    sticker: '『 🎨 STICKER 』',
    convert: '『 🔄 CONVERT 』',
    ai: '『 🤖 AI 』',
};

// Modern Welcome Messages
global.welcome = `╔═══════════════════════╗
║ ✨ *WELCOME* ✨
║
║ Hello @user!
║ Welcome to *@group*
║
║ Please read the rules
║ and enjoy your stay! 🎉
╚═══════════════════════╝`;

global.bye = `╔═══════════════════════╗
║ 👋 *GOODBYE* 👋
║
║ @user has left
║ 
║ We hope to see you again! 💫
╚═══════════════════════╝`;

global.spromote = `╔═══════════════════════╗
║ ⚡ *PROMOTED* ⚡
║
║ @user is now an admin! 👑
╚═══════════════════════╝`;

global.sdemote = `╔═══════════════════════╗
║ 📍 *DEMOTED* 📍
║
║ @user is no longer admin
╚═══════════════════════╝`;

global.sDesc = `╔═══════════════════════╗
║ 📝 *DESCRIPTION CHANGED* 📝
║
║ New Description:
║ @desc
╚═══════════════════════╝`;

global.sSubject = `╔═══════════════════════╗
║ ✏️ *NAME CHANGED* ✏️
║
║ New Name: @subject
╚═══════════════════════╝`;

global.sIcon = `╔═══════════════════════╗
║ 🖼️ *ICON CHANGED* 🖼️
║
║ Group icon updated!
╚═══════════════════════╝`;

global.sRevoke = `╔═══════════════════════╗
║ 🔗 *LINK RESET* 🔗
║
║ Group link has been reset!
╚═══════════════════════╝`;

// Modern Status Messages
global.statusMessages = {
    processing: '⚡ *Processing...*',
    downloading: '📥 *Downloading...*',
    uploading: '📤 *Uploading...*',
    converting: '🔄 *Converting...*',
    generating: '✨ *Generating...*',
    searching: '🔍 *Searching...*',
    loading: '⏳ *Loading...*',
    success: '✅ *Success!*',
    error: '❌ *Error occurred*',
    warning: '⚠️ *Warning*',
    info: 'ℹ️ *Information*',
};

// Command Category Emojis
global.categoryEmoji = {
    info: 'ℹ️',
    download: '📥',
    search: '🔍',
    game: '🎮',
    rpg: '⚔️',
    group: '👥',
    admin: '⚡',
    owner: '👑',
    tools: '🔧',
    sticker: '🎨',
    convert: '🔄',
    nsfw: '🔞',
    ai: '🤖',
    fun: '🎪',
    economy: '💰',
};

// Level & Rank System
global.levelEmojis = ['🥚', '🐣', '🐥', '🦅', '🦉', '🦚', '🦜', '🦩', '🔥', '⭐'];
global.rankNames = ['Newbie', 'Beginner', 'Amateur', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Legend', 'Mythic', 'Divine'];

// Badge System
global.badges = {
    owner: '👑',
    admin: '⚡',
    moderator: '🛡️',
    premium: '💎',
    verified: '✅',
    vip: '⭐',
    legend: '🏆',
    newbie: '🌱',
};

// Formatted Messages
global.formatMessage = {
    error: (msg) => `❌ *Error*\n\n${msg}`,
    success: (msg) => `✅ *Success*\n\n${msg}`,
    warning: (msg) => `⚠️ *Warning*\n\n${msg}`,
    info: (msg) => `ℹ️ *Info*\n\n${msg}`,
    loading: (msg) => `⏳ *${msg || 'Please wait...'}*`,
};

// Box Templates
global.box = {
    single: (title, content, footer = '') => {
        return `╭─────────────────────╮
│ ${title}
├─────────────────────┤
│ ${content}
${footer ? `├─────────────────────┤\n│ ${footer}` : ''}
╰─────────────────────╯`;
    },
    
    double: (title, content, footer = '') => {
        return `╔═══════════════════════╗
║ ${title}
╠═══════════════════════╣
║ ${content}
${footer ? `╠═══════════════════════╣\n║ ${footer}` : ''}
╚═══════════════════════╝`;
    },
    
    simple: (content) => {
        return `┏━━━━━━━━━━━━━━━━━━━┓
┃ ${content}
┗━━━━━━━━━━━━━━━━━━━┛`;
    },
};

console.log('✨ Modern Cyber Theme Loaded!');
