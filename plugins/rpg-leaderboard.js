const handler = async (m, { conn, args, participants }) => {
 const language = global.db.data.users[m.sender]?.language || global.defaultLanguage;
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`));
 const translator = _translate.plugins.rpg_leaderboard;

 const users = Object.entries(global.db.data.users)
   .map(([key, value]) => ({
     ...value,
     jid: key,
     exp: Number(value.exp) || 0,
     limit: Number(value.limit) || 0,
     level: Number(value.level) || 0
   }))
   .filter(user =>
     user.jid &&
     user.jid.endsWith("@s.whatsapp.net")
   );

 const sortedExp = [...users].sort((a, b) => b.exp - a.exp); // Usar copia para no mutar 'users'
 const sortedLim = [...users].sort((a, b) => b.limit - a.limit);
 const sortedLevel = [...users].sort((a, b) => b.level - a.level);

 const len = Math.min(args[0] && !isNaN(args[0]) ? Math.max(parseInt(args[0]), 10) : 10, 100);

 const adventurePhrases = translator.texto1;
 const randomPhrase = adventurePhrases[Math.floor(Math.random() * adventurePhrases.length)];

 const getText = (list, prop, unit) =>
   list.slice(0, len)
     .map(({ jid, [prop]: val }, i) => {
      const phoneNumber = jid?.split('@')[0] || 'Desconocido';
      return `□ ${i + 1}. @${phoneNumber}\n□ wa.me/${phoneNumber}\n□ *${val} ${unit}`;
     })
     .join('\n\n');

 const body = `${translator.texto2[0]}\n□ ⚔️ ${randomPhrase} ⚔️\n\n` +
   `${translator.texto2[1]} ${len} ${translator.texto2[7]}\n` +
   `${translator.texto2[2]} ${sortedExp.findIndex(u => u.jid === m.sender) + 1} ${translator.texto2[3]} ${users.length}\n\n` +
   `${getText(sortedExp, 'exp', translator.texto2[4])}\n\n` +

   `${translator.texto2[1]} ${len} ${translator.texto2[8]}\n` +
   `${translator.texto2[2]} ${sortedLim.findIndex(u => u.jid === m.sender) + 1} ${translator.texto2[3]} ${users.length}\n\n` +
   `${getText(sortedLim, 'limit', translator.texto2[5])}\n\n` +

   `${translator.texto2[1]} ${len} ${translator.texto2[9]}\n` +
   `${translator.texto2[2]} ${sortedLevel.findIndex(u => u.jid === m.sender) + 1} ${translator.texto2[3]} ${users.length}\n\n` +
   `${getText(sortedLevel, 'level', translator.texto2[6])}`.trim();

 await conn.sendMessage(m.chat, { text: body, mentions: conn.parseMention(body) }, { quoted: m });
};

handler.help = ['leaderboard'];
handler.tags = ['xp'];
handler.command = ['leaderboard', 'lb'];

export default handler;