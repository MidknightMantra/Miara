/*************************************************/
/*
/* Créditos al creador de este módulo.
/* Jefferson: https://github.com/jeffersonalionco
/* 
/*************************************************/

const handler = async (m, { args, usedPrefix, command, isAdmin }) => {
try {
 const data = global
 const language = data.db.data.users[m.sender].language
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
 const translator = _translate.plugins._language

 data.db.data.users[m.sender].language
 let sigla // Args user

 //---- Transformar "cadena" en letras minúsculas
 if (args[0] != undefined) {
    sigla = args[0].toLowerCase()
}

 if (command === 'lang') {
 // ----- Language options (English only)
 if (sigla === 'en' || !sigla) {
 global.db.data.users[m.sender].language = 'en'
 m.reply(`*[ ✅ ] Miara Bot*\n\n*—◉* *_Language set to English 🇬🇧_*`)
 } else {
 m.reply(`*[ ℹ️ ] Only English is supported*\n\nUse: *${usedPrefix}lang en*`)
 }
}

 // - DEFINIDO TRADUÇÕES PARA GRUPOS NO BOT THE MYSTIC 
 if (command === 'langgroup') {
 // ----- Group conditions
 if (m.isGroup === false) {
 return m.reply(translator.texto3)
 }
 if (m.isGroup === true && isAdmin === false) {
 return m.reply(translator.texto4)
}

 // ----- Language options (English only)
 if (sigla === 'en' || !sigla) {
 global.db.data.chats[m.chat].language = 'en';
 m.reply(`*[ ✅ ] Group Configuration*\n\n*—◉* *_Language set to English 🇬🇧_*`)
 } else {
 m.reply(`*[ ℹ️ ] Only English is supported*\n\nUse: *${usedPrefix}langgroup en*`)
 }
}
 // Fim 
 } catch (error) {
 console.log(error);
 global.db.data.users[m.sender].language = 'en'
 global.db.data.chats[m.chat].language = 'en'
 m.reply(`*[ERROR]* - _Language has been set to English by default._\n\`\`\`Please contact the bot creator if this issue persists\`\`\``)
 }
};


handler.help = ['lang'];
handler.tags = ['info'];
handler.command = ['lang', 'langgroup'];

export default handler;
