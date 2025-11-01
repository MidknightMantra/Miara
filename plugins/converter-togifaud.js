/* Desarrollado y Creado por: https://github.com/BrunoSobrino */

const handler = async (m, {conn, usedPrefix, command}) => {
 const datas = global
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins.convertidor_togifaud

 if (!m.quoted) throw `*${translator.texto1}*`;
 const q = m.quoted || m;
 const mime = (q.msg || q).mimetype || '';
 if (!/(mp4)/.test(mime)) throw `*${translator.texto2[0]} ${mime} ${translator.texto2[1]}*`;
 m.reply(global.wait);
 const media = await q.download();
 conn.sendMessage(m.chat, {video: media, gifPlayback: true, caption: `*${translator.texto3}*`}, {quoted: m});
};

handler.help = ['togifaud'];
handler.tags = ['converter'];
handler.command = ['togifaud'];

export default handler;
