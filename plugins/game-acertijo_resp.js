import similarity from 'similarity';


const threshold = 0.72;
const handler = (m) => m;
handler.before = async function(m) {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.game_acertijo_resp

  const id = m.chat;
  if (!m.quoted || !m.quoted.fromMe || !m.quoted.isBaileys || !/^ⷮ/i.test(m.quoted.text)) return !0;
  this.tekateki = this.tekateki ? this.tekateki : {};
  if (!(id in this.tekateki)) return m.reply(translator.texto1);
  if (m.quoted.id == this.tekateki[id][0].id) {
    const json = JSON.parse(JSON.stringify(this.tekateki[id][1]));
    if (m.text.toLowerCase() == json.response.toLowerCase().trim()) {
      global.db.data.users[m.sender].exp += this.tekateki[id][2];
      m.reply(`${translator.texto2}\n+${this.tekateki[id][2]} Exp`);
      clearTimeout(this.tekateki[id][3]);
      delete this.tekateki[id];
    } else if (similarity(m.text.toLowerCase(), json.response.toLowerCase().trim()) >= threshold) m.reply(translator.texto3);
    else m.reply(translator.texto4);
  }
  return !0;
};
handler.exp = 0;
export default handler;
