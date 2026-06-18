let weatherData = null;
let locationData = null;
let airQualityData = null;
let debounceTimer = null;

// Configure selectors from DOM
document.addEventListener('DOMContentLoaded', () => {
  const cityInput = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const suggestions = document.getElementById('suggestions');
  const gpsBtn = document.getElementById('gpsBtn');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => doSearch(cityInput.value.trim()));
  }

  if (cityInput) {
    cityInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        closeSuggestions();
        doSearch(cityInput.value.trim());
      }
    });

    cityInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const query = cityInput.value.trim();
      if (query.length < 2) {
        closeSuggestions();
        return;
      }
      debounceTimer = setTimeout(() => fetchSuggestions(query), 350);
    });
  }

  if (gpsBtn) {
    gpsBtn.addEventListener('click', getCurrentLocation);
  }

  document.addEventListener('click', e => {
    if (cityInput && !e.target.closest('.search-container')) {
      closeSuggestions();
    }
  });
});

async function fetchSuggestions(query) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    renderSuggestions(data.results || []);
  } catch (_) {
    closeSuggestions();
  }
}

function renderSuggestions(results) {
  const suggestionsEl = document.getElementById('suggestions');
  if (!suggestionsEl) return;
  if (!results.length) {
    closeSuggestions();
    return;
  }

  suggestionsEl.innerHTML = '';
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
      const cityInput = document.getElementById('cityInput');
      if (cityInput) cityInput.value = r.name;
      closeSuggestions();
      fetchWeather(r);
    });
    suggestionsEl.appendChild(li);
  });
  show(suggestionsEl);
}

function closeSuggestions() {
  const suggestionsEl = document.getElementById('suggestions');
  if (suggestionsEl) {
    suggestionsEl.innerHTML = '';
    hide(suggestionsEl);
  }
}

// Perform Geocoding API lookup and weather fetching
async function doSearch(query) {
  if (!query) return;
  closeSuggestions();
  showLoader();

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      showToast(`No results found for "${query}"`, 'warning');
      hideLoader();
      return;
    }

    fetchWeather(data.results[0]);
  } catch (err) {
    showToast('Failed to fetch location coordinate details.', 'error');
    hideLoader();
  }
}

// Core weather parameters loading
async function fetchWeather(location) {
  locationData = location;
  showLoader();

  try {
    // Current weather conditions from Open-Meteo
    const params = new URLSearchParams({
      latitude: location.latitude,
      longitude: location.longitude,
      current: [
        'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
        'weather_code', 'wind_speed_10m', 'wind_direction_10m', 'surface_pressure',
        'cloud_cover', 'visibility', 'is_day'
      ].join(','),
      hourly: [
        'temperature_2m', 'weather_code', 'relative_humidity_2m', 'wind_speed_10m'
      ].join(','),
      daily: [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'precipitation_probability_max', 'precipitation_sum', 'sunrise', 'sunset', 'uv_index_max'
      ].join(','),
      wind_speed_unit: 'kmh',
      timezone: 'auto',
      forecast_days: 7
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!res.ok) throw new Error('Weather API request error');
    weatherData = await res.json();

    // Fetch Air Quality Index from Open-Meteo Air Quality API
    const aqiRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${location.latitude}&longitude=${location.longitude}&current=european_aqi`
    );
    if (aqiRes.ok) {
      const aqiData = await aqiRes.json();
      airQualityData = aqiData.current ? aqiData.current.european_aqi : null;
    }

    // Save search log to user profile search history via API
    apiClient('/history', {
      method: 'POST',
      body: JSON.stringify({
        cityName: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude
      })
    }).catch(() => {}); // silent fail if offline

    renderWeather();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    hideLoader();
  }
}

// Subrender coordination
function renderWeather() {
  if (!weatherData || !locationData) return;

  // Toggle visible containers
  hide(document.getElementById('welcomeState'));
  show(document.getElementById('weatherSection'));

  const current = weatherData.current;
  const wmo = getWMO(current.weather_code);

  // Update layout header info
  document.getElementById('cityName').textContent = locationData.name;
  const admin = [locationData.admin1, locationData.country].filter(Boolean).join(', ');
  document.getElementById('country').textContent = admin;
  document.getElementById('dateTime').textContent = formatDateTime(new Date());

  // Render weather state icons
  document.getElementById('currentIcon').textContent = wmo.icon;
  document.getElementById('currentDesc').textContent = wmo.desc;

  // Render temperature details
  renderTemp();

  // Load atmospheric stats
  document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  document.getElementById('windDirection').textContent = getWindDirection(current.wind_direction_10m);
  
  const vis = current.visibility ? `${(current.visibility / 1000).toFixed(1)} km` : 'N/A';
  document.getElementById('visibility').textContent = vis;
  document.getElementById('pressure').textContent = `${Math.round(current.surface_pressure)} hPa`;

  // Render UV Index
  const dailyUvMax = weatherData.daily.uv_index_max[0];
  const uvInfo = getUVLevel(dailyUvMax);
  const uvSpan = document.getElementById('uvIndex');
  uvSpan.textContent = `${dailyUvMax} (${uvInfo.level})`;
  uvSpan.style.color = uvInfo.color;

  // Render Air Quality Index
  const aqiSpan = document.getElementById('aqi');
  if (airQualityData !== null) {
    const aqiInfo = getAQILevel(airQualityData);
    aqiSpan.textContent = `${airQualityData} (${aqiInfo.level})`;
    aqiSpan.style.color = aqiInfo.color;
  } else {
    aqiSpan.textContent = 'N/A';
    aqiSpan.style.color = 'inherit';
  }

  // Sunrise / Sunset times
  document.getElementById('sunrise').textContent = formatSunTime(weatherData.daily.sunrise[0]);
  document.getElementById('sunset').textContent = formatSunTime(weatherData.daily.sunset[0]);

  // Update favorite toggle heart state
  updateFavoriteButton();

  // Render list sub-components
  renderHourly();
  renderForecast();

  // Render Charts, Maps and Smart Insights if modules are active
  if (window.renderCharts) renderCharts(weatherData);
  if (window.updateMapLocation) updateMapLocation(locationData.latitude, locationData.longitude, locationData.name);
  if (window.generateInsights) generateInsights(weatherData, airQualityData);
}

function renderTemp() {
  if (!weatherData) return;
  const current = weatherData.current;
  document.getElementById('currentTemp').textContent = formatTemp(current.temperature_2m);
  document.getElementById('feelsLike').textContent = formatTemp(current.apparent_temperature);
}

// 24 Hour horizontal forecast cards renderer
function renderHourly() {
  const scroll = document.getElementById('hourlyScroll');
  if (!scroll) return;
  scroll.innerHTML = '';
  
  const h = weatherData.hourly;
  const now = new Date();
  const currentHour = now.getHours();

  // Determine standard start indexes
  let startIdx = h.time.findIndex(t => new Date(t) >= now);
  if (startIdx < 0) startIdx = 0;
  const end = Math.min(startIdx + 24, h.time.length);

  for (let i = startIdx; i < end; i++) {
    const d = new Date(h.time[i]);
    const isNow = Math.abs(d.getHours() - currentHour) < 1 && i === startIdx;
    const wmo = getWMO(h.weather_code[i]);
    const card = document.createElement('div');
    card.className = 'glass-card hourly-card' + (isNow ? ' now' : '');
    card.innerHTML = `
      <div class="hc-time">${isNow ? 'Now' : formatHour(h.time[i])}</div>
      <div class="hc-icon">${wmo.icon}</div>
      <div class="hc-temp">${formatTemp(h.temperature_2m[i])}</div>`;
    scroll.appendChild(card);
  }
}

// 7 Day Forecast list card renderer
function renderForecast() {
  const grid = document.getElementById('forecastGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const d = weatherData.daily;
  d.time.forEach((date, i) => {
    const wmo = getWMO(d.weather_code[i]);
    const label = i === 0 ? 'Today' : formatDay(date);
    const card = document.createElement('div');
    card.className = 'glass-card forecast-card';
    card.innerHTML = `
      <div class="fc-day">${label}</div>
      <div class="fc-icon">${wmo.icon}</div>
      <div class="fc-temp-range">
        <span class="fc-max">${formatTemp(d.temperature_2m_max[i])}</span>
        <span class="fc-min">${formatTemp(d.temperature_2m_min[i])}</span>
      </div>
      <div class="fc-desc">${wmo.desc}</div>`;
    grid.appendChild(card);
  });
}

// Celsius / Fahrenheit Unit Switch toggles
function switchUnit(unit) {
  if (currentUnit === unit) return;
  setUnit(unit);
  
  const btnC = document.getElementById('btnC');
  const btnF = document.getElementById('btnF');
  
  if (btnC && btnF) {
    btnC.classList.toggle('active', unit === 'C');
    btnF.classList.toggle('active', unit === 'F');
  }

  // Reload views
  renderTemp();
  renderHourly();
  renderForecast();
  
  // Re-draw graphs if active
  if (window.renderCharts) renderCharts(weatherData);
}

// Querying weather data for quick suggestions
function quickSearch(city) {
  const cityInput = document.getElementById('cityInput');
  if (cityInput) cityInput.value = city;
  doSearch(city);
}

// Navigator GPS location retrieval
function getCurrentLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'warning');
    return;
  }

  showLoader();
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        // Reverse geocoding lookup using OpenStreetMap Nominatim free API
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();
        
        const loc = {
          name: data.address.city || data.address.town || data.address.village || 'Current Location',
          country: data.address.country || '',
          admin1: data.address.state || '',
          latitude: latitude,
          longitude: longitude
        };

        fetchWeather(loc);
      } catch (err) {
        // Fallback geocoding mock name
        fetchWeather({
          name: 'My Location',
          country: '',
          latitude: latitude,
          longitude: longitude
        });
      }
    },
    (error) => {
      showToast('Unable to retrieve GPS coordinates. Please search manually.', 'warning');
      hideLoader();
    }
  );
}

// Spinner toggles
function showLoader() {
  show(document.getElementById('loader'));
  hide(document.getElementById('weatherSection'));
  hide(document.getElementById('welcomeState'));
}

function hideLoader() {
  hide(document.getElementById('loader'));
}
