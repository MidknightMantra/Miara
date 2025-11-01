import MessageType from "baileys";

const pajak = 0;
const handler = async (m, {conn, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.onwer_anadirXP

  let who;
  if (m.isGroup) who = await await m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw translator.texto1;
  const txt = text.replace('@' + who.split`@`[0], '').trim();
  if (!txt) throw translator.texto2;
  if (isNaN(txt)) throw translator.texto3;
  const xp = parseInt(txt);
  let exp = xp;
  const pjk = Math.ceil(xp * pajak);
  exp += pjk;
  if (exp < 1) throw translator.texto4;
  const users = global.db.data.users;
  users[who].exp += xp;
  m.reply(`≡ ${translator.texto5[0]}
┌──────────────
▢  ${translator.texto5[1]} ${xp}
└──────────────`);
};
handler.command = ['añadirxp', 'addexp'];
handler.rowner = true;
export default handler;
