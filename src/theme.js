/**
 * Miara Theme Configuration
 * Modern, sleek design with customizable elements
 */

export const theme = {
    // Primary Theme
    name: 'Miara Modern',
    version: '2.0',
    style: 'cyberpunk',

    // Color Scheme (for terminal/console)
    colors: {
        primary: '#00ff9f',      // Cyan/Teal
        secondary: '#ff00ff',    // Magenta
        accent: '#ffd700',       // Gold
        success: '#00ff00',      // Green
        warning: '#ffaa00',      // Orange
        error: '#ff0066',        // Red
        info: '#00ccff',         // Blue
    },

    // Emojis Theme
    emojis: {
        // Status
        success: '✨',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        loading: '⏳',
        check: '✅',
        cross: '❎',
        
        // Actions
        download: '📥',
        upload: '📤',
        search: '🔍',
        play: '▶️',
        stop: '⏹️',
        pause: '⏸️',
        
        // Categories
        bot: '🤖',
        user: '👤',
        group: '👥',
        admin: '⚡',
        owner: '👑',
        premium: '💎',
        
        // Features
        game: '🎮',
        music: '🎵',
        image: '🖼️',
        video: '🎬',
        sticker: '🎨',
        
        // System
        online: '🟢',
        offline: '🔴',
        busy: '🟡',
        maintenance: '🔧',
        
        // Misc
        star: '⭐',
        fire: '🔥',
        lightning: '⚡',
        sparkle: '✨',
        rocket: '🚀',
        heart: '💖',
        coin: '💰',
        gem: '💎',
        trophy: '🏆',
        medal: '🏅',
    },

    // Menu Borders & Decorations
    borders: {
        // Modern Style
        modern: {
            top: '╭━━━━━━━━━━━━━━━━━━━╮',
            body: '┃',
            separator: '┣━━━━━━━━━━━━━━━━━━━┫',
            bottom: '╰━━━━━━━━━━━━━━━━━━━╯',
            bullet: '┃ ➤',
            subbullet: '┃   ◦',
        },
        
        // Sleek Style
        sleek: {
            top: '┏━━━━━━━━━━━━━━━━━━━┓',
            body: '┃',
            separator: '┣━━━━━━━━━━━━━━━━━━━┫',
            bottom: '┗━━━━━━━━━━━━━━━━━━━┛',
            bullet: '┃ •',
            subbullet: '┃   ›',
        },
        
        // Rounded Style
        rounded: {
            top: '╭─────────────────────╮',
            body: '│',
            separator: '├─────────────────────┤',
            bottom: '╰─────────────────────╯',
            bullet: '│ ◆',
            subbullet: '│   ▸',
        },
        
        // Cyber Style
        cyber: {
            top: '╔═══════════════════════╗',
            body: '║',
            separator: '╠═══════════════════════╣',
            bottom: '╚═══════════════════════╝',
            bullet: '║ ▶',
            subbullet: '║   ›',
        },
        
        // Minimal Style
        minimal: {
            top: '┌───────────────────────┐',
            body: '│',
            separator: '├───────────────────────┤',
            bottom: '└───────────────────────┘',
            bullet: '│ •',
            subbullet: '│   -',
        },
    },

    // Headers
    headers: {
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
    },

    // Message Templates
    messages: {
        welcome: {
            title: '✨ *WELCOME TO THE GROUP* ✨',
            body: '┃ Hello @user!\n┃ \n┃ Welcome to *@group*\n┃ \n┃ Please read the group rules\n┃ and enjoy your stay! 🎉',
            footer: '┗━━━━━━━━━━━━━━━━━━━┛',
        },
        
        goodbye: {
            title: '👋 *GOODBYE* 👋',
            body: '┃ @user has left the group\n┃ \n┃ We hope to see you again! 💫',
            footer: '┗━━━━━━━━━━━━━━━━━━━┛',
        },
        
        promote: {
            title: '⚡ *PROMOTED* ⚡',
            body: '┃ Congratulations @user!\n┃ \n┃ You are now an admin! 👑',
            footer: '┗━━━━━━━━━━━━━━━━━━━┛',
        },
        
        demote: {
            title: '📍 *DEMOTED* 📍',
            body: '┃ @user is no longer an admin',
            footer: '┗━━━━━━━━━━━━━━━━━━━┛',
        },
    },

    // Command Prefixes (visual)
    prefixes: {
        command: '⚡',
        admin: '🔒',
        owner: '👑',
        premium: '💎',
        group: '👥',
        private: '💬',
    },

    // Loading Messages
    loading: [
        '⏳ Processing...',
        '⚙️ Working on it...',
        '🔄 Loading...',
        '⚡ Please wait...',
        '🚀 Initiating...',
        '✨ Preparing...',
    ],

    // Success Messages
    success: [
        '✅ Done!',
        '✨ Success!',
        '🎉 Complete!',
        '💫 Finished!',
        '🚀 Ready!',
    ],

    // Error Messages
    errors: {
        general: '❌ An error occurred',
        permission: '🔒 You don\'t have permission',
        notFound: '🔍 Not found',
        invalid: '⚠️ Invalid input',
        timeout: '⏰ Request timed out',
        network: '📡 Network error',
    },

    // Footer Templates
    footers: {
        default: '✨ Miara by MidknightMantra',
        timestamp: '🕐 {time} • ✨ Miara',
        powered: '⚡ Powered by Miara',
    },

    // Badge System
    badges: {
        owner: '👑',
        admin: '⚡',
        moderator: '🛡️',
        premium: '💎',
        verified: '✅',
        vip: '⭐',
        legend: '🏆',
        newbie: '🌱',
    },

    // Level System
    levels: {
        icons: ['🥚', '🐣', '🐥', '🦅', '🦉', '🦚', '🦜', '🦩', '🔥', '⭐'],
        ranks: [
            { name: 'Newbie', icon: '🌱', color: '#90EE90' },
            { name: 'Beginner', icon: '🌿', color: '#32CD32' },
            { name: 'Amateur', icon: '🍀', color: '#00FF00' },
            { name: 'Intermediate', icon: '⚡', color: '#FFD700' },
            { name: 'Advanced', icon: '🔥', color: '#FF6347' },
            { name: 'Expert', icon: '💎', color: '#00FFFF' },
            { name: 'Master', icon: '👑', color: '#FF00FF' },
            { name: 'Legend', icon: '⭐', color: '#FFD700' },
            { name: 'Mythic', icon: '🌟', color: '#FF69B4' },
            { name: 'Divine', icon: '✨', color: '#FFFFFF' },
        ],
    },

    // Separator Lines
    separators: {
        thin: '─────────────────────',
        thick: '━━━━━━━━━━━━━━━━━━━━━',
        dotted: '┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈',
        dashed: '╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌',
        wave: '～～～～～～～～～～～～～～～～～～～～～',
    },

    // Bullets
    bullets: {
        arrow: '➤',
        diamond: '◆',
        circle: '●',
        square: '■',
        star: '★',
        chevron: '›',
        point: '•',
    },
};

// Export default style
export const defaultBorderStyle = 'cyber';
export const defaultBorder = theme.borders[defaultBorderStyle];

export default theme;
