const handler = async (m, {conn, isOwner}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.gc_listwarn

  const adv = Object.entries(global.db.data.users).filter((user) => user[1].warn);
  const warns = global.db.data.users.warn;
  const user = global.db.data.users;
  const imagewarn = './src/assets/images/menu/main/warn.jpg';
  const caption = `${translator.texto1}\n 
*╔═══════════════════·•*
║ ${translator.texto2[0]} ${adv.length} ${translator.texto2[1]} ${adv ? '\n' + adv.map(([jid, user], i) => {
i++
return `
║
║ ${i}.- ${isOwner ? '@' + jid.split`@`[0] : jid} *(${user.warn}/3)*\n║\n║ - - - - - - - - -`.trim()}).join('\n') : ''}
*╚══════════════════·•*`;
  await conn.sendMessage(m.chat, {text: caption, mentions: await conn.parseMention(caption)}, {quoted: m});
};

handler.help = ['listwarn'];
handler.tags = ['group'];
handler.command = /^(listwarn)$/i;
handler.group = true;
handler.admin = true;
export default handler;
