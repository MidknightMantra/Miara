import {createHash} from 'crypto';


const handler = async function(m, {args}) {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.rpg_unreg

  if (!args[0]) throw translator.texto1;
  const user = global.db.data.users[m.sender];
  const sn = createHash('md5').update(m.sender).digest('hex');
  if (args[0] !== sn) throw translator.texto2;
  user.registered = false;
  m.reply(translator.texto3);
};
handler.help = ['unreg <numero de serie>'];
handler.tags = ['xp'];
handler.command = /^unreg(ister)?$/i;
handler.register = true;
export default handler;
