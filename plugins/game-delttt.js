import MessageType from "baileys";

const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.game_delttt

  const room = Object.values(conn.game).find((room) => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender));
  if (room == undefined) return conn.sendButton(m.chat, translator.texto1, wm, null, [[translator.texto2, `${usedPrefix}ttt ${translator.texto3}`]], m);
  delete conn.game[room.id];
  await m.reply(translator.texto4);
};
handler.command = /^(delttt|deltt|delxo|deltictactoe)$/i;
handler.fail = null;
export default handler;
