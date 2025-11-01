const handler = async (m, {conn, participants, groupMetadata}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.gc_infogroup

  const pp = await conn.profilePictureUrl(m.chat, 'image') || imagen1 ||'./src/avatar_contact.png';
  const {antiToxic, antiTraba, antidelete, antiviewonce, isBanned, welcome, detect, detect2, sWelcome, sBye, sPromote, sDemote, antiLink, antiLink2, modohorny, autosticker, modoadmin, audios, delete: del} = global.db.data.chats[m.chat];
  const groupAdmins = participants.filter((p) => p.admin);
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
  const owner = groupMetadata.ownerJid || groupMetadata.owner
  const text = `${translator.texto1[0]}\n
  ${translator.texto1[1]}* 
${groupMetadata.id}

${translator.texto1[2]}
${groupMetadata.subject}

${translator.texto1[3]} 
${groupMetadata.desc?.toString() || translator.texto1[22]}


${translator.texto1[4]} 
${participants.length} ${translator.texto1[5]} 

${translator.texto1[6]}  
@${owner.split('@')[0]}

${translator.texto1[7]}  
${listAdmin}

${translator.texto1[8]} 
${translator.texto1[9]}  ${welcome ? '✅' : '❌'}
${translator.texto1[10]}  ${detect ? '✅' : '❌'} 
${translator.texto1[11]}  ${detect2 ? '✅' : '❌'} 
${translator.texto1[12]}  ${antiLink ? '✅' : '❌'} 
${translator.texto1[13]}  ${antiLink2 ? '✅' : '❌'} 
${translator.texto1[14]}  ${modohorny ? '✅' : '❌'} 
${translator.texto1[15]}  ${autosticker ? '✅' : '❌'} 
${translator.texto1[16]}  ${audios ? '✅' : '❌'} 
${translator.texto1[17]}  ${antiviewonce ? '✅' : '❌'} 
${translator.texto1[18]}  ${antidelete ? '✅' : '❌'} 
${translator.texto1[19]}  ${antiToxic ? '✅' : '❌'} 
${translator.texto1[20]}  ${antiTraba ? '✅' : '❌'} 
${translator.texto1[21]}  ${modoadmin ? '✅' : '❌'} 
`.trim();
  conn.sendFile(m.chat, pp, 'error.jpg', text, m, false, {mentions: [...groupAdmins.map((v) => v.id), owner]});
};
handler.help = ['infogrup'];
handler.tags = ['group'];
handler.command = /^(infogrupo|gro?upinfo|info(gro?up|gc))$/i;
handler.group = true;
export default handler;
