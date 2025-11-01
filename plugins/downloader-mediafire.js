import axios from 'axios';
import cheerio from 'cheerio';
import { lookup } from 'mime-types';

const handler = async (m, {conn, args, usedPrefix, command}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.descargas_mediafire

  if (!args[0]) throw `_*< DESCARGAS - MEDIAFIRE />*_\n\n*[ ℹ️ ] Ingrese un enlace de MediaFire.*\n\n*[ 💡 ] Ejemplo:* ${usedPrefix + command} http://www.mediafire.com/file/7a28wroqlhtfws7/FgsiRestAPI_1754243494124_fgsi_1754243490723.jpeg`;
  
  try {
    const res = await mediafireDl(args[0]);
    const {name, size, date, mime, link} = res;
    const caption = `${translator.texto2[0]}\n\n${translator.texto2[1]} ${name}\n${translator.texto2[2]} ${size}\n${translator.texto2[3]} ${mime}\n\n${translator.texto2[4]}`.trim();
    await m.reply(caption);
    await conn.sendFile(m.chat, link, name, '', m, null, {mimetype: mime, asDocument: true});
  } catch (error) {
    console.error('Error en MediaFire:', error);
    await m.reply(translator.texto3);
  }
};

handler.command = /^(mediafire|mediafiredl|dlmediafire)$/i;
export default handler;

async function mediafireDl(url) {
  try {
    if (!url.includes('www.mediafire.com')) throw new Error('URL de MediaFire inválida');
    let res;
    let $;
    let link = null;
    try {
      res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }});
      $ = cheerio.load(res.data);
      const downloadButton = $('#downloadButton');
      link = downloadButton.attr('href');
      if (!link || link.includes('javascript:void(0)')) { 
        link = downloadButton.attr('data-href') || downloadButton.attr('data-url') || downloadButton.attr('data-link');
        const scrambledUrl = downloadButton.attr('data-scrambled-url');
        if (scrambledUrl) {
          try {
            link = atob(scrambledUrl);
          } catch (e) {
            console.log('Error decodificando scrambled URL:', e.message);
          }
        }
        if (!link || link.includes('javascript:void(0)')) {
          const htmlContent = res.data;
          const linkMatch = htmlContent.match(/href="(https:\/\/download\d+\.mediafire\.com[^"]+)"/);
          if (linkMatch) {
            link = linkMatch[1];
          } else {
            const altMatch = htmlContent.match(/"(https:\/\/[^"]*mediafire[^"]*\.(zip|rar|pdf|jpg|jpeg|png|gif|mp4|mp3|exe|apk|txt)[^"]*)"/i);
            if (altMatch) {
              link = altMatch[1];
            }
          }
        }
      }
    } catch (directError) {
      const translateUrl = `https://www-mediafire-com.translate.goog/${url.replace('https://www.mediafire.com/', '')}?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp`;
      res = await axios.get(translateUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }});
      $ = cheerio.load(res.data);
      const downloadButton = $('#downloadButton');
      link = downloadButton.attr('href');
      if (!link || link.includes('javascript:void(0)')) {
        const scrambledUrl = downloadButton.attr('data-scrambled-url');
        if (scrambledUrl) {
          try {
            link = atob(scrambledUrl);
          } catch (e) {}
        }
      }
    }
    if (!link || link.includes('javascript:void(0)')) throw new Error('No se pudo encontrar el enlace de descarga válido');
    const name = $('body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div').attr('title')?.replace(/\s+/g, '')?.replace(/\n/g, '') || $('.dl-btn-label').attr('title') || $('.filename').text().trim() || 'archivo_descargado';
    const date = $('body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span').text().trim() || $('.details li:nth-child(2) span').text().trim() || 'Fecha no disponible';
    const size = $('#downloadButton').text().replace('Download', '').replace(/[()]/g, '').replace(/\n/g, '').replace(/\s+/g, ' ').trim() || $('.details li:first-child span').text().trim() || 'Tamaño no disponible';
    let mime = '';
    const ext = name.split('.').pop()?.toLowerCase();
    mime = lookup(ext) || 'application/octet-stream';
    if (!link.startsWith('http')) throw new Error('Enlace de descarga inválido');
    return { name, size, date, mime, link };
  } catch (error) {
    console.error('Error en mediafireDl:', error.message);
    throw new Error(`Error al procesar MediaFire: ${error.message}`);
  }
}
