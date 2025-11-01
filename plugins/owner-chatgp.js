/* ---------------------------------------------------------------------------------------
  🍀 • By https://github.com/ALBERTO9883
  🍀 • ⚘Alberto Y Ashly⚘
-----------------------------------------------------------------------------------------*/

import {randomBytes} from 'crypto';


const link = /chat.whatsapp.com/;
const handler = async (m, {conn, text, groupMetadata}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.owner_chatgp

  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) return !1;
  if (!text) throw translator.texto1;
  const linkThisGroup = `${link}`;
  if (m.text.includes(linkThisGroup)) return conn.reply(m.chat, translator.texto2, m);
  const time = global.db.data.users[m.sender].msgwait + 300000;
  if (new Date - db.data.users[m.sender].msgwait < 300000) throw `${translator.texto3[0]} ${msToTime(time - new Date())} ${translator.texto3[1]}`;
  const who = await m.mentionedJid && await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  const name = await conn.getName(m.sender);
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce).map((v) => v[0]);
  const fakegif = {key: {participant: `0@s.whatsapp.net`, ...('6289643739077-1613049930@g.us' ? {remoteJid: '6289643739077-1613049930@g.us'} : {})}, message: {'videoMessage': {'title': '🐱⸽⃕NʏᴀɴCᴀᴛBᴏᴛ - MD🍁⃨፝⃕✰', 'h': `Hmm`, 'seconds': '99999', 'gifPlayback': 'true', 'caption': '🧿 𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝 🔮', 'jpegThumbnail': false}}};
  const teks = `${translator.texto4[0]} ${groupMetadata.subject}\n${translator.texto4[1]}${name}\n*${translator.texto4[2]} wa.me/${who.split`@`[0]}\n*${translator.texto4[3]} ${text}`;
  for (const id of groups) {
    await conn.sendMessage(id, {text: teks}, {quoted: fakegif});
    global.db.data.users[m.sender].msgwait = new Date * 1;
  }
};
handler.command = /^(msg)$/i;
handler.owner = true;
handler.group = true;
export default handler;
function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;
  return minutes + ' m ' + seconds + ' s ';
}
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);
const randomID = (length) => randomBytes(Math.ceil(length * .5)).toString('hex').slice(0, length);
