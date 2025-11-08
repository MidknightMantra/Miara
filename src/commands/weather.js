/**
 * 🌈 Miara Weather Oracle Ultra++
 * ------------------------------------------------------
 * Intelligent weather command with auto-location,
 * 3-day forecast, emoji moods, and poetic summaries.
 *
 * by MidKnightMantra × GPT-5 (2025)
 */

import axios from "axios";
import moment from "moment-timezone";
import { config } from "../config.js";

async function getAutoLocation(m) {
  try {
    // 1️⃣ Check user profile (if your bot stores user data)
    const userCity = global.db?.data?.users?.[m.sender]?.location;
    if (userCity) return userCity;

    // 2️⃣ Config default city
    if (config.DEFAULT_CITY) return config.DEFAULT_CITY;

    // 3️⃣ IP-based fallback (approximate)
    const { data } = await axios.get("https://ipapi.co/json/", { timeout: 5000 });
    return data.city || "Nairobi";
  } catch {
    return "Nairobi"; // fallback default
  }
}

export default {
  name: "weather",
  aliases: ["forecast", "wthr", "climate"],
  description: "AI-enhanced weather & forecast with vibes 🌍🤖",
  category: "info",
  usage: ".weather <city> [3day]",

  async execute(conn, m, args) {
    const from = m.key.remoteJid;
    const apiKey = config.OPENWEATHER_API_KEY || "4902c0f2550f58298ad4146a92b65e10";

    // 🧭 Determine city intelligently
    let query = args.join(" ").trim();
    let isForecast = /3day/i.test(query);
    let city = query.replace(/3day/i, "").trim();

    if (!city) {
      city = await getAutoLocation(m);
      await conn.sendMessage(
        from,
        { text: `🌍 No city provided — using *${city}* (auto-detected).` },
        { quoted: m }
      );
    }

    // 🌦️ Weather icons
    const weatherIcons = {
      Thunderstorm: ["🌩️", "⛈️"],
      Drizzle: ["🌦️", "🌧️"],
      Rain: ["🌧️", "⛈️"],
      Snow: ["🌨️", "❄️"],
      Clear: ["🌞", "☀️"],
      Clouds: ["🌤️", "☁️"],
      Mist: ["🌫️"],
      Smoke: ["💨"],
      Haze: ["🌁"],
      Dust: ["🌪️"],
      Fog: ["🌫️"],
      Sand: ["🏜️"],
      Ash: ["🌋"],
      Squall: ["🌬️"],
      Tornado: ["🌪️"]
    };

    const getWeatherEmoji = (main, intensity = 0) => {
      const icons = weatherIcons[main] || ["🌈"];
      return intensity > 0.6 && icons[1] ? icons[1] : icons[0];
    };

    const getFeelsLikeSummary = (temp, humidity, desc) => {
      const hot = temp >= 30;
      const cold = temp <= 12;
      const damp = humidity > 75;
      const dry = humidity < 35;
      const base = desc.toLowerCase();

      if (hot && damp) return "🥵 Feels hot and humid — stay hydrated!";
      if (hot && dry) return "🔥 Dry and blazing — perfect beach day vibes!";
      if (cold && damp) return "🥶 Cold and damp — warm clothes recommended!";
      if (cold && dry) return "❄️ Crisp and chilly — great day for coffee!";
      if (base.includes("rain")) return "🌧️ Expect showers — keep your umbrella ready!";
      if (base.includes("cloud")) return "☁️ Mostly cloudy — cool and calm atmosphere.";
      if (base.includes("clear")) return "🌞 Clear and bright — a beautiful day ahead!";
      if (base.includes("storm")) return "⛈️ Stormy weather — better stay indoors!";
      return "🌤️ Pleasant conditions — enjoy your day!";
    };

    const makeTempGraph = (temps) => {
      const max = Math.max(...temps);
      const min = Math.min(...temps);
      const range = max - min || 1;
      const blocks = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
      return temps
        .map((t) => blocks[Math.round(((t - min) / range) * (blocks.length - 1))])
        .join("");
    };

    try {
      await conn.sendMessage(from, { react: { text: "🔍", key: m.key } });

      // ☀️ Current Weather
      if (!isForecast) {
        const res = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
          params: {
            q: encodeURIComponent(city),
            appid: apiKey,
            units: "metric"
          },
          timeout: 12000
        });

        const data = res.data;
        const w = data.weather[0];
        const t = data.main;

        if (t.temp > 100) t.temp -= 273.15; // Kelvin fallback
        const icon = getWeatherEmoji(w.main, t.humidity / 100);
        const feelsSummary = getFeelsLikeSummary(t.temp, t.humidity, w.description);
        const time = moment().utcOffset(data.timezone / 60 || 0).format("ddd, MMM D • HH:mm");

        const report = `
${icon} *${data.name}, ${data.sys.country}*
🕒 ${time}
💬 ${w.description.charAt(0).toUpperCase() + w.description.slice(1)}
🌡️ *Temp:* ${t.temp.toFixed(1)}°C (Feels ${t.feels_like.toFixed(1)}°C)
💧 *Humidity:* ${t.humidity}%
💨 *Wind:* ${data.wind.speed} m/s
🌅 *Sunrise:* ${moment.unix(data.sys.sunrise).utcOffset(data.timezone / 60).format("HH:mm")}
🌇 *Sunset:* ${moment.unix(data.sys.sunset).utcOffset(data.timezone / 60).format("HH:mm")}
🧠 *Feels Like:* ${feelsSummary}
        `.trim();

        await conn.sendMessage(from, { text: report }, { quoted: m });
      }

      // 📅 3-Day Forecast
      else {
        const res = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
          params: {
            q: encodeURIComponent(city),
            appid: apiKey,
            units: "metric"
          },
          timeout: 12000
        });

        const data = res.data;
        const { name: cityName, country, timezone } = data.city;
        const grouped = {};

        for (const e of data.list) {
          const date = moment.unix(e.dt).utcOffset((timezone || 0) / 60).format("YYYY-MM-DD");
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(e);
        }

        const days = Object.keys(grouped).slice(0, 3);
        let forecastText = `📆 *3-Day Forecast for ${cityName}, ${country}*\n\n`;

        for (const date of days) {
          const entries = grouped[date];
          const temps = entries.map((e) => e.main.temp);
          const desc = entries[Math.floor(entries.length / 2)].weather[0];
          const avg = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
          const min = Math.min(...temps).toFixed(1);
          const max = Math.max(...temps).toFixed(1);
          const icon = getWeatherEmoji(desc.main, avg / 35);
          const graph = makeTempGraph(temps);
          const dayName = moment(date).format("dddd, MMM D");
          const feel = getFeelsLikeSummary(avg, entries[0].main.humidity, desc.description);

          forecastText += `${icon} *${dayName}*\n🌡️ Avg: ${avg}°C (Min: ${min}°C • Max: ${max}°C)\n📊 ${graph}\n💬 ${desc.description}\n🧠 ${feel}\n\n`;
        }

        const avgTemp =
          days.reduce((a, d) => a + grouped[d][0].main.temp, 0) / days.length;
        const overall =
          avgTemp > 28
            ? "🔥 Hot trend ahead — keep cool!"
            : avgTemp < 15
            ? "❄️ Cool days incoming — cozy up!"
            : "🌤️ Balanced climate ahead — serenity in motion.";

        forecastText += `✨ *Overall:* ${overall}`;
        await conn.sendMessage(from, { text: forecastText.trim() }, { quoted: m });
      }

      await new Promise((r) => setTimeout(r, 400));
      await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
    } catch (err) {
      console.error("❌ Weather error:", err.message);
      let msg = "⚠️ Couldn't fetch weather data.";

      if (err.response?.status === 404) msg = `🏙️ City “${city}” not found.`;
      else if (err.code === "ECONNABORTED") msg = "⏱️ Request took too long.";
      else if (err.response?.status === 401) msg = "🔑 Invalid API key configured.";
      else if (err.message.includes("ENOTFOUND")) msg = "🌐 Could not reach OpenWeather servers.";
      else if (err.message.includes("Network Error")) msg = "🚫 Network connection lost.";

      await conn.sendMessage(from, { text: msg }, { quoted: m });
      await new Promise((r) => setTimeout(r, 400));
      await conn.sendMessage(from, { react: { text: "❌", key: m.key } });
    }
  }
};
