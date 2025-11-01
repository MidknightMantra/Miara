import uploadImage from '../src/libraries/uploadImage.js';
import {sticker} from '../src/libraries/sticker.js';


const handler = async (m, {conn, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.sticker_scircle

  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    const img = await q.download();
    const url = await uploadImage(img);
    const scircle = global.API('dzx', '/api/canvas/circle', {url});
    const stiker = await sticker(null, scircle, global.packname, global.author);
    conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, {asSticker: true});
  } catch (e) {
    m.reply(translator.texto1);
  }
};
handler.help = ['scircle <img>'];
handler.tags = ['sticker'];
handler.command = /^scircle|circle$/i;
export default handler;
/* `https://api.dhamzxploit.my.id/api/canvas/circle?url=${url}` */
