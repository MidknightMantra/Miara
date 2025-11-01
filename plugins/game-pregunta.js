const handler = async (m, { command, text }) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.fun_pregunta

  m.reply(`
${translator.texto1[0]}
  
${translator.texto1[1]} ${text}
${translator.texto1[2]} ${[translator.texto1[3], translator.texto1[4], translator.texto1[5], translator.texto1[6], translator.texto1[7], translator.texto1[8]].getRandom()}
`.trim(), null, await m.mentionedJid ? {
    mentions: await m.mentionedJid,
  } : {});

}
handler.help = ['pregunta <texto>?'];
handler.tags = ['game'];
handler.command = /^pregunta|preguntas|apakah$/i;
export default handler;
