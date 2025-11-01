import axios from 'axios';


const handler = async (m, {args}) => {
  const datas = global
  const language = datas.db.data.users[m.sender].language || global.defaultLanguage
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${language}.json`))
  const translator = _translate.plugins.herramientas_clima

  if (!args[0]) throw translator.texto1;
  try {
    const response = axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${args}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273`);
    const res = await response;
    const name = res.data.name;
    const Country = res.data.sys.country;
    const Weather = res.data.weather[0].description;
    const Temperature = res.data.main.temp + '°C';
    const Minimum_Temperature = res.data.main.temp_min + '°C';
    const Maximum_Temperature = res.data.main.temp_max + '°C';
    const Humidity = res.data.main.humidity + '%';
    const Wind = res.data.wind.speed + 'km/h';
    const wea = `${translator.texto2[0]} ${name}\n${translator.texto2[1]} ${Country}\n${translator.texto2[2]} ${Weather}\n${translator.texto2[3]} ${Temperature}\n${translator.texto2[4]} ${Minimum_Temperature}\n${translator.texto2[5]} ${Maximum_Temperature}\n${translator.texto2[6]} ${Humidity}\n${translator.texto2[7]} ${Wind}`;
    m.reply(wea);
  } catch {
    return translator.texto3;
  }
};
handler.help = ['clima *<ciudad/país>*'];
handler.tags = ['tools'];
handler.command = /^(clima|time)$/i;
export default handler;
