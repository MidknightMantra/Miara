import axios from 'axios';
import fs from 'fs';

const handler = async (m, { conn, text }) => {
 const datas = global;
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage;
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`));
 const translator = _translate.plugins.downloader_tiktokstalk;

 if (!text) return conn.reply(m.chat, translator.texto1, m);  
 try {
 const response = await axios.get("https://delirius-apiofc.vercel.app/tools/tiktokstalk", {
  params: { q: text }
 });

 const data = response.data;
 if (data.status && data.result) {
 const user = data.result.users;
 const stats = data.result.stats;
 const body = `${translator.texto2[0]} ${user.username || '-'}\n${translator.texto2[1]} ${user.nickname || '-'}\n${translator.texto2[2]} ${stats.followerCount || '-'}\n${translator.texto2[3]} ${stats.followingCount || '-'}\n${translator.texto2[4]} ${stats.likeCount || '-'}\n${translator.texto2[5]} ${stats.videoCount || '-'}\n${translator.texto2[6]} ${user.signature || '-'}`.trim();
 const imageUrl = user.avatarLarger;
 const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
 const imageBuffer = Buffer.from(imageResponse.data, "binary");

 await conn.sendFile(m.chat, imageBuffer, 'profile.jpg', body, m);
 } else {
 throw translator.texto3; 
  }
 } catch (e) {
 throw translator.texto3;  
 }
};

handler.help = ['tiktokstalk'];
handler.tags = ['tools'];
handler.command = ['ttstalk', 'tiktokstalk'];

export default handler;
