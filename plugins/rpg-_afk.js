export function before(m) {
 const datas = global
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins.afk__afk

 const user = global.db.data.users[m.sender];
 if (user.afk > -1) {
 m.reply(`${translator.texto2[0]} ${user.afkReason ? `${translator.texto2[1]}` + user.afkReason : ''}*\n\n*${translator.texto2[2]} ${(new Date - user.afk).toTimeString()}*`.trim());
   user.afk = -1;
   user.afkReason = '';
 }
const getQuotedSender = async () => {
    try {
      return m.quoted ? await m.quoted?.sender : null;
    } catch {
      return null;
    }
  };
  (async () => {
    const quotedSender = await getQuotedSender();
    const jids = [...new Set([...(await m.mentionedJid || []), ...(quotedSender ? [quotedSender] : [])])];
 for (const jid of jids) {
 const user = global.db.data.users[jid];
 if (!user) {
   continue;
 }
 const afkTime = user.afk;
 if (!afkTime || afkTime < 0) {
   continue;
 }
 const reason = user.afkReason || '';
 m.reply(`${translator.texto1[0]}\n\n*—◉ ${translator.texto1[1]}*\n*—◉ ${reason ? `${translator.texto1[2]}` + reason : `${translator.texto1[3]}`}*\n*—◉ ${translator.texto1[4]} ${(new Date - afkTime).toTimeString()}*`.trim());
 }
 })();  
 return true;
}
