import translate from '@vitalets/google-translate-api';
import {Anime} from '@shineiichijo/marika';


const client = new Anime();
const handler = async (m, {conn, text, usedPrefix}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.buscador_animeinfo

  if (!text) return m.reply(`*${translator.texto1}*`);
  try {
    const anime = await client.searchAnime(text);
    const result = anime.data[0];
    const resultes = await translate(`${result.background}`, {to: 'es', autoCorrect: true});
    const resultes2 = await translate(`${result.synopsis}`, {to: 'es', autoCorrect: true});
    const AnimeInfo = `
${translator.texto2[0]} ${result.title}
${translator.texto2[1]}* ${result.type}
${translator.texto2[2]} ${result.status.toUpperCase().replace(/\_/g, ' ')}
${translator.texto2[3]} ${result.episodes}
${translator.texto2[4]} ${result.duration}*
${translator.texto2[5]} ${result.source.toUpperCase()}
${translator.texto2[6]} ${result.aired.from}
${translator.texto2[7]} ${result.aired.to}
${translator.texto2[8]} ${result.popularity}
${translator.texto2[9]} ${result.favorites}
${translator.texto2[10]} ${result.rating}
${translator.texto2[11]} ${result.rank}
${translator.texto2[12]} ${result.trailer.url}
${translator.texto2[13]} ${result.url}
${translator.texto2[14]} ${resultes.text}
${translator.texto2[15]} ${resultes2.text}`;
    conn.sendFile(m.chat, result.images.jpg.image_url, 'error.jpg', AnimeInfo, m);
  } catch {
    throw `${translator.texto3}`;
  }
};
handler.command = /^(anime|animeinfo)$/i;
export default handler;
