import * as baileys from "baileys";

const handler = async (m, {conn, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.herramientas_inspect

  const [, code] = text.match(/chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i) || [];
  if (!code) throw translator.texto1;
  const res = await conn.query({tag: 'iq', attrs: {type: 'get', xmlns: 'w:g2', to: '@g.us'}, content: [{tag: 'invite', attrs: {code}}]});
  const data = extractGroupMetadata(res);
  const txt = `${translator.texto2[0]} ${data.id}\n${translator.texto2[1]} ${data.subject}\n${translator.texto2[2]} ${data.creation}\n${translator.texto2[3]} ${data.owner}\n${translator.texto2[4]}\n${data.desc}`;
  
  const pp = await conn.profilePictureUrl(data.id, 'image').catch(console.error);
  if (pp) return conn.sendMessage(m.chat, {image: {url: pp}, caption: txt}, {quoted: m});
  const groupinfo = `${translator.texto2[0]}* ${data.id}\n${translator.texto2[1]} ${data.subject}\n${translator.texto2[2]} ${data.creation}\n${translator.texto2[3]} ${data.owner}\n${translator.texto2[4]}\n${data.desc}`;
  await conn.reply(m.chat, groupinfo, m);
};
handler.command = /^(inspect)$/i;
export default handler;

const extractGroupMetadata = (result) => {
  const group = baileys.getBinaryNodeChild(result, 'group');
  const descChild = baileys.getBinaryNodeChild(group, 'description');
  let desc;
  if (descChild) desc = baileys.getBinaryNodeChild(descChild, 'body')?.content;
  const metadata = {
    id: group.attrs.id.includes('@') ? group.attrs.id : baileys.jidEncode(group.attrs.id, 'g.us'),
    subject: group.attrs.subject,
    creation: new Date(+group.attrs.creation * 1000).toLocaleString('es-MX', {timeZone: 'America/Mexico_City'}),
    owner: group.attrs.creator ? 'wa.me/' + baileys.jidNormalizedUser(group.attrs.creator).split('@')[0] : group.attrs.id.includes('-') ? 'wa.me/' + group.attrs.id.split('-')[0] : '',
    desc,
  };
  return metadata;
};
