import fs from 'fs'
import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const datas = global;
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`));
  const translator = _translate.plugins.descargas_play

  if (!text) throw `${translator.texto1[0]} ${usedPrefix + command} ${translator.texto1[1]}`;      
  let additionalText = '';
  if (['play'].includes(command)) {
    additionalText = 'audio';
  } else if (['play2'].includes(command)) {
    additionalText = 'vídeo';
  }

  const regex = "https://youtube.com/watch?v="
  const result = await search(args.join(' '))
  const body = `${translator.texto2[0]} ${result.title}\n${translator.texto2[1]} ${result.ago}\n${translator.texto2[2]} ${result.duration.timestamp}\n${translator.texto2[3]} ${formatNumber(result.views)}\n${translator.texto2[4]} ${result.author.name}\n${translator.texto2[5]} ${result.videoId}\n${translator.texto2[6]} ${result.type}\n${translator.texto2[7]} ${result.url}\n${translator.texto2[8]} ${result.author.url}\n\n${translator.texto2[9]} ${additionalText}, ${translator.texto2[10]}`.trim();
  conn.sendMessage(m.chat, { image: { url: result.thumbnail }, caption: body }, { quoted: m });

  if (command === 'play') {
    try {
      const audiodlp = await tools.downloader.ytmp3(regex + result.videoId);
      const downloader = audiodlp.download;
      conn.sendMessage(m.chat, { audio: { url: downloader }, mimetype: "audio/mpeg" }, { quoted: m });
    } catch (error) {
      console.log('❌ Error en tools.downloader.ytmp3, intentando Ruby-core fallback...', error);
      try {
        const ruby = await (
          await fetch(
            `https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(regex + result.videoId)}`
          )
        ).json();
        if (ruby?.status && ruby?.download?.url) {
          const audioLink = ruby.download.url;
          await conn.sendMessage(
            m.chat,
            { audio: { url: audioLink }, mimetype: "audio/mpeg" },
            { quoted: m }
          );
        } else {
          conn.reply(m.chat, translator.texto6, m);
        }
      } catch (err2) {
        console.log('❌ Falla en fallback Ruby-core mp3:', err2);
        conn.reply(m.chat, translator.texto6, m);
      }
    }
  }

  if (command === 'play2') {
    try {
      const videodlp = await tools.downloader.ytmp4(regex + result.videoId);
      const downloader = videodlp.download;
      conn.sendMessage(m.chat, { video: { url: downloader }, mimetype: "video/mp4" }, { quoted: m });
    } catch (error) {
      console.log('❌ Error en tools.downloader.ytmp4, intentando Ruby-core fallback...', error);
      try {
        const ruby = await (
          await fetch(
            `https://ruby-core.vercel.app/api/download/youtube/mp4?url=${encodeURIComponent(regex + result.videoId)}`
          )
        ).json();
        if (ruby?.status && ruby?.download?.url) {
          const videoLink = ruby.download.url;
          await conn.sendMessage(
            m.chat,
            { video: { url: videoLink }, mimetype: "video/mp4" },
            { quoted: m }
          );
        } else {
          conn.reply(m.chat, translator.texto6, m);
        }
      } catch (err2) {
        console.log('❌ Falla en fallback Ruby-core mp4:', err2);
        conn.reply(m.chat, translator.texto6, m);
      }
    }
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['downloader'];
//handler.command = ['play', 'play2'];

export default handler;

async function search(query, options = {}) {
  const searchRes = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
  return searchRes.videos[0];
}

function formatNumber(num) {
  return num.toLocaleString();
}
