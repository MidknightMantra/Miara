

const handler = async (m, {command, usedPrefix, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.owner_delmsg

  const which = command.replace(/eliminar/i, '');
  if (!text) throw `${translator.texto1[0]} ${usedPrefix}list${which} ${translator.texto1[1]}`;
  const msgs = global.db.data.msgs;
  if (!text in msgs) throw `${translator.texto2[0]} '${text}' ${translator.texto2[1]}`;
  delete msgs[text];
  m.reply(`${ translator.texto3} '${text}'*`);
};
handler.help = ['vn', 'msg', 'video', 'audio', 'img', 'sticker'].map((v) => 'del' + v + ' <text>');
handler.tags = ['database'];
handler.command = /^eliminar(vn|msg|video|audio|img|sticker)$/;
handler.rowner = true;
export default handler;
