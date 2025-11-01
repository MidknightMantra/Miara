/* Codigo hecho por @Fabri115 y mejorado por BrunoSobrino */

import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync, readFileSync } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.fix_owner_esperando_mensajes

  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(m.chat, {text: translator.texto1}, {quoted: m});
  }
  await conn.sendMessage(m.chat, {text: translator.texto2}, {quoted: m});
  const sessionPath = './MysticSession/';
  try {
    if (!existsSync(sessionPath)) {
      return await conn.sendMessage(m.chat, {text: translator.texto3}, {quoted: m});
    }
    const files = await fs.readdir(sessionPath);
    let filesDeleted = 0;
    for (const file of files) {
      if (file !== 'creds.json') {
        await fs.unlink(path.join(sessionPath, file));
        filesDeleted++;
      }
    }
    if (filesDeleted === 0) {
      await conn.sendMessage(m.chat, {text: translator.texto4}, {quoted: m});
    } else {
      await conn.sendMessage(m.chat, {text: `${translator.texto5[0]} ${filesDeleted} ${translator.texto5[1]}`}, {quoted: m});
    }
  } catch (err) {
    console.error('Error al leer la carpeta o los archivos de sesión:', err);
    await conn.sendMessage(m.chat, {text: translator.texto6}, {quoted: m});
  }
  await conn.sendMessage(m.chat, {text: `${translator.texto7}\n${usedPrefix}s\n${usedPrefix}s\n${usedPrefix}s`}, {quoted: m});
};
handler.help = ['del_reg_in_session_owner'];
handler.tags = ['owner'];
handler.command = /^(del_reg_in_session_owner|dsowner|clearallsession)$/i;
handler.rowner = true
export default handler;
