const handler = async (m, {conn, args, text, command, usedPrefix}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.gc_warn

  const testi = await m?.mentionedJid
  if (testi.includes(conn.user.jid)) return;
  const pp = './src/assets/images/menu/main/warn.jpg';
  if (m.mentionedJid.length === 0 && args.length > 0) m.mentionedJid = conn.parseMention(text)
  let who;
  if (m.isGroup) {
    who = conn.parseMention(text).length > 0 ?
      conn.parseMention(text)[0] :
      m.quoted ?
      await m?.quoted?.sender :
      text;
  } else who = m.chat;
  const user = global.db.data.users[who];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const dReason = 'Sin motivo';
  const msgtext = text || dReason;
  const sdms = msgtext.replace(/@\d+-?\d* /g, '');
  const warntext = `${translator.texto1}\n*${
    usedPrefix + command
  } @${global.suittag}*`;
  if (!who) {
    throw m.reply(warntext, m.chat, {mentions: conn.parseMention(warntext)});
  }
  user.warn += 1;
  await m.reply(
      `${
      user.warn == 1 ? `*@${who.split`@`[0]}*` : `*@${who.split`@`[0]}*`
      } ${translator.texto2[0]} ${sdms}\n${translator.texto2[1]} ${
        user.warn
      }/3*`,
      null,
      {mentions: [who]},
  );
  if (user.warn >= 3) {
    if (!bot.restrict) {
      return m.reply(
          `${translator.texto3[0]} (#𝚎𝚗𝚊𝚋𝚕𝚎 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝) ${translator.texto3[1]}`,
      );
    }
    user.warn = 0;
    await m.reply(
        `${translator.texto4[0]}\n*@${
          who.split`@`[0]
        }* ${translator.texto4[1]}`,
        null,
        {mentions: [who]},
    );
    await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
  }
  return !1;
};

handler.tags = ['group'];
handler.help = ['warn'];
handler.command = /^(advertir|advertencia|warn|warning)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;
