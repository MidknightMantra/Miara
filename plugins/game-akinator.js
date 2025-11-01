import fetch from 'node-fetch';
import translate from '@vitalets/google-translate-api';

const handler = async (m, {conn, usedPrefix, command, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.game_akinator

  if (m.isGroup) return;
  const aki = global.db.data.users[m.sender].akinator;
  if (text == 'end') {
    if (!aki.sesi) return m.reply(translator.texto1);
    aki.sesi = false;
    aki.soal = null;
    m.reply(translator.texto2);
  } else {
    if (aki.sesi) return conn.reply(m.chat, translator.texto3, aki.soal);
    try {
      const res = await fetch(`https://api.lolhuman.xyz/api/akinator/start?apikey=${lolkeysapi}`);
      const anu = await res.json();
      if (anu.status !== 200) throw translator.texto4;
      const {server, frontaddr, session, signature, question, progression, step} = anu.result;
      aki.sesi = true;
      aki.server = server;
      aki.frontaddr = frontaddr;
      aki.session = session;
      aki.signature = signature;
      aki.question = question;
      aki.progression = progression;
      aki.step = step;
      const resultes2 = await translate(question, {to: 'es', autoCorrect: false});
      let txt = `${translator.texto5[0]} @${m.sender.split('@')[0]}*\n${translator.texto5[1]} ${resultes2.text}*\n\n`;
      txt += translator.texto5[2] 
      txt += translator.texto5[3] 
      txt += translator.texto5[4]
      txt += translator.texto5[5] 
      txt += translator.texto5[6] 
      txt += `${translator.texto5[7]}  ${usedPrefix + command} ${translator.texto5[8]}`;
      const soal = await conn.sendMessage(m.chat, {text: txt, mentions: [m.sender]}, {quoted: m});
      aki.soal = soal;
    } catch {
      m.reply(translator.texto6);
    }
  }
};
handler.menu = ['akinator'];
handler.tags = ['game'];
handler.command = /^(akinator)$/i;
export default handler;
