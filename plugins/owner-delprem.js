

const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.owner_delprem

  let who;
  if (m.isGroup) who = await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.quoted ? await m?.quoted?.sender : false;
  else who = m.chat;
  const user = global.db.data.users[who];
  if (!who) throw translator.texto1;
  if (!user) throw translator.texto2;
  if (user.premiumTime = 0) throw translator.texto3;
  const txt = text.replace('@' + who.split`@`[0], '').trim();

  user.premiumTime = 0;

  user.premium = false;

  const textdelprem = `*[❗] @${who.split`@`[0]} ${translator.texto4}`;
  m.reply(textdelprem, null, {mentions: conn.parseMention(textdelprem)});
};
handler.help = ['delprem <@user>'];
handler.tags = ['owner'];
handler.command = /^(remove|-|del)prem$/i;
handler.group = true;
handler.rowner = true;
export default handler;
