const timeout = 60000;
const poin = 500;
const poin_lose = -100;
const poin_bot = 200;


const handler = async (m, { conn, usedPrefix, text }) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.game_suitpvp

  conn.suit = conn.suit ? conn.suit : {};
  if (Object.values(conn.suit).find((room) => room.id.startsWith('suit') && [room.p, room.p2].includes(m.sender))) throw translator.texto1;
  const textquien = `${translator.texto2}\n${usedPrefix}suit @${global.suittag}`;
  const testi = await m.mentionedJid[0]
  if (!testi) return m.reply(textquien, m.chat, { mentions: conn.parseMention(textquien) });
  if (Object.values(conn.suit).find((room) => room.id.startsWith('suit') && [room.p, room.p2].includes(testi))) throw translator.texto4;
  const id = 'suit_' + new Date() * 1;
  const caption = `${translator.texto3[0]} @${m.sender.split`@`[0]} ${translator.texto3[1]} @${testi.split`@`[0]} ${translator.texto3[1]}`;
  const imgplaygame = `https://www.merca2.es/wp-content/uploads/2020/05/Piedra-papel-o-tijera-0003318_1584-825x259.jpeg`;
  conn.suit[id] = {
    chat: await conn.sendMessage(m.chat, { text: caption }, { mentions: await conn.parseMention(caption) }),
    id: id,
    p: m.sender,
    p2: testi,
    status: 'wait',
    waktu: setTimeout(() => {
      if (conn.suit[id]) conn.reply(m.chat, translator.texto5, m);

      delete conn.suit[id];
    }, timeout), poin, poin_lose, poin_bot, timeout,
  };
};
handler.command = /^pvp|suit(pvp)?$/i;
handler.group = true;
handler.game = true;
export default handler;
