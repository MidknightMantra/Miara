
const handler = async (m, {conn, usedPrefix}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.menu_caja_fuerte

  const pp = imagen4;
  try {
  } catch (e) {
  } finally {
    const name = await conn.getName(m.sender);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const str = `
*ミ💖 ${translator.texto1[0]} ${taguser} 💖彡*

ㅤㅤ ${translator.texto1[1]}

${translator.texto1[2]}

${translator.texto1[3]}

° ඬ⃟🗳️ _${usedPrefix}agregarmsg ${translator.texto2[0]}
° ඬ⃟🗳️ _${usedPrefix}agregarvn ${translator.texto2[1]}
° ඬ⃟🗳️ _${usedPrefix}agregarvideo ${translator.texto2[2]}
° ඬ⃟🗳️ _${usedPrefix}agregaraudio ${translator.texto2[3]}
° ඬ⃟🗳️ _${usedPrefix}agregarimg ${translator.texto2[4]}
° ඬ⃟🗳️ _${usedPrefix}agregarsticker ${translator.texto2[5]}

${translator.texto1[4]}

° ඬ⃟🗳️ _${usedPrefix}listamsg_
° ඬ⃟🗳️ _${usedPrefix}listavn_
° ඬ⃟🗳️ _${usedPrefix}listavideo_
° ඬ⃟🗳️ _${usedPrefix}listaaudio_
° ඬ⃟🗳️ _${usedPrefix}listaimg_
° ඬ⃟🗳️ _${usedPrefix}listasticker_

${translator.texto1[5]}

° ඬ⃟🗳️ _${usedPrefix}vermsg ${translator.texto3[0]}
° ඬ⃟🗳️ _${usedPrefix}vervn ${translator.texto3[1]}
° ඬ⃟🗳️ _${usedPrefix}vervideo ${translator.texto3[2]}
° ඬ⃟🗳️ _${usedPrefix}veraudio ${translator.texto3[3]}
° ඬ⃟🗳️ _${usedPrefix}verimg ${translator.texto3[4]}
° ඬ⃟🗳️ _${usedPrefix}versticker ${translator.texto3[5]}

${translator.texto1[6]}

° ඬ⃟🗳️ _${usedPrefix}eliminarmsg ${translator.texto4[0]}
° ඬ⃟🗳️ _${usedPrefix}eliminarvn ${translator.texto4[1]}
° ඬ⃟🗳️ _${usedPrefix}eliminarvideo ${translator.texto4[2]}
° ඬ⃟🗳️ _${usedPrefix}eliminaraudio ${translator.texto4[3]}
° ඬ⃟🗳️ _${usedPrefix}eliminarimg ${translator.texto4[4]}
° ඬ⃟🗳️ _${usedPrefix}eliminarsticker ${translator.texto4[5]}`.trim();
    if (m.isGroup) {
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: m});
    } else {
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: fkontak2});
    }
    // conn.sendButton(m.chat, str, wm, pp, [['𝙼𝙴𝙽𝚄 𝙿𝚁𝙸𝙽𝙲𝙸𝙿𝙰𝙻', '/menu']], m, { mentions: [m.sender] })
  }
};
handler.help = ['cajafuerte'];
handler.tags = ['owner'];
handler.command = /^(cajafuerte)$/i;
handler.rowner = true;
handler.fail = null;
export default handler;
