const toM = (a) => '@' + a.split('@')[0];
function handler(m, {groupMetadata}) {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.fun_formarpareja

  const ps = groupMetadata.participants.map((v) => v.id);
  const a = ps.getRandom();
  let b;
  do b = ps.getRandom();
  while (b === a);
  m.reply(`*${toM(a)}, ${translator.texto1[0]} ${toM(b)}, ${translator.texto1[1]}`, null, {
    mentions: [a, b],
  });
}
handler.help = ['formarpareja'];
handler.tags = ['game'];
handler.command = ['formarpareja', 'formarparejas'];
handler.group = true;
export default handler;
