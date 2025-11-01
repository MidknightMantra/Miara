const handler = async (m, {conn, usedPrefix}) => {
 const datas = global
 const language = datas.db.data.users[m.sender].language || global.defaultLanguage
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins.info_creador

 const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
 const document = doc[Math.floor(Math.random() * doc.length)];
 const text = `${translator.texto1[0]}\n\n${translator.texto1[1]}\n\n${translator.texto1[2]}\n\n${translator.texto1[3]}\n\n${translator.texto1[4]}\n\n${translator.texto1[5]}\n\n${translator.texto1[6]}\n\n${translator.texto1[7]}\n\n${translator.texto1[8]}\n\n${translator.texto1[9]}\n\n${translator.texto1[10]}\n\n${translator.texto1[11]}\n\n${translator.texto1[12]}\n\n${translator.texto1[13]}`.trim();
 const buttonMessage = {
    'document': {url: `https://github.com/BrunoSobrino/TheMystic-Bot-MD`},
    'mimetype': `application/${document}`,
    'fileName': `${translator.texto2[0]}`,
    'fileLength': 99999999999999,
    'pageCount': 200,
    'contextInfo': {
      'forwardingScore': 200,
      'isForwarded': true,
      'externalAdReply': {
        'mediaUrl': 'https://github.com/BrunoSobrino/TheMystic-Bot-MD',
        'mediaType': 2,
        'previewType': 'pdf',
        'title': translator.texto2[1],
        'body': wm,
        'thumbnail': imagen1,
        'sourceUrl': 'https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA'}},
    'caption': text,
    'footer': wm,
    'headerType': 6
 };
 conn.sendMessage(m.chat, buttonMessage, {quoted: m});
};

handler.help = ['owner'];
handler.tags = ['info'];
handler.command = /^(owner|creator|creador|propietario)$/i;

export default handler;
