import {webp2png} from '../src/libraries/webp2mp4.js';

const handler = async (m, {conn, usedPrefix, command}) => {
 const datas = global
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins.convertidor_toimg

 const notStickerMessage = `*${translator.texto1} ${usedPrefix + command}*`;
 if (!m.quoted) throw notStickerMessage;
 const q = m.quoted || m;
 const mime = q.mediaType || '';
 if (!/sticker/.test(mime)) throw notStickerMessage;
 const media = await q.download();
 const out = await webp2png(media).catch((_) => null) || Buffer.alloc(0);
 await conn.sendFile(m.chat, out, 'error.png', null, m);
};

handler.help = ['toimg'];
handler.tags = ['converter'];
handler.command = ['toimg', 'jpg', 'img'];

export default handler;
