/**
TheMystic-Bot-MD@BrunoSobrino - _antitrabas.js
By @NeKosmic || https://github.com/NeKosmic/
**/

 // Para configurar o language, na raiz do projeto altere o arquivo config.json
  // Para configurar el language, en la raíz del proyecto, modifique el archivo config.json.
  // To set the language, in the root of the project, modify the config.json file.

import * as fs from 'fs';

export async function before(m, { conn, isAdmin, isBotAdmin, usedPrefix }) {
  const datas = global
    const language = datas.db.data.users[m.sender].language || global.defaultLanguage
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
    const translator = _translate.plugins._antitrabas

  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) return !1;
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[this.user.jid] || {};
  const delet = m.key.participant;
  const bang = m.key.id;
  const name = await conn.getName(m.sender);
  const fakemek = { 'key': { 'participant': '0@s.whatsapp.net', 'remoteJid': '0@s.whatsapp.net' }, 'message': { 'groupInviteMessage': { 'groupJid': '51995386439-1616969743@g.us', 'inviteCode': 'm', 'groupName': 'P', 'caption': 'The Mystic - Bot', 'jpegThumbnail': null } } };
  if (chat.antiTraba && m.text.length > 5000) { // Cantidad máxima de caracteres aceptados en un mensaje.
    if (isAdmin) return conn.sendMessage(m.chat, { text: `${translator.texto1} @${m.sender.split('@')[0]} ${translator.texto1_1}`, mentions: [m.sender] }, { quoted: fakemek });
    conn.sendMessage(m.chat, `${translator.texto2}`, `${isBotAdmin ? '' : `${translator.texto2_1}`}`, m);
    // await conn.sendButton(m.chat, `*[ ! ] Se detecto un mensaje que contiene muchos caracteres [ ! ]*\n`, `${isBotAdmin ? '' : 'No soy administrador, no puedo hacer nada :/'}`, author, ['[ DESACTIVAR ANTI TRABAS ]', usedPrefix+'apagar antitraba'], fakemek )
    if (isBotAdmin && bot.restrict) {
      conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
      setTimeout(() => {
        conn.sendMessage(m.chat, { text: `${translator.texto3} \n${'\n'.repeat(400)}\n=> ${translator.texto3_1} wa.me/${m.sender.split('@')[0]}\n=> ${translator.texto3_2} ${name}\n${translator.texto3_3}`, mentions: [m.sender] }, { quoted: fakemek });
      }, 0);
      setTimeout(() => {
        conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      }, 1000);
    } else if (!bot.restrict) return m.reply(translator.texto4);
  }
  return !0;
}
