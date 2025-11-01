

const handler = async (m, {command, usedPrefix, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.owner_addmsg

  const M = m.constructor;
  const which = command.replace(/agregar/i, '');
  if (!m.quoted) throw translator.texto1;
  if (!text) throw `${translator.texto2[0]} *${usedPrefix}list${which}* ${translator.texto2[1]}`;
  const msgs = global.db.data.msgs;
  if (text in msgs) throw `*[❗𝐈𝐍𝐅𝐎❗] '${text}' ${translator.texto3}`;
  msgs[text] = M.toObject(await m.getQuotedObj());
  m.reply(`${translator.texto4[0]} '${text}'${translator.texto4[1]} ${usedPrefix}ver${which} ${text}*`);
};
handler.help = ['vn', 'msg', 'video', 'audio', 'img', 'sticker'].map((v) => 'add' + v + ' <text>');
handler.tags = ['database'];
handler.command = /^agregar(vn|msg|video|audio|img|sticker)$/;
handler.rowner = true;
export default handler;
