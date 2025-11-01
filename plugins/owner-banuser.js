

const handler = async (m, {conn, participants, usedPrefix, command}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.owner_banuser

  const BANtext = `${translator.texto1}\n*${usedPrefix + command} @${global.suittag}*`;
  if (!await await m.mentionedJid[0] && !m.quoted) return m.reply(BANtext, m.chat, {mentions: conn.parseMention(BANtext)});
  let who;
  if (m.isGroup) who = await await m.mentionedJid[0] ? await await m.mentionedJid[0] : await m?.quoted?.sender;
  else who = m.chat;
  const users = global.db.data.users;
  users[who].banned = true;
  m.reply(translator.texto2);
};
handler.command = /^banuser$/i;
handler.rowner = true;
export default handler;
