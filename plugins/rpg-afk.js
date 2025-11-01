const handler = async (m, {text}) => {
 const datas = global
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins.afk_afk

 const user = global.db.data.users[m.sender];
 user.afk = + new Date;
 user.afkReason = text;
 m.reply(`${translator.texto1[0]} ${conn.getName(m.sender)} ${translator.texto1[1]} ${text ? ': ' + text : ''}*
`);
};
handler.help = ['afk'];
handler.tags = ['xp'];
handler.command = ['afk']

export default handler;
