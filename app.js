/* =====================================================
   SkyPulse – Weather App JS
   APIs:
     Geocoding:  https://geocoding-api.open-meteo.com/v1/search
     Weather:    https://api.open-meteo.com/v1/forecast
   ===================================================== */

// ——— State ———
let currentUnit = 'C';
let weatherData = null;   // raw API response
let locationData = null;  // selected location info
let debounceTimer = null;

// ——— DOM refs ———
const cityInput    = document.getElementById('cityInput');
const searchBtn    = document.getElementById('searchBtn');
const suggestions  = document.getElementById('suggestions');
const loader       = document.getElementById('loader');
const errorCard    = document.getElementById('errorCard');
const errorMsg     = document.getElementById('errorMsg');
const weatherSection = document.getElementById('weatherSection');
const welcomeState = document.getElementById('welcomeState');

// ——— Weather code → emoji + description ———
const WMO = {
  0:  { icon:'☀️',  desc:'Clear sky' },
  1:  { icon:'🌤️', desc:'Mainly clear' },
  2:  { icon:'⛅',  desc:'Partly cloudy' },
  3:  { icon:'☁️',  desc:'Overcast' },
  45: { icon:'🌫️', desc:'Foggy' },
  48: { icon:'🌫️', desc:'Icy fog' },
  51: { icon:'🌦️', desc:'Light drizzle' },
  53: { icon:'🌧️', desc:'Drizzle' },
  55: { icon:'🌧️', desc:'Heavy drizzle' },
  56: { icon:'🌨️', desc:'Light freezing drizzle' },
  57: { icon:'🌨️', desc:'Freezing drizzle' },
  61: { icon:'🌧️', desc:'Slight rain' },
  63: { icon:'🌧️', desc:'Rain' },
  65: { icon:'🌧️', desc:'Heavy rain' },
  66: { icon:'🌨️', desc:'Light freezing rain' },
  67: { icon:'🌨️', desc:'Freezing rain' },
  71: { icon:'❄️',  desc:'Slight snow' },
  73: { icon:'❄️',  desc:'Snow' },
  75: { icon:'❄️',  desc:'Heavy snow' },
  77: { icon:'🌨️', desc:'Snow grains' },
  80: { icon:'🌦️', desc:'Slight showers' },
  81: { icon:'🌧️', desc:'Showers' },
  82: { icon:'⛈️',  desc:'Violent showers' },
  85: { icon:'🌨️', desc:'Snow showers' },
  86: { icon:'🌨️', desc:'Heavy snow showers' },
  95: { icon:'⛈️',  desc:'Thunderstorm' },
  96: { icon:'⛈️',  desc:'Thunderstorm w/ hail' },
  99: { icon:'⛈️',  desc:'Thunderstorm w/ heavy hail' },
};

function getWMO(code) {
  return WMO[code] || { icon: '🌡️', desc: 'Unknown' };
}

// ——— Helpers ———
function cToF(c) { return (c * 9/5 + 32).toFixed(1); }
function formatTemp(c) {
  if (currentUnit === 'C') return `${Math.round(c)}°C`;
  return `${Math.round(cToF(c))}°F`;
}
function formatDay(dateStr, short = true) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: short ? 'short' : 'long' });
}
function formatHour(isoStr) {
  const d = new Date(isoStr);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h} ${ampm}`;
}
function show(el)  { el.classList.remove('hidden'); }
function hide(el)  { el.classList.add('hidden'); }

// ——— Search button / Enter ———
searchBtn.addEventListener('click', () => doSearch(cityInput.value.trim()));
cityInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    closeSuggestions();
    doSearch(cityInput.value.trim());
  }
});

// ——— Live autocomplete ———
cityInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const q = cityInput.value.trim();
  if (q.length < 2) { closeSuggestions(); return; }
  debounceTimer = setTimeout(() => fetchSuggestions(q), 350);
});

// Close suggestions when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper')) closeSuggestions();
});

async function fetchSuggestions(query) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    renderSuggestions(data.results || []);
  } catch (_) { closeSuggestions(); }
}

function renderSuggestions(results) {
  if (!results.length) { closeSuggestions(); return; }
  suggestions.innerHTML = '';
  results.forEach(r => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    const flag = r.country_code
      ? String.fromCodePoint(...[...r.country_code.toUpperCase()].map(c => 127397 + c.charCodeAt()))
      : '🌍';
    const admin = [r.admin1, r.country].filter(Boolean).join(', ');
    li.innerHTML = `
      <span class="sug-flag">${flag}</span>
      <span class="sug-details">
        <span class="sug-name">${r.name}</span>
        <span class="sug-country">${admin}</span>
      </span>`;
    li.addEventListener('click', () => {
      cityInput.value = r.name;
      closeSuggestions();
      fetchWeather(r);
    });
    suggestions.appendChild(li);
  });
  show(suggestions);
}

function closeSuggestions() {
  suggestions.innerHTML = '';
  hide(suggestions);
}

// ——— Main search ———
async function doSearch(query) {
  if (!query) return;
  closeSuggestions();
  showLoader();
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      showError(`No city found for "${query}". Try a different name.`);
      return;
    }
    fetchWeather(data.results[0]);
  } catch (err) {
    showError('Network error. Please check your internet connection.');
  }
}

// ——— Fetch weather from Open-Meteo ———
async function fetchWeather(location) {
  locationData = location;
  showLoader();
  try {
    const params = new URLSearchParams({
      latitude:  location.latitude,
      longitude: location.longitude,
      current:   [
        'temperature_2m','relative_humidity_2m','apparent_temperature',
        'weather_code','wind_speed_10m','surface_pressure','cloud_cover','visibility'
      ].join(','),
      hourly: [
        'temperature_2m','weather_code'
      ].join(','),
      daily: [
        'weather_code','temperature_2m_max','temperature_2m_min',
        'precipitation_probability_max'
      ].join(','),
      wind_speed_unit: 'kmh',
      timezone: 'auto',
      forecast_days: 7,
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) throw new Error('API error');
    weatherData = await res.json();
    renderWeather();
  } catch (err) {
    showError('Failed to fetch weather data. Please try again later.');
  }
}

// ——— Render everything ———
function renderWeather() {
  if (!weatherData || !locationData) return;
  hideLoader();
  hide(errorCard);
  hide(welcomeState);
  show(weatherSection);

  const c = weatherData.current;
  const wmo = getWMO(c.weather_code);

  // City / location
  document.getElementById('cityName').textContent = locationData.name;
  const admin = [locationData.admin1, locationData.country].filter(Boolean).join(', ');
  document.getElementById('country').textContent = admin;
  document.getElementById('dateTime').textContent = formatDateTime(new Date());

  // Icon & description
  document.getElementById('currentIcon').textContent = wmo.icon;
  document.getElementById('currentDesc').textContent = wmo.desc;

  // Temperature
  renderTemp();

  // Stats
  document.getElementById('humidity').textContent   = `${c.relative_humidity_2m}%`;
  document.getElementById('windSpeed').textContent  = `${Math.round(c.wind_speed_10m)} km/h`;
  document.getElementById('feelsLike').textContent  = formatTemp(c.apparent_temperature);
  const vis = c.visibility ? `${(c.visibility / 1000).toFixed(1)} km` : 'N/A';
  document.getElementById('visibility').textContent = vis;
  document.getElementById('pressure').textContent   = `${Math.round(c.surface_pressure)} hPa`;
  document.getElementById('cloudCover').textContent = `${c.cloud_cover}%`;

  // Forecast & hourly
  renderForecast();
  renderHourly();
}

function renderTemp() {
  if (!weatherData) return;
  const c = weatherData.current;
  document.getElementById('currentTemp').textContent = formatTemp(c.temperature_2m);
  document.getElementById('feelsLike').textContent   = formatTemp(c.apparent_temperature);
  // Re-render forecast temps too
  if (document.getElementById('forecastGrid').children.length) {
    renderForecast();
    renderHourly();
  }
}

function renderForecast() {
  const grid = document.getElementById('forecastGrid');
  grid.innerHTML = '';
  const d = weatherData.daily;
  d.time.forEach((date, i) => {
    const wmo = getWMO(d.weather_code[i]);
    const label = i === 0 ? 'Today' : formatDay(date);
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <div class="fc-day">${label}</div>
      <div class="fc-icon">${wmo.icon}</div>
      <div class="fc-max">${formatTemp(d.temperature_2m_max[i])}</div>
      <div class="fc-min">${formatTemp(d.temperature_2m_min[i])}</div>
      <div class="fc-desc">${wmo.desc}</div>`;
    grid.appendChild(card);
  });
}

function renderHourly() {
  const scroll = document.getElementById('hourlyScroll');
  scroll.innerHTML = '';
  const h = weatherData.hourly;
  const now = new Date();
  const currentHour = now.getHours();

  // Show next 24 hours from current time
  let startIdx = h.time.findIndex(t => {
    const d = new Date(t);
    return d >= now;
  });
  if (startIdx < 0) startIdx = 0;
  const end = Math.min(startIdx + 24, h.time.length);

  for (let i = startIdx; i < end; i++) {
    const d = new Date(h.time[i]);
    const isNow = Math.abs(d.getHours() - currentHour) < 1 && i === startIdx;
    const wmo = getWMO(h.weather_code[i]);
    const card = document.createElement('div');
    card.className = 'hourly-card' + (isNow ? ' now' : '');
    card.innerHTML = `
      <div class="hc-time">${isNow ? 'Now' : formatHour(h.time[i])}</div>
      <div class="hc-icon">${wmo.icon}</div>
      <div class="hc-temp">${formatTemp(h.temperature_2m[i])}</div>`;
    scroll.appendChild(card);
  }
}

// ——— Unit switch ———
function switchUnit(unit) {
  if (currentUnit === unit) return;
  currentUnit = unit;
  document.getElementById('btnC').classList.toggle('active', unit === 'C');
  document.getElementById('btnF').classList.toggle('active', unit === 'F');
  renderTemp();
}

// ——— Quick city search ———
function quickSearch(city) {
  cityInput.value = city;
  doSearch(city);
}

// ——— UI helpers ———
function showLoader() {
  hide(welcomeState);
  hide(errorCard);
  hide(weatherSection);
  show(loader);
}
function hideLoader() { hide(loader); }

function showError(msg) {
  hideLoader();
  hide(weatherSection);
  show(welcomeState);
  errorMsg.textContent = msg;
  show(errorCard);
}

function formatDateTime(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ——— Keyboard nav for suggestions ———
cityInput.addEventListener('keydown', e => {
  const items = suggestions.querySelectorAll('li');
  if (!items.length) return;
  const active = suggestions.querySelector('li.active');
  let idx = [...items].indexOf(active);

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    idx = (idx + 1) % items.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    idx = (idx - 1 + items.length) % items.length;
  } else if (e.key === 'Escape') {
    closeSuggestions(); return;
  } else return;

  items.forEach(li => li.classList.remove('active'));
  items[idx].classList.add('active');
  cityInput.value = items[idx].querySelector('.sug-name').textContent;
});
