import gplay from "google-play-scraper";

let handler = async (m, { conn, text }) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.buscador_playstore
  
  if (!text) throw `*${translator.texto1}*`;
  let res = await gplay.search({ term: text });
  if (!res.length) throw `*${translator.texto2}*`;
  let opt = {
    contextInfo: {
      externalAdReply: {
        title: res[0].title,
        body: res[0].summary,
        thumbnail: (await conn.getFile(res[0].icon)).data,
        sourceUrl: res[0].url,
      },
    },
  };
  await console.log(res);
  res = res.map(
    (v) =>
      `${translator.texto3[0]} ${v.title}
      ${translator.texto3[1]} ${v.developer}
      ${translator.texto3[2]} ${v.priceText}
      ${translator.texto3[3]} ${v.scoreText}
      ${translator.texto3[4]}${v.url}`
  ).join`\n\n`;
  m.reply(res, null, opt);
};
handler.help = ['playstore <aplicacion>'];
handler.tags = ['internet'];
handler.command = /^(playstore)$/i;
export default handler;
