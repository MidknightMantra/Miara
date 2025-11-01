

const handler = async (m, { conn, isROwner, text }) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.owner_restart

  if (!process.send) throw translator.texto1;
  // conn.readMessages([m.key])
  await m.reply(translator.texto2);
  process.send('reset');
};
handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = ['restart', 'reiniciar'];
handler.rowner = true;
export default handler;
