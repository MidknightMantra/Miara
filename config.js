module.exports = {
  prefix: '!',
  owner: '',
  botName: 'Miara Bot',
  sessionName: 'miara-session',
  
  autoReply: {
    enabled: true,
    message: 'Sorry, I am currently unavailable. I will get back to you soon!'
  },
  
  antiSpam: {
    enabled: true,
    maxMessages: 10,
    timeWindow: 60000
  },
  
  groups: {
    antilink: false,
    welcome: true,
    goodbye: true,
    antibot: false
  },
  
  features: {
    stickers: true,
    mediaDownload: true,
    groupManagement: true,
    broadcast: true,
    autoRead: false
  }
};
