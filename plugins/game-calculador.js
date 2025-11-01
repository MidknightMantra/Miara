const handler = async (m, { conn, command, text, usedPrefix }) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.fun_calculador

  if (!text) throw `${translator.texto26}`;
  const percentages = (500).getRandom();
  let emoji = '';
  let description = '';
  switch (command) {
    case 'gay2':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `${translator.texto1[0]} ${text.toUpperCase()} ${translator.texto1[1]} ${percentages}% Gay. ${emoji}*\n${translator.texto1[2]}`;
      } else if (percentages > 100) {
        description = `${translator.texto2[0]} ${text.toUpperCase()} ${translator.texto2[1]} ${percentages}% Gay. ${emoji}*\n${translator.texto2[2]}`;
      } else {
        description = `${translator.texto3[0]} ${text.toUpperCase()} ${translator.texto3[1]} ${percentages}% Gay. ${emoji}*\n${translator.texto3[2]}`;
      }
      break;
    case 'lesbiana':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `${translator.texto4[0]} ${text.toUpperCase()} ${translator.texto4[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto4[2]}`;
      } else if (percentages > 100) {
        description = `${translator.texto5[0]} ${text.toUpperCase()} ${translator.texto5[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto5[2]}`;
      } else {
        description = `${translator.texto6[0]} ${text.toUpperCase()} ${translator.texto6[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto6[2]}`;
      }
      break;
    case 'pajero':
    case 'pajera':
      emoji = '😏💦';
      if (percentages < 50) {
        description = `${translator.texto7[0]} ${text.toUpperCase()} ${translator.texto7[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto7[2]}`;
      } else if (percentages > 100) {
        description = `${translator.texto8[0]} ${text.toUpperCase()} ${translator.texto8[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto8[2]}`;
      } else {
        description = `${translator.texto9[0]} ${text.toUpperCase()} ${translator.texto9[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto9[2]}`;
      }
      break;
    case 'puto':
    case 'puta':
      emoji = '🔥🥵';
      if (percentages < 50) {
        description = `${translator.texto10[0]} ${text.toUpperCase()} ${translator.texto10[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto10[2]}`;
      } else if (percentages > 100) {
        description = `${translator.texto11[0]} ${text.toUpperCase()} ${translator.texto11[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto11[2]}`;
      } else {
        description = `${translator.texto12[0]} ${text.toUpperCase()} ${translator.texto12[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto12[2]}`;
      }
      break;
    case 'manco':
    case 'manca':
      emoji = '💩';
      if (percentages < 50) {
        description = `${translator.texto13[0]} ${text.toUpperCase()} ${translator.texto13[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto13[2]}`;
      } else if (percentages > 100) {
        description = `${translator.texto14[0]} ${text.toUpperCase()} ${translator.texto14[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto14[2]}`;
      } else {
        description = `${translator.texto15[0]} ${text.toUpperCase()} ${translator.texto15[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto15[2]}`;
      }
      break;
    case 'rata':
      emoji = '🐁';
      if (percentages < 50) {
        description = `${translator.texto16[0]} ${text.toUpperCase()} ${translator.texto16[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto16[2]}`;
      } else if (percentages > 100) {
        description = `${translator.texto17[0]} ${text.toUpperCase()} ${translator.texto17[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto17[2]}`;
      } else {
        description = `${translator.texto18[0]} ${text.toUpperCase()} ${translator.texto18[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto18[2]}`;
      }
      break;
    case 'prostituto':
    case 'prostituta':
      emoji = '🫦👅';
      if (percentages < 50) {
        description = `${translator.texto19[0]} ${text.toUpperCase()} ${translator.texto19[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto19[2]}`;
      } else if (percentages > 100) {
        description = `${translator.texto20[0]} ${text.toUpperCase()} ${translator.texto20[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto20[2]}`;
      } else {
        description = `${translator.texto21[0]} ${text.toUpperCase()} ${translator.texto21[1]} ${percentages}% ${command}. ${emoji}*\n${translator.texto21[2]}`;
      }
      break;
      default:
      throw `${translator.texto22}`;
  }
  const responses = translator.texto23;
  const response = responses[Math.floor(Math.random() * responses.length)];
  const cal = `━━━━⬣ ${translator.texto24} ⬣━━━━

—◉ ${description}

*"${response}"*

━━━━⬣ ${translator.texto24} ⬣━━━━`.trim()  
  async function loading() {
var hawemod = [
"《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
"《 ████▒▒▒▒▒▒▒▒》30%",
"《 ███████▒▒▒▒▒》50%",
"《 ██████████▒▒》80%",
"《 ████████████》100%"
]
   let { key } = await conn.sendMessage(m.chat, {text: `${translator.texto25}`, mentions: conn.parseMention(cal)}, {quoted: m})
 for (let i = 0; i < hawemod.length; i++) {
   await new Promise(resolve => setTimeout(resolve, 1000)); 
   await conn.sendMessage(m.chat, {text: hawemod[i], edit: key, mentions: conn.parseMention(cal)}, {quoted: m}); 
  }
  await conn.sendMessage(m.chat, {text: cal, edit: key, mentions: conn.parseMention(cal)}, {quoted: m});         
 }
loading()    
};
handler.help = ['gay2', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituta', 'prostituto'].map((v) => v + ' @tag | nombre');
handler.tags = ['game'];
handler.command = /^(gay2|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto)$/i;
export default handler;
