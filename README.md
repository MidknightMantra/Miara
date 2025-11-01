<div align="center">

# 🌙 Miara - WhatsApp Bot

[![Version](https://img.shields.io/badge/version-1.7.4-blue.svg)](https://github.com/MidknightMantra/Miara)
[![License](https://img.shields.io/badge/license-Apache--2.0-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)
[![Maintained](https://img.shields.io/badge/maintained-yes-green.svg)](https://github.com/MidknightMantra/Miara/graphs/commit-activity)

<p align="center">
  <a href="https://github.com/MidknightMantra"><img title="Author" src="https://img.shields.io/badge/Author-MidknightMantra-purple.svg?style=for-the-badge&logo=github"></a>
</p>

<p align="center">
  <a href="https://github.com/MidknightMantra/followers"><img title="Followers" src="https://img.shields.io/github/followers/MidknightMantra?color=blue&style=flat-square"></a>
  <a href="https://github.com/MidknightMantra/Miara/stargazers/"><img title="Stars" src="https://img.shields.io/github/stars/MidknightMantra/Miara?color=blue&style=flat-square"></a>
  <a href="https://github.com/MidknightMantra/Miara/network/members"><img title="Forks" src="https://img.shields.io/github/forks/MidknightMantra/Miara?color=blue&style=flat-square"></a>
  <a href="https://github.com/MidknightMantra/Miara/"><img title="Size" src="https://img.shields.io/github/repo-size/MidknightMantra/Miara?style=flat-square&color=green"></a>
</p>

<p align="center">
  <a href="https://t.me/miaraBotInc" target="_blank">
    <img alt="telegram" src="https://img.shields.io/badge/Join_Group-25D366?style=for-the-badge&logo=telegram&logoColor=white" />
  </a>
  <a href="https://youtube.com/@MidknightMantra" target="_blank">
    <img alt="youtube" src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" />
  </a>
</p>

---

### 🎯 About Miara

Meet **Miara**, your all-in-one WhatsApp companion! A powerful multi-device WhatsApp bot built with Node.js and Baileys, designed to enhance your messaging experience with advanced features, automation, and endless possibilities. Express yourself with unique flair and bring excitement to every conversation! ✨🤖

### ✨ Key Features

- 🔄 **Multi-Device Support** - Works seamlessly across devices
- 🎨 **Customizable Themes** - Personalize your bot's appearance
- 🤖 **AI Integration** - ChatGPT, DALLE, and more AI features
- 📥 **Media Downloader** - Download from YouTube, Instagram, TikTok, etc.
- 🎮 **Fun Commands** - Games, stickers, memes, and entertainment
- 👥 **Group Management** - Advanced admin tools and moderation
- 🔒 **Security Features** - Antilink, welcome messages, auto-moderation
- 🌐 **Plugin System** - Easily extensible with custom plugins
- 📊 **Database Support** - MongoDB and PostgreSQL compatible

---

## 📋 Prerequisites

Before deploying Miara, ensure you have:

1. **Session ID** - Get it via [Pairing Code or QR Scan](https://miara-md-vtsf.onrender.com/)
2. **MongoDB URI** - Get free MongoDB from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | [Tutorial](https://youtu.be/4YEUtGlqkl4)
3. **Fork this repository** - Click the [`FORK`](https://github.com/MidknightMantra/Miara/fork) button above ⭐

---


 

 
## 🚀 Quick Deploy

<table>
<tr>
<td align="center">
<h3>☁️ Cloud Platforms</h3>
</td>
</tr>

<tr>
<td>

### Heroku
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=new)

### Koyeb
<a href='https://app.koyeb.com/auth/signin' target="_blank"><img alt='Deploy on Koyeb' src='https://img.shields.io/badge/Deploy-Koyeb-4285F4?style=for-the-badge&logo=koyeb&logoColor=white'/></a>

### Render
<a href='https://dashboard.render.com' target="_blank"><img alt='Deploy on Render' src='https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white'/></a>

### Railway
<a href='https://railway.app/new' target="_blank"><img alt='Deploy on Railway' src='https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white'/></a>

</td>
</tr>

<tr>
<td align="center">
<h3>💻 Developer Platforms</h3>
</td>
</tr>

<tr>
<td>

### Replit
<a href='https://repl.it/github/MidknightMantra/Miara' target="_blank"><img alt='Run on Replit' src='https://img.shields.io/badge/Run-Replit-F26207?style=for-the-badge&logo=replit&logoColor=white'/></a>

### GitHub Codespaces
<a href='https://github.com/codespaces/new' target="_blank"><img alt='Open in Codespaces' src='https://img.shields.io/badge/Open-Codespaces-181717?style=for-the-badge&logo=github&logoColor=white'/></a>

### Glitch
<a href='https://glitch.com/signup' target="_blank"><img alt='Remix on Glitch' src='https://img.shields.io/badge/Remix-Glitch-3333FF?style=for-the-badge&logo=glitch&logoColor=white'/></a>

</td>
</tr>
</table>

---


## 🖥️ Self-Hosting (VPS/PC)

### System Requirements
- Node.js v20.0.0 or higher
- Git
- FFmpeg
- ImageMagick
- 1GB RAM minimum (2GB recommended)

### Installation Steps 
   1. Install git ffmpeg curl 
      ``` 
       sudo apt -y update &&  sudo apt -y upgrade 
       sudo apt -y install git ffmpeg curl imagemagick
      ``` 
   2. Install nodejs  
      ```   
      sudo apt -y remove nodejs
      curl -fsSl https://deb.nodesource.com/setup_lts.x | sudo bash - && sudo apt -y install nodejs
      ```
  
   3. Install yarn
      ```
      curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - 
      echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
      sudo apt -y update && sudo apt -y install yarn
      ```  
  
   4. Install pm2
      ```
      sudo yarn global add pm2
      ```
  
   5. Clone repository and install dependencies
      ```bash
      git clone https://github.com/MidknightMantra/Miara
      cd Miara
      npm install
      ```

   6. Configure environment variables
      ```bash
      touch config.env
      nano config.env
      ```
      Add your configuration:
      ```env
      OWNER_NUMBER="your_number_with_country_code"
      SESSION_ID="your_session_id_here"
      MONGODB_URI="your_mongodb_uri"
      PREFIX="."
      MODE="public"
      THEME="MIARA"
      ```
      Press `Ctrl+S` to save, `Ctrl+X` to exit

   7. Run the bot
      ```bash
      # Start with Node.js
      npm start
      
      # Or start with PM2 (recommended for production)
      npm run pm2
      
      # View logs
      npm run logs
      
      # Stop bot
      npm stop
      ```

### TUTORIAL FOR TERMUX/UBUNTU
<a href="https://youtube.com/miaratechinfo"><img src="https://img.shields.io/badge/YouTube-ff0000?style=for-the-badge&logo=youtube&logoColor=ff000000&link=https://youtube.com/miaratechinfo" /><br>

---

## 📱 Termux/Ubuntu Deployment

> **Note:** Fork the repository first, then configure environment variables in `config.env` before proceeding.

### Setup Commands
```
apt update && apt -y upgrade
```
```
apt install proot-distro
```
```
proot-distro install ubuntu
```
```
proot-distro login ubuntu
```
```
apt-get update && apt-get -y full-upgrade
```
```
apt install -y sudo
```
```
sudo apt -y install git ffmpeg curl imagemagick webp
```
```
sudo apt -y remove nodejs
curl -fsSl https://deb.nodesource.com/setup_lts.x | sudo bash - && sudo apt -y install nodejs
```
```
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - 
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt -y update && sudo apt -y install yarn
```
```
sudo yarn global add pm2
```
### Clone and Run

```bash
# Clone your fork
git clone https://github.com/MidknightMantra/Miara
cd Miara

# Install dependencies
npm install

# Start the bot
npm start
```

---

## 📖 Documentation

- 🔧 [Configuration Guide](https://github.com/MidknightMantra/Miara/wiki/Configuration)
- 🎯 [Commands List](https://github.com/MidknightMantra/Miara/wiki/Commands)
- 🔌 [Plugin Development](https://github.com/MidknightMantra/Miara/wiki/Plugins)
- ❓ [FAQ](https://github.com/MidknightMantra/Miara/wiki/FAQ)

---

## 🤝 Contributing

We welcome contributions! Please feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- ⭐ Star the repository

---

## 📜 License

This project is licensed under the [Apache-2.0 License](LICENSE).

---

## ⚠️ Disclaimer

- **Miara** is not affiliated with WhatsApp Inc.
- Use this bot responsibly and at your own risk
- Misuse or spamming may result in your WhatsApp account being banned
- The developers are not responsible for any consequences of using this bot
- Follow WhatsApp's Terms of Service

---

<div align="center">

### 💖 Support the Project

If you find Miara useful, please consider:
- ⭐ Starring this repository
- 🔄 Sharing with others
- 💬 Joining our [Telegram Group](https://t.me/miaraBotInc)
- 📺 Subscribing to [YouTube Channel](https://youtube.com/@MidknightMantra)

---

**Made with ❤️ by [MidknightMantra](https://github.com/MidknightMantra)**

© 2024 Miara WhatsApp Bot. All rights reserved.

</div>



