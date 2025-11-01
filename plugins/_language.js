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
 // ----- Opciones de lenguaje
 if (sigla === 'es') {
 global.db.data.users[m.sender].language = 'es'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Idioma definido a Español 🇪🇸_*`)
 } else if (sigla === 'en') {
 global.db.data.users[m.sender].language = 'en'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Idioma definido a Inglês 🇬🇧_*`)
 } else {
 m.reply(`${translator.texto1[2]}\n${translator.texto1[3]} *( ${data.db.data.users[m.sender].language} )*\n${translator.texto1[0]}\n*${usedPrefix}lang* es\n\n${translator.texto1[1]}`)
 }
}

 // - DEFINIDO TRADUÇÕES PARA GRUPOS NO BOT THE MYSTIC 
 if (command === 'langgroup') {
 // ----- Condiciones para grupos
 if (m.isGroup === false) {
 return m.reply(translator.texto3)
 }
 if (m.isGroup === true && isAdmin === false) {
 return m.reply(translator.texto4)
}

 // ----- Opciones de lenguaje
 if (sigla === 'es') {
 global.db.data.chats[m.chat].language = 'es';
 m.reply(`*[ ✅ ] Configuración del grupo*\n\n*—◉* *_Idioma definido a Español 🇪🇸_*`)
 } else if (sigla === 'en') {
 global.db.data.chats[m.chat].language = 'en';
 m.reply(`*[ ✅ ] Configuración del grupo*\n\n*—◉* *_Idioma definido a Inglês 🇬🇧_*`)
 } else {
 m.reply(`${translator.texto2[0]}\n*${usedPrefix}langgroup* es\n\n${translator.texto2[1]}`)
 }
}
 // Fim 
 } catch (error) {
 console.log(error);
 global.db.data.users[m.sender].language = 'es'
 global.db.data.chats[m.chat].language = 'es'
 m.reply(`*[ERROR]* -  _Por defecto el language estaba configurado en español._\n\`\`\`contacta a los creadores del bot\`\`\``)
 }
};


handler.help = ['lang'];
handler.tags = ['info'];
handler.command = ['lang', 'langgroup'];

export default handler;
