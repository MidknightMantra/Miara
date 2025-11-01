import MessageType from "baileys";

const pajak = 0;
const handler = async (m, {conn, text}) => {

  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.onwer_anadirlimit

  let who;
  if (m.isGroup) who = await await m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw translator.texto1;
  const txt = text.replace('@' + who.split`@`[0], '').trim();
  if (!txt) throw translator.texto2;
  if (isNaN(txt)) throw translator.texto3;
  const dmt = parseInt(txt);
  let limit = dmt;
  const pjk = Math.ceil(dmt * pajak);
  limit += pjk;
  if (limit < 1) throw translator.texto4;
  const users = global.db.data.users;
  users[who].limit += dmt;
  m.reply(`≡ ${translator.texto5[0]}
┌──────────────
▢ ${translator.texto5[1]} ${dmt}
└──────────────`);
};
handler.command = ['añadirdiamantes', 'addd', 'dard', 'dardiamantes'];
handler.rowner = true;
export default handler;
