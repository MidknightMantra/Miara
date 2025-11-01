/* Creado por https://github.com/FG98F */

const handler = async (m, {conn}) => {
 await conn.fetchBlocklist().then(async (data) => {
 const datas = global
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins.owner_blocklist

 let txt = `${translator.texto1} ${data.length}\n\n┌─⊷\n`;
 for (const i of data) {
   txt += `▢ @${i.split('@')[0]}\n`;
 }
   txt += '└───────────';
 return conn.reply(m.chat, txt, m, {mentions: await conn.parseMention(txt)});
 }).catch((err) => {
   console.log(err);
   throw translator.texto2;  
 });
};

handler.help = ['blocklist'];
handler.tags = ['owner'];
handler.command = ['blocklist', 'listblock'];
handler.rowner = true;

export default handler;
