const handler = async (m, {conn, args, usedPrefix, command}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.gc_config

  const isClose = { 
    'open': 'not_announcement',
    'close': 'announcement',
    'abierto': 'not_announcement',
    'cerrado': 'announcement',
    'abrir': 'not_announcement',
    'cerrar': 'announcement',
  }[args[0]?.toLowerCase() || ''];

  if (isClose === undefined) {
    throw `${translator.texto1[0]}

${translator.texto1[1]}
*┠┉↯ ${usedPrefix + command} abrir*
*┠┉↯ ${usedPrefix + command} cerrar*`.trim();
  }

  await conn.groupSettingUpdate(m.chat, isClose);
  m.reply(`${translator.texto1[2] || 'Configuración del grupo actualizada correctamente'}`);
};

handler.help = ['group open / close'];
handler.tags = ['group'];
handler.command = ['group', 'grupo'];
handler.admin = true;
handler.botAdmin = true;
export default handler;
