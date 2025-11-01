// TheMystic-Bot-MD@BrunoSobrino - _antitoxic.js

const toxicRegex = /\b(puto|puta|rata|estupido|imbecil|rctmre|mrd|verga|vrga|maricon)\b/i;

export async function before(m, {isAdmin, isBotAdmin, isOwner}) {
 
const chat = global.db.data.chats[m.chat];
 
 if (!chat.antiToxic) {
  return !1;
 }

  const datas = global
    const language = datas.db.data.users[m.sender].language || global.defaultLanguage
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
    const translator = _translate.plugins._antitoxic

  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) {
    return !1;
  }
  const user = global.db.data.users[m.sender];
  const bot = global.db.data.settings[mconn.conn.user.jid] || {};
  const isToxic = toxicRegex.exec(m.text);

  if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
    user.warn += 1;
    if (!(user.warn >= 5)) await m.reply(`${translator.texto1}` + `${user.warn == 1 ? `@${m.sender.split`@`[0]}` : `@${m.sender.split`@`[0]}`}, ${translator.texto1_1}"${isToxic}" ${translator.texto1_2} ${user.warn}/5` + '*', false, {mentions: [m.sender]});
  }

  if (user.warn >= 5) {
    user.warn = 0;
    await m.reply(`${translator.texto2} @${m.sender.split('@')[0]}, ${translator.texto2_1}`, false, {mentions: [m.sender]});
    user.banned = true;
    await mconn.conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
    // await this.updateBlockStatus(m.sender, 'block')
  }
  return !1;
}
