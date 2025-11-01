import moment from 'moment-timezone';
import fetch from 'node-fetch';


const handler = async (m, { conn, args, usedPrefix }) => {
   const datas = global
   const language = datas.db.data.users[m.sender].language || global.defaultLanguage
   const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
   const translator = _translate.plugins.info_repositorio

   const res = await fetch('https://api.github.com/repos/BrunoSobrino/TheMystic-Bot-MD');
   const json = await res.json();
   let txt = `${translator.texto1[0]}\n\n`;
   txt += `${translator.texto1[1]} ${json?.name || translator.texto1[2]}\n\n`;
   txt += `${translator.texto1[3]} ${json?.watchers_count || '-'}\n\n`;
   txt += `${translator.texto1[4]} ${(json?.size / 1024).toFixed(2) || '-'} MB\n\n`;
   txt += `${translator.texto1[5]} ${moment(json?.updated_at).format('DD/MM/YY - HH:mm:ss') || '-'}\n\n`;
   txt += `${translator.texto1[6]} ${json?.html_url || translator.texto1[7]}\n\n`;
   txt += `${json?.forks_count || '-'} ${translator.texto1[8]} ${json?.stargazers_count || '-'} ${translator.texto1[9]} ${json?.open_issues_count || '-'} ${translator.texto1[10]}`;
   txt += `${translator.texto1[11]}\n_${usedPrefix}gitclone ${json?.html_url || 'https://github.com/BrunoSobrino/TheMystic-Bot-MD'}_`;
   await conn.sendMessage(m.chat, { text: txt.trim(), mentions: [...txt.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'), contextInfo: { forwardingScore: 9999999, isForwarded: true, mentionedJid: [...txt.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net') } }, { quoted: m });
};
handler.command = ['script', 'repositorio', 'repo']
export default handler;
