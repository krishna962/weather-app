const API_KEY = '355954def4ca12e7eb403fba0625e2c0'; // Replace with your actual API key
const cityInput = document.getElementById('cityInput');
const resultDiv = document.getElementById('weatherResult');
const loader = document.getElementById('loader');
const themeBtn = document.getElementById('themeBtn');

// Load last searched city
window.addEventListener('DOMContentLoaded', () => {
  const lastCity = localStorage.getItem('lastCity');
  const darkMode = localStorage.getItem('theme') === 'dark';

  if (lastCity) {
    cityInput.value = lastCity;
    getWeather(); // Auto-fetch last city
  }

  if (darkMode) {
    document.body.classList.add('dark');
    themeBtn.textContent = '🌙 Toggle Theme';
  }
});

async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    resultDiv.innerHTML = '<p>Please enter a city name.</p>';
    return;
  }

  // Store city in localStorage
  localStorage.setItem('lastCity', city);

  resultDiv.innerHTML = '';
  loader.style.display = 'block';

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (res.status === 429) {
      throw new Error('API limit reached. Try again later.');
    }

    if (!res.ok) {
      throw new Error('City not found or invalid API key.');
    }

    const data = await res.json();
    const { name, main, weather } = data;
    const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    resultDiv.innerHTML = `
      <h2>${name}</h2>
      <img src="${icon}" alt="${weather[0].description}" />
      <p><strong>${weather[0].main}</strong> - ${weather[0].description}</p>
      <p>🌡 Temperature: ${main.temp} °C</p>
      <p>Feels like: ${main.feels_like} °C</p>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
  } finally {
    loader.style.display = 'none';
  }
}

// Theme toggle
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeBtn.textContent = isDark ? '🌙 Toggle Theme' : '🌞 Toggle Theme';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
