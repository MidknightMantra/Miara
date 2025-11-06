/**
 * 🌸 Miara Command: Weather + 3-Day Forecast
 * Powered by OpenWeather API
 */

import axios from "axios";
import moment from "moment-timezone";

export default {
  name: "weather",
  aliases: ["wthr", "forecast"],
  description: "Check current weather or 3-day forecast for a city.",
  category: "info",
  usage: ".weather <city> [3day]",

  async execute(conn, m, args) {
    const from = m.from;
    const apiKey = "4902c0f2550f58298ad4146a92b65e10"; // Replace with your API key

    if (!args.length) {
      await conn.sendMessage(
        from,
        {
          text: "🌦️ Please provide a city name.\n\nExample:\n.weather Nairobi\n.weather Nairobi 3day",
        },
        { quoted: m }
      );
      return;
    }

    const isForecast = args.join(" ").toLowerCase().includes("3day");
    const city = args.filter(a => a.toLowerCase() !== "3day").join(" ").trim();

    try {
      if (!city) throw new Error("Missing city name");

      await conn.sendMessage(from, { react: { text: "🌤️", key: m.key } });

      if (!isForecast) {
        // -------------------------
        // 🌡️ Current Weather
        // -------------------------
        const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
          params: { q: city, appid: apiKey, units: "metric" },
          timeout: 10000,
        });

        const data = res.data;
        const w = data.weather[0];
        const t = data.main;
        const wind = data.wind;
        const country = data.sys.country;

        const text = `
🌍 *Weather in ${data.name}, ${country}*
🌤️ ${w.description.charAt(0).toUpperCase() + w.description.slice(1)}
🌡️ ${t.temp}°C (Feels like ${t.feels_like}°C)
💧 Humidity: ${t.humidity}%
💨 Wind: ${wind.speed} m/s
      `.trim();

        await conn.sendMessage(from, { text }, { quoted: m });
      } else {
        // -------------------------
        // 📅 3-Day Forecast
        // -------------------------
        const res = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
          params: { q: city, appid: apiKey, units: "metric" },
          timeout: 10000,
        });

        const data = res.data;
        const cityName = data.city.name;
        const country = data.city.country;
        const list = data.list;

        // Group by day
        const forecastByDay = {};
        for (const entry of list) {
          const date = moment.unix(entry.dt).utcOffset(data.city.timezone / 60).format("YYYY-MM-DD");
          if (!forecastByDay[date]) forecastByDay[date] = [];
          forecastByDay[date].push(entry);
        }

        // Get the next 3 days
        const nextDays = Object.keys(forecastByDay).slice(0, 3);

        let forecastText = `📅 *3-Day Forecast for ${cityName}, ${country}*\n\n`;

        for (const date of nextDays) {
          const dayData = forecastByDay[date];
          const temps = dayData.map(d => d.main.temp);
          const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
          const desc = dayData[0].weather[0].description;
          const minTemp = Math.min(...temps).toFixed(1);
          const maxTemp = Math.max(...temps).toFixed(1);
          const dayName = moment(date).format("dddd, MMM D");

          forecastText += `📆 *${dayName}*\n🌡️ ${avgTemp}°C (Min: ${minTemp}°C, Max: ${maxTemp}°C)\n🌤️ ${desc}\n\n`;
        }

        await conn.sendMessage(from, { text: forecastText.trim() }, { quoted: m });
      }

      await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    } catch (err) {
      console.error("❌ Weather command error:", err);

      let errorMessage = "❌ Unable to fetch weather data.";

      if (err.response) {
        if (err.response.status === 404)
          errorMessage = `🌆 City "${city}" not found. Please check the spelling.`;
        else if (err.response.status === 401)
          errorMessage = "🔑 Invalid API key. Please contact the bot admin.";
        else
          errorMessage += ` (Status ${err.response.status})`;
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "⏱️ Request timed out. Try again later.";
      } else if (err.request) {
        errorMessage = "🌐 Could not reach the weather service.";
      } else {
        errorMessage += ` Error: ${err.message}`;
      }

      await conn.sendMessage(from, { text: errorMessage }, { quoted: m });
    }
  },
};
