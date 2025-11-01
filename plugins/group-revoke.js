/* Creditos a https://github.com/ALBERTO9883 */

const handler = async (m, {conn}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.gc_revoke

  const revoke = await conn.groupRevokeInvite(m.chat);
  await conn.reply(m.chat, `${translator.texto1} ${'https://chat.whatsapp.com/' + revoke}`, m);
};
handler.help = ['revoke'];
handler.tags = ['group'];
handler.command = ['resetlink', 'revoke'];
handler.botAdmin = true;
handler.admin = true;
handler.group = true;
export default handler;
