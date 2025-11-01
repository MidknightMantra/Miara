import {createHash} from 'crypto';
const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;

const handler = async function(m, {conn, text, usedPrefix, command}) {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.rpg_verificar

  const user = global.db.data.users[m.sender];
  const name2 = conn.getName(m.sender);
  const pp = await conn.profilePictureUrl(m.sender, 'image').catch((_) => global.imagen1);
  if (user.registered === true) throw `${translator.texto1[0]}\n*${usedPrefix}unreg* ${translator.texto1[1]}`;
  if (!Reg.test(text)) throw `${translator.texto2[0]} : ${usedPrefix + command} ${translator.texto2[1]} ${usedPrefix + command} Shadow.18*`;
  let [_, name, splitter, age] = text.match(Reg);
  if (!name) throw translator.texto3;
  if (!age) throw translator.texto5;
  if (name.length >= 30) throw translator.texto6;
  age = parseInt(age);
  if (age > 100) throw translator.texto6;
  if (age < 5) throw translator.texto7;
  user.name = name.trim();
  user.age = age;
  user.regTime = + new Date;
  user.registered = true;
  const sn = createHash('md5').update(m.sender).digest('hex');
  const caption = `${translator.texto8[0]}
${translator.texto8[1]}」
${translator.texto8[2]}
${translator.texto8[3]} ${name}
${translator.texto8[4]} ${age} ${translator.texto8[5]}
${translator.texto8[6]} 
┃ ${sn}
${translator.texto8[7]}
${translator.texto8[8]} 
${translator.texto8[9]}
${translator.texto8[10]}
${translator.texto8[11]}`;
  // let author = global.author
  await conn.sendFile(m.chat, pp, 'mystic.jpg', caption, m);
  // conn.sendButton(m.chat, caption, `¡𝚃𝚄 𝙽𝚄𝙼𝙴𝚁𝙾 𝙳𝙴 𝚂𝙴𝚁𝙸𝙴 𝚃𝙴 𝚂𝙴𝚁𝚅𝙸𝚁𝙰 𝙿𝙾𝚁 𝚂𝙸 𝙳𝙴𝚂𝙴𝙰𝚂 𝙱𝙾𝚁𝚁𝙰𝚁 𝚃𝚄 𝚁𝙴𝙶𝙸𝚂𝚃𝚁𝙾 𝙴𝙽 𝙴𝙻 𝙱𝙾𝚃!\n${author}`, [['¡¡𝙰𝙷𝙾𝚁𝙰 𝚂𝙾𝚈 𝚄𝙽 𝚅𝙴𝚁𝙸𝙵𝙸𝙲𝙰𝙳𝙾/𝙰!!', '/profile']], m)
  global.db.data.users[m.sender].money += 10000;
  global.db.data.users[m.sender].exp += 10000;
};
handler.help = ['verificar'];
handler.tags = ['xp'];
handler.command = /^(verify|register|verificar|reg|registrar)$/i;
export default handler;
