import fetch from 'node-fetch';

const handler = async (m, {conn, args, usedPrefix}) => {
 const datas = global
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins.random_kpop

 if (args.length == 0) return conn.reply(m.chat, `${translator.texto1[0]} ${usedPrefix}kpop\n${translator.texto1[1]} ${usedPrefix}kpop ${translator.texto1[2]} ${usedPrefix}kpop ${translator.texto1[3]}`, m);
 if (args[0] == 'blackpink' || args[0] == 'exo' || args[0] == 'bts') {
 fetch('https://raw.githubusercontent.com/ArugaZ/grabbed-results/main/random/kpop/' + args[0] + '.txt')
 .then((res) => res.text())
 .then((body) => {
 const randomkpop = body.split('\n');
 const randomkpopx = randomkpop[Math.floor(Math.random() * randomkpop.length)];
 conn.sendFile(m.chat, randomkpopx, '', 'Dasar Kpopers', m);
 }).catch(() => {
 conn.reply(m.chat, translator.texto2, m);
 });
 } else {
 conn.reply(m.chat, `${translator.texto3[0]} ${usedPrefix}kpop ${translator.texto3[1]}`, m);
 }
};

handler.help = ['kpop'];
handler.tags = ['random'];
handler.command = ['kpop'];

export default handler;
