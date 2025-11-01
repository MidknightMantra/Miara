// TheMystic-Bot-MD@BrunoSobrino - _antiarab.js


const handler = (m) => m;
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  const datas = global
  let language = datas.db.data.users[m.sender].language 
  // todo: sometimes this trows undefined.json ill fix
  if (language === undefined || language === null) {
    language = 'es'
  }
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))

  const translator = _translate.plugins._antiarab
  // Para configurar o language, na raiz do projeto altere o arquivo config.json
  // Para configurar el language, en la raíz del proyecto, modifique el archivo config.json.
  // To set the language, in the root of the project, modify the config.json file.

  /* if (m.message) {
    console.log(m.message)
  }*/
  if (!m.isGroup) return !1;
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[conn.user.jid] || {};
  if (isBotAdmin && chat.antiArab2 && !isAdmin && !isOwner && !isROwner && bot.restrict) {
    if (m.sender.startsWith('212' || '212')) {
      m.reply(translator.texto1);
      const responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      if (responseb[0].status === '404') return;
    }

    if (m.sender.startsWith('265' || '265')) {
      m.reply(translator.texto2);
      const responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      if (responseb[0].status === '404') return;
    }

    if (m.sender.startsWith('92' || '92')) {
      m.reply(translator.texto3);
      const responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      if (responseb[0].status === '404') return;
    }

    if (m.sender.startsWith('234' || '234')) {
      m.reply(translator.texto3);
      const responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      if (responseb[0].status === '404') return;
    }                                                       
  }
};
export default handler;
