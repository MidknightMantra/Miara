import {toAudio} from '../src/libraries/converter.js';

const handler = async (m, {conn, usedPrefix, command}) => {
 const datas = global
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins.convertidor_tomp3

 const q = m.quoted ? m.quoted : m;
 const mime = (q || q.msg).mimetype || q.mediaType || '';
 if (!/video|audio/.test(mime)) throw `*${translator.texto1}*`;
 const media = await q.download();
 if (!media) throw `*${translator.texto2}*`;
 const audio = await toAudio(media, 'mp4');
 if (!audio.data) throw `*${translator.texto3}*`;
 conn.sendMessage(m.chat, { audio: audio.data, mimetype: 'audio/mpeg' }, { quoted: m });
};

handler.help = ['tomp3'];
handler.tags = ['converter'];
handler.command = ['tomp3', 'toaudio'];

export default handler;
