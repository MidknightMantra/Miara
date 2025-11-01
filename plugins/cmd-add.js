

const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.cmd_add

  global.db.data.sticker = global.db.data.sticker || {};
  if (!m.quoted) throw `*${translator.texto1}*`;
  if (!m.quoted.fileSha256) throw `*${translator.texto2}*`;
  if (!text) throw `*${translator.texto3[0]}*\n*—◉ ${usedPrefix + command} ${translator.texto3[1]}*\n\n*${translator.texto3[2]}*\n*—◉ ${usedPrefix + command} <#menu> ${translator.texto3[3]}*`;
  const sticker = global.db.data.sticker;
  const hash = m.quoted.fileSha256.toString('base64');
  if (sticker[hash] && sticker[hash].locked) throw `*${translator.texto4}*`;
  sticker[hash] = {text, mentionedJid: await m.mentionedJid, creator: m.sender, at: + new Date, locked: false};
  m.reply(`*${translator.texto5}*`);
};
handler.command = ['setcmd', 'addcmd', 'cmdadd', 'cmdset'];
handler.rowner = true;
export default handler;
