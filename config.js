import { watchFile, unwatchFile } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs';
import moment from 'moment-timezone';

// Bot configuration
global.botnumber = "";
global.confirmCode = "";
global.authFile = `MiaraSession`;

global.isBaileysFail = false;

global.defaultLanguage = 'en';

global.owner = [
  ['254758925674', '👑 Owner 👑', true],
  ['254732647560', '👑 Co-Owner 👑', true],
  ['254743032398'],
];

global.suittag = ['254758925674', '254732647560', '254743032398'];
global.prems = [];

global.BASE_API_DELIRIUS = "https://delirius-apiofc.vercel.app";
global.packname = 'Sticker';
global.author = 'MidknightMantra';
global.wm = 'Miara';
global.titulowm = 'Miara';
global.titulowm2 = `Miara`;
global.igfg = 'Miara';
// Loading messages (modern theme)
global.wait = '⚡ *Processing your request...*';
global.waitt = '⏳ *Please wait...*';
global.waittt = '🚀 *Loading...*';
global.waitttt = '✨ *Almost there...*';

global.imagen1 = fs.readFileSync('./src/assets/images/menu/languages/en/menu.png');
global.imagen2 = fs.readFileSync('./src/assets/images/menu/languages/en/menu.png');
global.imagen3 = fs.readFileSync('./src/assets/images/menu/languages/en/menu.png');
global.imagen4 = fs.readFileSync('./src/assets/images/menu/languages/en/menu.png');
global.imagen5 = fs.readFileSync('./src/assets/images/menu/languages/en/menu.png');

global.mods = [];

global.d = new Date(new Date + 3600000);
global.locale = 'en';
global.day = d.toLocaleDateString(locale, { weekday: 'long' });
global.date = d.toLocaleDateString('en', { day: 'numeric', month: 'numeric', year: 'numeric' });
global.month = d.toLocaleDateString('en', { month: 'long' });
global.year = d.toLocaleDateString('en', { year: 'numeric' });
global.time = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
global.wm2 = `✨ ${day} ${date} • Miara`;
global.gt = '『 ✦ MIARA ✦ 』';
global.miaraBot = 'Miara';
global.channel = 'https://whatsapp.com/channel/0029Vb74Dlf4CrfoqpAEBC2T';
global.md = 'https://github.com/MidknightMantra/Miara';
global.miaraBotRepo = 'https://github.com/MidknightMantra/Miara';
global.ownerNumber = '254758925674';

// Theme Configuration
global.themeEmojis = {
    success: '✨',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳',
    admin: '⚡',
    owner: '👑',
    premium: '💎',
    download: '📥',
    search: '🔍',
    game: '🎮',
    tools: '🔧',
};

// File type support
global.pdoc = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/msword',
  'application/pdf',
  'text/rtf'
];

// Menu text symbols and styles
global.menuTop = '❖––––––『';
global.menuBody = '┊✦ ';
global.menuFooter = '╰━═┅═━––––––๑\n';
global.menuArt = '\n⌕ ❙❘❙❙❘❙❚❙❘❙❙❚❙❘❙❘❙❚❙❘❙❙❚❙❘❙❙❘❙❚❙❘ ⌕\n     ';
global.decorMenuTop = '*❖─┅──┅〈*';
global.decorMenuBody = '*┊»*';
global.decorMenuBody2 = '*┊*';
global.decorMenuFooter = '*╰┅────────┅✦*';
global.htjava = '⫹⫺';
global.htki = '*⭑•̩̩͙⊱•••• ☪*';
global.htka = '*☪ ••••̩̩͙⊰•⭑*';
global.start = '• • ◕◕════';
global.end = '════◕◕ • •';

global.botDate = `📅 *Date:* ${moment.tz('Africa/Nairobi').format('DD/MM/YY')}`;
global.botTime = `🕐 *Time:* ${moment.tz('Africa/Nairobi').format('HH:mm:ss')}`;

global.fakeGif = { 
  key: { participant: '0@s.whatsapp.net' }, 
  message: { 
    'videoMessage': { 
      'title': wm, 
      'h': `Hmm`, 
      'seconds': '999999999', 
      'gifPlayback': 'true', 
      'caption': botTime, 
      'jpegThumbnail': fs.readFileSync('./src/assets/images/menu/languages/en/menu.png')
    }
  }
};

global.multiplier = 99;

global.flamingTextEffects = [
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=crafts-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=amped-logo&doScale=true&scaleWidth=800&scaleHeight=500&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&text=',
  'https://www6.flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=sketch-name&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextType=1&fillTextPattern=Warning!&fillColor1Color=%23f2aa4c&fillColor2Color=%23f2aa4c&fillColor3Color=%23f2aa4c&fillColor4Color=%23f2aa4c&fillColor5Color=%23f2aa4c&fillColor6Color=%23f2aa4c&fillColor7Color=%23f2aa4c&fillColor8Color=%23f2aa4c&fillColor9Color=%23f2aa4c&fillColor10Color=%23f2aa4c&fillOutlineColor=%23f2aa4c&fillOutline2Color=%23f2aa4c&backgroundColor=%23101820&text=',
];
const file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Updated "config.js"'));
  import(`${file}?update=${Date.now()}`);
});
