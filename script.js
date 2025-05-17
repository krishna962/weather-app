// script.js
const API_KEY = '355954def4ca12e7eb403fba0625e2c0';
const cityInput = document.getElementById('cityInput');
const resultDiv = document.getElementById('weatherResult');
const forecastDiv = document.getElementById('forecast');
const loader = document.getElementById('loader');
const themeBtn = document.getElementById('themeBtn');
const autocompleteBox = document.getElementById('autocomplete');

// Load last city and theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const lastCity = localStorage.getItem('lastCity');
  const darkMode = localStorage.getItem('theme') === 'dark';

  if (lastCity) {
    cityInput.value = lastCity;
    getWeather();
  }

  if (darkMode) {
    document.body.classList.add('dark');
    themeBtn.textContent = '🌙 Toggle Theme';
  }
});

// Fetch weather data
async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    resultDiv.innerHTML = '<p>Please enter a city name.</p>';
    return;
  }

  localStorage.setItem('lastCity', city);
  resultDiv.innerHTML = '';
  forecastDiv.innerHTML = '';
  loader.style.display = 'block';

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (weatherRes.status === 429) throw new Error('API limit reached. Try again later.');
    if (!weatherRes.ok) throw new Error('City not found or invalid API key.');

    const weatherData = await weatherRes.json();
    displayCurrentWeather(weatherData);
    await getForecast(city);
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">${err.message}</p>`;
  } finally {
    loader.style.display = 'none';
  }
}

function displayCurrentWeather(data) {
  const { name, main, weather } = data;
  const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  document.body.style.backgroundImage = `url('https://source.unsplash.com/1600x900/?${weather[0].main}')`;

  resultDiv.innerHTML = `
    <h2>${name}</h2>
    <img src="${icon}" alt="${weather[0].description}" />
    <p><strong>${weather[0].main}</strong> - ${weather[0].description}</p>
    <p>🌡 Temperature: ${main.temp} °C</p>
    <p>Feels like: ${main.feels_like} °C</p>
  `;
}

// Fetch 5-day forecast
async function getForecast(city) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
  );

  const data = await res.json();
  const dailyData = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) dailyData[date] = item;
  });

  Object.keys(dailyData).slice(0, 5).forEach(date => {
    const item = dailyData[date];
    const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;
    forecastDiv.innerHTML += `
      <div class="forecast-card">
        <p><strong>${date}</strong></p>
        <img src="${icon}" />
        <p>${item.weather[0].main}</p>
        <p>${item.main.temp}°C</p>
      </div>
    `;
  });
}

// Voice search using SpeechRecognition
function startVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Speech Recognition not supported');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = e => {
    const city = e.results[0][0].transcript;
    cityInput.value = city;
    getWeather();
  };
}

// City autocomplete using Geo API
cityInput.addEventListener('input', async () => {
  const query = cityInput.value.trim();
  if (query.length < 3) return (autocompleteBox.innerHTML = '');

  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
  );
  const data = await res.json();

  autocompleteBox.innerHTML = data.map(loc => `
    <div class="suggestion" onclick="selectCity('${loc.name}')">
      ${loc.name}${loc.state ? ', ' + loc.state : ''}, ${loc.country}
    </div>
  `).join('');
});

function selectCity(city) {
  cityInput.value = city;
  autocompleteBox.innerHTML = '';
  getWeather();
}

// Theme toggle
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeBtn.textContent = isDark ? '🌙 Toggle Theme' : '🌞 Toggle Theme';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});