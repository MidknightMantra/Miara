import {addExif} from '../src/libraries/sticker.js';

const handler = async (m, {conn, text}) => {
  const datas = global;
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`));
  const translator = _translate.plugins.sticker_wm;

  if (!m.quoted) throw translator.texto1;
  
  let stiker = false;
  try {
    let [packname, ...author] = text.split('|');
    author = (author || []).join('|');
    
    const isSticker = m.quoted.mtype === 'stickerMessage' || (m.quoted.mimetype && m.quoted.mimetype === 'image/webp') || m.quoted.mediaType === 'sticker' || (m.quoted.message && m.quoted.message.stickerMessage) || m.quoted.key?.remoteJid?.endsWith('@s.whatsapp.net');
    
    if (!isSticker) throw translator.texto2;
    if (!m.quoted.download) throw translator.texto3;
    const img = await m.quoted.download();
    if (!img) throw translator.texto3;
    if (!Buffer.isBuffer(img) || img.length === 0) throw translator.texto3;

    try {
      const categories = [''];
      const metadata = {
        packId: null, 
        androidAppStoreLink: null,
        iosAppStoreLink: null,
        isAiSticker: false,
        isFirstPartySticker: false,
        accessibilityText: null,
        templateId: null,
        isAvatarSticker: false,
        stickerMakerSourceType: null
      };
      
      stiker = await addExif(img, packname || global.packname || 'Bot', author || global.author || 'TheMystic', categories, metadata);
    } catch (exifError) {
      console.log('❌ Error en addExif:', exifError.message);
      stiker = img;
    }
    
  } catch (e) {
    console.error('Error en sticker-wm:', e);
    if (Buffer.isBuffer(e)) stiker = e;
  } finally {
    if (stiker) {
      conn.sendFile(m.chat, stiker, 'wm.webp', '', m, false, {asSticker: true});
    } else {
      throw translator.texto3;
    }
  }
};

handler.help = ['wm <packname>|<author>'];
handler.tags = ['sticker'];
handler.command = /^take|robar|wm$/i;
export default handler;
