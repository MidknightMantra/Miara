const handler = async (m, {conn, usedPrefix, command, args, isOwner, isAdmin, isROwner}) => {
const datas = global
const language = datas.db.data.users[m.sender].language || global.defaultLanguage
const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
const translator = _translate.plugins.config_funciones

const optionsFull = `_*${translator.texto1[0]}*_\n 

${translator.texto1[1]}  | WELCOME
${translator.texto1[2]} ${usedPrefix + command} welcome
${translator.texto1[3]}

--------------------------------

${translator.texto2[0]} | PUBLIC
${translator.texto2[1]}* ${usedPrefix + command} public
${translator.texto2[2]}
${translator.texto2[3]}

--------------------------------

${translator.texto3[0]} | MODOHORNY
${translator.texto3[1]} ${usedPrefix + command} modohorny
${translator.texto3[2]}

--------------------------------

${translator.texto4[0]} | ANTILINK
${translator.texto4[1]} ${usedPrefix + command} antilink
${translator.texto4[2]}
${translator.texto4[3]}

--------------------------------

${translator.texto5[0]} | ANTILINK 2
${translator.texto5[1]}  ${usedPrefix + command} antilink2
${translator.texto5[2]}
${translator.texto5[3]}

--------------------------------

${translator.texto6[0]} | DETECT
${translator.texto6[1]} ${usedPrefix + command} detect
${translator.texto6[2]}

--------------------------------

${translator.texto7[0]} | DETECT 2
${translator.texto7[1]} ${usedPrefix + command} detect2
${translator.texto7[2]}

--------------------------------

${translator.texto8[0]} RESTRICT
${translator.texto8[1]} ${usedPrefix + command} restrict
${translator.texto8[2]}
${translator.texto8[3]}
--------------------------------

${translator.texto9[0]} | AUTOREAD
${translator.texto9[1]} ${usedPrefix + command} autoread
${translator.texto9[2]}
${translator.texto9[3]}

--------------------------------

${translator.texto10[0]} | AUDIOS
${translator.texto10[1]} ${usedPrefix + command} audios
${translator.texto10[2]}

--------------------------------

${translator.texto11[0]} | AUTOSTICKER
${translator.texto11[1]} ${usedPrefix + command} autosticker 
${translator.texto11[2]}

--------------------------------

${translator.texto12[0]} | PCONLY
${translator.texto12[1]} ${usedPrefix + command} pconly
${translator.texto12[2]}
${translator.texto12[3]}

--------------------------------

${translator.texto13[0]} | GCONLY
${translator.texto13[1]} ${usedPrefix + command} gconly
${translator.texto13[2]} 
${translator.texto13[3]}

--------------------------------

${translator.texto14[0]} | ANTIVIEWONCE 
${translator.texto14[1]} ${usedPrefix + command} antiviewonce
${translator.texto14[2]}

--------------------------------

${translator.texto15[0]} | ANTILLAMADAS
${translator.texto15[1]} ${usedPrefix + command} anticall
${translator.texto15[2]} 
${translator.texto15[3]}

--------------------------------

${translator.texto16[0]} | ANTITOXIC
${translator.texto16[1]} ${usedPrefix + command} antitoxic
${translator.texto16[2]}
${translator.texto16[3]}

--------------------------------

${translator.texto17[0]} | ANTITRABAS
${translator.texto17[1]}  ${usedPrefix + command} antitraba
${translator.texto17[2]} 
${translator.texto17[3]} 

--------------------------------

${translator.texto18[0]} | ANTIARABES
${translator.texto18[1]} ${usedPrefix + command} antiarabes
${translator.texto18[2]}
${translator.texto18[3]}

--------------------------------

${translator.texto19[0]} | ANTIARABES 2
${translator.texto19[1]}  ${usedPrefix + command} antiarabes2
${translator.texto19[2]} 
${translator.texto19[3]} 

--------------------------------

${translator.texto20[0]} | MODOADMIN
${translator.texto20[1]} ${usedPrefix + command} modoadmin
${translator.texto20[2]}

--------------------------------

${translator.texto21[0]} | SIMSIMI
${translator.texto21[1]} ${usedPrefix + command} simsimi
${translator.texto21[2]}

--------------------------------

${translator.texto22[0]} | ANTIDELETE
${translator.texto22[1]} ${usedPrefix + command} antidelete
${translator.texto22[2]}

--------------------------------

${translator.texto23[0]} | AUDIOS_BOT
${translator.texto23[1]} ${usedPrefix + command} audios_bot
${translator.texto23[2]}
${translator.texto23[3]}

--------------------------------

${translator.texto24[0]} | ANTISPAM
${translator.texto24[1]} ${usedPrefix + command} antispam
${translator.texto24[2]}
${translator.texto24[3]}

--------------------------------

${translator.texto25[0]} | MODEJADIBOT
${translator.texto25[1]} ${usedPrefix + command} modejadibot
${translator.texto25[2]} (${usedPrefix}serbot / ${usedPrefix}jadibot). 
${translator.texto25[3]}

--------------------------------

${translator.texto26[0]} | ANTIPRIVADO
${translator.texto26[1]} ${usedPrefix + command} antiprivado
${translator.texto26[2]}
${translator.texto26[3]}`.trim();

  const isEnable = /true|enable|(turn)?on|1/i.test(command);
  const chat = global.db.data.chats[m.chat];
  const user = global.db.data.users[m.sender];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const type = (args[0] || '').toLowerCase();
  let isAll = false; const isUser = false;
  switch (type) {
    case 'welcome':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!(isAdmin || isOwner || isROwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.welcome = isEnable;
      break;
    case 'detect':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.detect = isEnable;
      break;
    case 'detect2':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.detect2 = isEnable;
      break;
    case 'simsimi':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.simi = isEnable;
      break;
    case 'antiporno':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiporno = isEnable;
      break;
    case 'delete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.delete = isEnable;
      break;
    case 'antidelete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antidelete = isEnable;
      break;
    case 'public':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['self'] = !isEnable;
      break;
    case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiLink = isEnable;
      break;
    case 'antilink2':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiLink2 = isEnable;
      break;
    case 'antiviewonce':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiviewonce = isEnable;
      break;
    case 'modohorny':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modohorny = isEnable;
      break;
    case 'modoadmin':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modoadmin = isEnable;
      break;
    case 'autosticker':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.autosticker = isEnable;
      break;
    case 'audios':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.audios = isEnable;
      break;
    case 'restrict':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.restrict = isEnable;
      break;
    case 'audios_bot':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.audios_bot = isEnable;      
      break;      
    case 'nyimak':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['nyimak'] = isEnable;
      break;
    case 'autoread':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.autoread2 = isEnable;
      //global.opts['autoread'] = isEnable;
      break;
    case 'pconly':
    case 'privateonly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['pconly'] = isEnable;
      break;
    case 'gconly':
    case 'grouponly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['gconly'] = isEnable;
      break;
    case 'swonly':
    case 'statusonly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['swonly'] = isEnable;
      break;
    case 'anticall':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antiCall = isEnable;
      break;
    case 'antiprivado':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antiPrivate = isEnable;
      break;
    case 'modejadibot':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.modejadibot = isEnable;
      break;
    case 'antispam':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antispam = isEnable;
      break;
    case 'antitoxic':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiToxic = isEnable;
      break;
      case 'game': case 'juegos': case 'fun': case 'ruleta':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.game = isEnable          
break;
    case 'antitraba':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiTraba = isEnable;
      break;
    case 'antiarabes':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn); 
          throw false;
        }
      }
      chat.antiArab = isEnable;
      break;
    case 'antiarabes2':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiArab2 = isEnable;
      break;
    default:
      if (!/[01]/.test(command)) return await conn.sendMessage(m.chat, {text: optionsFull}, {quoted: m});
      throw false;
  }
  conn.sendMessage(m.chat, {text: `_*${translator.texto27[0]}*_\n\n*${translator.texto27[1]}* _${type}_ *fue* ${isEnable ? '_activada_' : '_desactivada_'} *${translator.texto27[2]}* ${isAll ? '_bot._' : isUser ? '' : '_chat._'}`}, {quoted: m});
};
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?[01])$/i;
export default handler;
