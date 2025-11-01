
const handler = async (m, { conn }) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.owner_grouplist

  let txt = '';
try {    
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
  const totalGroups = groups.length;
  for (let i = 0; i < groups.length; i++) {
    const [jid, chat] = groups[i];
    const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
    const participants = groupMetadata.participants || [];
    const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
    const isBotAdmin = bot?.admin || false;
    const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
    const participantStatus = isParticipant ? translator.texto1[0] : translator.texto1[1];
    const totalParticipants = participants.length;
    txt += `${translator.texto2[0]} ${i + 1}
    ${translator.texto2[1]} ${await conn.getName(jid)}
    ${translator.texto2[2]} ${jid}
    ${translator.texto2[3]} ${isBotAdmin ? '✔ Sí' : '❌ No'}
    ${translator.texto2[4]} ${participantStatus}
    ${translator.texto2[5]} ${totalParticipants}
    ${translator.texto2[6]} ${isBotAdmin ? `https://chat.whatsapp.com/${await conn.groupInviteCode(jid) || '--- (Error) ---'}` : '--- (No admin) ---'}\n\n`;
  }
  m.reply(`${translator.texto3} ${totalGroups}\n\n${txt}`.trim());
} catch {
  const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
  const totalGroups = groups.length;
  for (let i = 0; i < groups.length; i++) {
    const [jid, chat] = groups[i];
    const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
    const participants = groupMetadata.participants || [];
    const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
    const isBotAdmin = bot?.admin || false;
    const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
    const participantStatus = isParticipant ? translator.texto1[0] : translator.texto1[1];
    const totalParticipants = participants.length;    
    txt += `${translator.texto2[0]} ${i + 1}
    ${translator.texto2[1]} ${await conn.getName(jid)}
    ${translator.texto2[2]} ${jid}
    ${translator.texto2[3]} ${isBotAdmin ? '✔ Sí' : '❌ No'}
    ${translator.texto2[4]} ${participantStatus}
    ${translator.texto2[5]} ${totalParticipants}
    ${translator.texto2[6]} ${isBotAdmin ? '--- (Error) ---' : '--- (No admin) ---'}\n\n`;
  }
  m.reply(`${translator.texto3} ${totalGroups}\n\n${txt}`.trim());
 }    
};
handler.help = ['groups', 'grouplist'];
handler.tags = ['info'];
handler.command = /^(groups|grouplist|listadegrupo|gruposlista|listagrupos|listgroup)$/i;
handler.rowner = true;
handler.private = true
export default handler;
