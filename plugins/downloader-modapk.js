import {search, download} from 'aptoide-scraper';
 
const handler = async (m, {conn, usedPrefix: prefix, command, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.downloader_modapk

 if (!text) throw `${translator.texto1}`;
  try {    
    const searchA = await search(text);
    const data5 = await download(searchA[0].id);
    let response = `${translator.texto2[0]} ${data5.name}\n${translator.texto2[1]}* ${data5.package}\n${translator.texto2[2]} ${data5.lastup}\n${translator.texto2[3]} ${data5.size}`
    await conn.sendMessage(m.chat, {image: {url: data5.icon}, caption: response}, {quoted: m});
 if (data5.size.includes('GB') || data5.size.replace(' MB', '') > 999) {
      return await conn.sendMessage(m.chat, {text: `${translator.texto3}`}, {quoted: m});

await conn.sendMessage(m.chat, {document: {url: data5.dllink}, mimetype: 'application/vnd.android.package-archive', fileName: data5.name + '.apk', caption: null}, {quoted: m});
   }
  } catch {
    throw `${translator.texto4}`;
  }}

handler.help = ['apk']
handler.tags = ['search']
handler.command = /^(apk|apkmod|modapk|dapk2|aptoide|aptoidedl)$/i

export default handler