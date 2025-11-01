import {sticker} from "../src/libraries/sticker.js";
import fetch from "node-fetch";


const handler = async (m, { conn, args, usedPrefix, command }) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.sticker_slap

    let who;
    if (m.isGroup) {
      who = await await m.mentionedJid[0] ? await await m.mentionedJid[0] : m.quoted ? await m?.quoted?.sender : false;
    } else { 
      who = m.chat;
    }
      const textquien = `${translator.texto1}\n◉ ${usedPrefix + command} @${global.suittag}`;
    if (who === m.chat && m.isGroup || !who && m.isGroup) return m.reply(textquien, m.chat, {mentions: conn.parseMention(textquien)});
  try {
    let name;
    if (who === m.chat) {
      name = "𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝";
    } else {
      name = conn.getName(who);
    }
    let name2 = conn.getName(m.sender);
    let apislap = await fetch(`https://api.waifu.pics/sfw/slap`);
    let jkis = await apislap.json();
    let { url } = jkis;
    let stiker = await sticker(null, url, `${name2} le dio una bofetada a ${name}`, null);
    conn.sendFile(m.chat, stiker, null, {asSticker: true}, m, true, {contextInfo: {forwardingScore: 200, isForwarded: true}}, {quoted: m});
  } catch {
    throw translator.texto2;
  };
};
handler.help = ["slap <@tag>"];
handler.tags = ['sticker'];
handler.command = /^(slap|bofetada)$/i;
export default handler;
