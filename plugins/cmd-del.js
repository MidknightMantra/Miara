

const handler = async (m, {conn, usedPrefix, text, command}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.cmd_del


  let hash = text;
  if (m.quoted && m.quoted.fileSha256) hash = m.quoted.fileSha256.toString('hex');
  if (!hash) throw `*${translator.texto1} ${usedPrefix}listcmd*`;
  const sticker = global.db.data.sticker;
  if (sticker[hash] && sticker[hash].locked) throw `*${translator.texto2}*`;
  delete sticker[hash];
  m.reply(`*${translator.texto3}*`);
};
handler.command = ['delcmd'];
handler.rowner = true;
export default handler;
