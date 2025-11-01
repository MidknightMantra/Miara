import uploadImage from '../src/libraries/uploadImage.js';
import {sticker} from '../src/libraries/sticker.js';
import MessageType from "baileys";


const effects = ['greyscale', 'invert', 'brightness', 'threshold', 'sepia', 'red', 'green', 'blue', 'blurple', 'pixelate', 'blur'];

const handler = async (m, {conn, usedPrefix, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.sticker_stickerfilter

  const effect = text.trim().toLowerCase();
  if (!effects.includes(effect)) {
    throw `
${translator.texto1[0]}
${translator.texto1[1]} ${usedPrefix}stickerfilter ${translator.texto1[2]} 
${translator.texto1[3]}
${translator.texto1[4]} ${usedPrefix}stickerfilter greyscale
${translator.texto1[5]}
${effects.map((effect) => `_> ${effect}_`).join('\n')}
`.trim();
  }
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (!mime) throw translator.texto2;
  if (!/image\/(jpe?g|png)/.test(mime)) throw translator.texto3;
  const img = await q.download();
  const url = await uploadImage(img);
  const apiUrl = global.API('https://some-random-api.com/canvas/', encodeURIComponent(effect), {
    avatar: url,
  });
  try {
    const stiker = await sticker(null, apiUrl, global.packname, global.author);
    conn.sendFile(m.chat, stiker, null, {asSticker: true});
  } catch (e) {
    m.reply(translator.texto4);
    await conn.sendFile(m.chat, apiUrl, 'image.png', null, m);
  }
};
handler.help = ['stickfilter (caption|reply media)'];
handler.tags = ['sticker'];
handler.command = /^(stickerfilter|stikerfilter|cs2)$/i;
export default handler;
