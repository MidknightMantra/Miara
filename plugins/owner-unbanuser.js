


const handler = async (m, {conn, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.owner_unbanuser

  if (!text) throw translator.texto1;
  let who;
  if (m.isGroup) who = await await m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw translator.texto2;
  const users = global.db.data.users;
  users[who].banned = false;
  conn.reply(m.chat, translator.texto3, m);
};
handler.help = ['unbanuser'];
handler.tags = ['owner'];
handler.command = /^unbanuser$/i;
handler.rowner = true;
export default handler;
