
const handler = async (m, {conn}) => {
  const datas = global
   const language = datas.db.data.users[m.sender].language || global.defaultLanguage
   const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
   const translator = _translate.plugins.info_tyc
   
   global.terminos = translator.texto1;

  m.reply(global.terminos);
};

handler.help = ['T&C'];
handler.tags = ['info'];
handler.command = /^(terminosycondicionesyprivacidad|terminosycondiciones|tyc|t&c)$/i;
export default handler;


