import { canLevelUp, xpRange } from '../src/libraries/levelling.js';
import { levelup } from '../src/libraries/canvas.js';


const handler = async (m, { conn }) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.rpg_levelup

  const name = conn.getName(m.sender);
  const usertag = '@' + m.sender.split('@s.whatsapp.net')[0];
  const user = global.db.data.users[m.sender];
  if (!canLevelUp(user.level, user.exp, global.multiplier)) {
    const { min, xp, max } = xpRange(user.level, global.multiplier);
    const message = `
${translator.texto1[0]}
${translator.texto1[1]} ${usertag}!*

${translator.texto1[2]} ${user.level}
${translator.texto1[3]} ${user.role}
${translator.texto1[4]} ${user.exp - min}/${xp}

${translator.texto1[5]} ${max - user.exp} ${translator.texto1[6]}`.trim();
    return conn.sendMessage(m.chat, {text: message, mentions: [m.sender]}, {quoted: m});
  }
  const before = user.level * 1;
  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;
  if (before !== user.level) {
    const levelUpMessage = `${translator.texto2[0]} ${name}! ${translator.texto2[1]} ${user.level}`;
    const levelUpDetails = `
${translator.texto3[0]}

${translator.texto3[1]}* ${before}
${translator.texto3[2]} ${user.level}
${translator.texto3[3]} ${user.role}

${translator.texto3[4]}`.trim();
    try {
      const levelUpImage = await levelup(levelUpMessage, user.level);
      conn.sendFile(m.chat, levelUpImage, 'levelup.jpg', levelUpDetails, m);
    } catch (e) {
      conn.sendMessage(m.chat, {text: levelUpDetails, mentions: [m.sender]}, {quoted: m});
    }
  }
};
handler.help = ['levelup'];
handler.tags = ['xp'];
handler.command = ['nivel', 'lvl', 'levelup', 'level'];
export default handler;
