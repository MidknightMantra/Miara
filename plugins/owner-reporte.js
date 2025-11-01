const handler = async (m, {conn, text, usedPrefix, command}) => {
 const datas = global
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins.owner_reporte;

 if (!text) throw `${translator.texto1[0]}\n*${usedPrefix + command} ${translator.texto1[1]} ${usedPrefix}play ${translator.texto1[2]}`;
 if (text.length < 10) throw translator.texto2;
 if (text.length > 1000) throw translator.texto3;
 const teks = `${translator.texto4[0]} wa.me/${m.sender.split`@`[0]}\n${translator.texto4[1]} ${text}\n*┴*`;
 conn.reply('5219992095479@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, {contextInfo: {mentionedJid: [m.sender]}});
 conn.reply('5493794297363@s.whatsapp.net', m.quoted ? teks + m.quoted.text : teks, null, {contextInfo: {mentionedJid: [m.sender]}});
 m.reply(translator.texto5);
};

handler.help = ['request'];
handler.tags = ['info'];
handler.command = ['solicitud', 'reportes', 'reporte', 'sugerencia', 'request', 'reports', 'report', 'suggest'];

export default handler;
