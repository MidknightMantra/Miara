

const handler = async (m, {usedPrefix}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.rpg_balance

  let who;
  if (m.isGroup) who = await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.sender;
  else who = m.sender;
  const name = conn.getName(who);
  m.reply(`
${translator.texto1[0]}
${translator.texto1[1]} ${name}
${translator.texto1[2]} ${global.db.data.users[who].limit}💎
${translator.texto1[3]}
${translator.texto1[4]} 
${translator.texto1[5]}
❏ *${usedPrefix}buy ${translator.texto1[6]}
❏ *${usedPrefix}buyall*`);
};
handler.help = ['bal'];
handler.tags = ['xp'];
handler.command = ['bal', 'diamantes', 'diamond', 'balance'];
export default handler;
