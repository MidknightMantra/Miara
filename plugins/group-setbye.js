const handler = async (m, {conn, text, isROwner, isOwner}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.gc_setbye

  if (text) {
    global.db.data.chats[m.chat].sBye = text;
    m.reply(translator.texto1);
  } else throw `${translator.texto2}\n*- @user ${translator.texto3}`;
};
handler.help = ['setbye <text>'];
handler.tags = ['group'];
handler.command = ['setbye'];
handler.admin = true;
export default handler;
