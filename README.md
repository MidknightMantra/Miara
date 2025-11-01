# Miara WhatsApp Bot

A full-featured WhatsApp bot built with web scraping (no API required) using whatsapp-web.js.

## Features

### 🎨 Media Features
- **Sticker Creation**: Convert images/videos to stickers
- **Sticker to Image**: Convert stickers back to images
- **Media Download**: Download media from URLs

### 👥 Group Management
- **Group Info**: Display group information
- **Tag All**: Mention all group members
- **Add/Remove Members**: Add or kick members
- **Promote/Demote**: Manage admin privileges
- **Group Settings**: Change name, description
- **Auto Leave**: Bot can leave groups

### 📨 Messaging Features
- **Broadcast**: Send messages to all chats
- **Auto-Reply**: Automatic responses
- **Anti-Spam**: Rate limiting protection
- **Profile Pictures**: Get user profile pictures

### 🔒 Owner Commands
- **Block/Unblock**: Block or unblock users
- **Join Groups**: Join via invite link
- **Shutdown**: Stop the bot

## Installation

1. **Clone or download this repository**

2. **Install dependencies**
```bash
npm install
```

3. **Configure the bot**
Edit `config.js`:
```javascript
owner: '1234567890@c.us',  // Your WhatsApp number in this format
prefix: '!',                 // Command prefix
botName: 'Your Bot Name'
```

4. **Start the bot**
```bash
npm start
```

5. **Scan QR Code**
- A QR code will appear in terminal
- Open WhatsApp on your phone
- Go to Settings > Linked Devices
- Scan the QR code

## Commands

### General
- `!help` - Show all commands
- `!ping` - Check bot latency
- `!info` - Bot information

### Media
- `!sticker` - Convert image/video to sticker (reply to media)
- `!toimg` - Convert sticker to image (reply to sticker)
- `!download <url>` - Download media from URL

### Group (Admin Only)
- `!groupinfo` - Show group information
- `!tagall [text]` - Tag all members
- `!add <number>` - Add member to group
- `!kick @user` - Remove member from group
- `!promote @user` - Make member admin
- `!demote @user` - Remove admin privileges
- `!setdesc <text>` - Set group description
- `!setname <text>` - Set group name
- `!leave` - Bot leaves the group

### Utility
- `!getpic [@user]` - Get profile picture
- `!broadcast <text>` - Broadcast message (Owner only)
- `!block @user` - Block user (Owner only)
- `!unblock @user` - Unblock user (Owner only)

### Owner
- `!join <link>` - Join group via invite link
- `!shutdown` - Stop the bot

## Configuration

Edit `config.js` to customize:

```javascript
{
  prefix: '!',                    // Command prefix
  owner: '',                      // Owner number (format: 1234567890@c.us)
  botName: 'Miara Bot',          // Bot name
  
  autoReply: {
    enabled: true,                // Enable auto-reply
    message: 'Custom message'     // Auto-reply message
  },
  
  antiSpam: {
    enabled: true,                // Enable anti-spam
    maxMessages: 10,              // Max messages
    timeWindow: 60000             // Time window (ms)
  },
  
  groups: {
    antilink: false,              // Anti-link protection
    welcome: true,                // Welcome new members
    goodbye: true,                // Goodbye messages
    antibot: false                // Anti-bot protection
  },
  
  features: {
    stickers: true,               // Enable stickers
    mediaDownload: true,          // Enable media download
    groupManagement: true,        // Enable group management
    broadcast: true,              // Enable broadcast
    autoRead: false               // Auto-read messages
  }
}
```

## Requirements

- Node.js 14 or higher
- Google Chrome/Chromium (installed automatically with puppeteer)
- Stable internet connection

## Session Management

The bot stores session data in `./MiaraSession` folder. This keeps you logged in between restarts. To logout, simply delete this folder.

## Troubleshooting

**QR Code not appearing?**
- Make sure you have a stable internet connection
- Check if Chromium is properly installed
- Try running with: `node index.js`

**Bot not responding?**
- Check if the prefix is correct in config.js
- Make sure the command exists (use !help)
- Check console for errors

**Session expired?**
- Delete `MiaraSession` folder
- Restart the bot and scan QR code again

**Commands not working in groups?**
- Make sure bot is admin (for admin commands)
- Check group permissions

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

## Notes

- This bot uses web scraping via WhatsApp Web
- No official API required
- Keep your session secure
- Don't share your session folder
- Use responsibly and follow WhatsApp Terms of Service

## License

MIT License - feel free to modify and use for your needs!

## Support

For issues or questions, please check the console logs for detailed error messages.
