const handler = async (m, {conn, text}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.herramientas_spamwa


  const [nomor, pesan, jumlah] = text.split('|');
  if (!nomor) throw translator.texto1;
  if (!pesan) throw translator.texto2;
  if (jumlah && isNaN(jumlah)) throw translator.texto3;

  const fixedNumber = nomor.replace(/[-+<>@]/g, '').replace(/ +/g, '').replace(/^[0]/g, '62') + '@s.whatsapp.net';
  const fixedJumlah = jumlah ? jumlah * 1 : 10;
  if (fixedJumlah > 50) throw translator.texto4;
  await m.reply(`${translator.texto5[0]} ${nomor} ${translator.texto5[1]}  ${fixedJumlah} ${translator.texto5[2]}`);
  for (let i = fixedJumlah; i > 1; i--) {
    if (i !== 0) conn.reply(fixedNumber, pesan.trim(), m);
  }
};
handler.help = ['spamwa <number>|<mesage>|<no of messages>'];
handler.tags = ['tools'];
handler.command = /^spam(wa)?$/i;
handler.group = false;
handler.premium = true;
// handler.private = true
// handler.limit = true
export default handler;
