const handler = async (m, {conn}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.fun_verdad

  global.verdad = translator.texto3;

  conn.reply(m.chat, `*┌────「 𝚅𝙴𝚁𝙳𝙰𝙳 」─*\n*“${pickRandom(global.verdad)}”*\n*└────「 𝙼𝚈𝚂𝚃𝙸𝙲 」─*`, m);
};
handler.help = ['verdad'];
handler.tags = ['game'];
handler.command = /^verdad/i;
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}


