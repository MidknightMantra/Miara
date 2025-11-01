import fs from "fs"


async function handler(m, {conn, usedPrefix}) {
   const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.mipilot_stopbot
  

   if (conn.user.jid == global.conn.user.jid) return m.reply(translator.texto1)
   m.reply(translator.texto2)
   conn.fstop = true
   conn.ws.close()
}
handler.command = handler.help = ['stop', 'byebot'];
handler.tags = ['jadibot'];
handler.owner = true
export default handler; 