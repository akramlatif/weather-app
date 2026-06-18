// API base URL (same origin)
const API_BASE = '/api';

// Get JWT token from localStorage
function getToken() { return localStorage.getItem('skypulse_token'); }
function setToken(token) { localStorage.setItem('skypulse_token', token); }
function removeToken() { localStorage.removeItem('skypulse_token'); }

// Get stored user
function getUser() { return JSON.parse(localStorage.getItem('skypulse_user') || 'null'); }
function setUser(user) { localStorage.setItem('skypulse_user', JSON.stringify(user)); }
function removeUser() { localStorage.removeItem('skypulse_user'); }

// Authenticated fetch wrapper
async function apiClient(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) { 
      removeToken(); 
      removeUser(); 
      window.location.href = '/'; 
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

// WMO Weather codes -> emoji + description (complete mapping from original app.js)
const WMO = {
  0: {icon:'☀️', desc:'Clear sky'}, 1: {icon:'🌤️', desc:'Mainly clear'},
  2: {icon:'⛅', desc:'Partly cloudy'}, 3: {icon:'☁️', desc:'Overcast'},
  45: {icon:'🌫️', desc:'Foggy'}, 48: {icon:'🌫️', desc:'Icy fog'},
  51: {icon:'🌦️', desc:'Light drizzle'}, 53: {icon:'🌧️', desc:'Drizzle'},
  55: {icon:'🌧️', desc:'Heavy drizzle'}, 56: {icon:'🌨️', desc:'Light freezing drizzle'},
  57: {icon:'🌨️', desc:'Freezing drizzle'}, 61: {icon:'🌧️', desc:'Slight rain'},
  63: {icon:'🌧️', desc:'Rain'}, 65: {icon:'🌧️', desc:'Heavy rain'},
  66: {icon:'🌨️', desc:'Light freezing rain'}, 67: {icon:'🌨️', desc:'Freezing rain'},
  71: {icon:'❄️', desc:'Slight snow'}, 73: {icon:'❄️', desc:'Snow'},
  75: {icon:'❄️', desc:'Heavy snow'}, 77: {icon:'🌨️', desc:'Snow grains'},
  80: {icon:'🌦️', desc:'Slight showers'}, 81: {icon:'🌧️', desc:'Showers'},
  82: {icon:'⛈️', desc:'Violent showers'}, 85: {icon:'🌨️', desc:'Snow showers'},
  86: {icon:'🌨️', desc:'Heavy snow showers'}, 95: {icon:'⛈️', desc:'Thunderstorm'},
  96: {icon:'⛈️', desc:'Thunderstorm w/ hail'}, 99: {icon:'⛈️', desc:'Thunderstorm w/ heavy hail'}
};
function getWMO(code) { return WMO[code] || {icon:'🌡️', desc:'Unknown'}; }

// Temperature helpers
let currentUnit = localStorage.getItem('skypulse_unit') || 'C';
function cToF(c) { return (c * 9/5 + 32).toFixed(1); }
function formatTemp(c) {
  if (currentUnit === 'C') return `${Math.round(c)}°C`;
  return `${Math.round(cToF(c))}°F`;
}
function setUnit(unit) { currentUnit = unit; localStorage.setItem('skypulse_unit', unit); }

// Date/time formatting
function formatDay(dateStr, short = true) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: short ? 'short' : 'long' });
}
function formatHour(isoStr) {
  const d = new Date(isoStr);
  let h = d.getHours(); const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12; return `${h} ${ampm}`;
}
function formatDateTime(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds/3600)}h ago`;
  return `${Math.floor(seconds/86400)}d ago`;
}

// DOM helpers
function $(selector) { return document.querySelector(selector); }
function $$(selector) { return document.querySelectorAll(selector); }
function show(el) { if (el) el.classList.remove('hidden'); }
function hide(el) { if (el) el.classList.add('hidden'); }

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => { 
    toast.classList.remove('toast-show'); 
    setTimeout(() => toast.remove(), 300); 
  }, duration);
}

function createToastContainer() {
  const c = document.createElement('div'); c.className = 'toast-container';
  document.body.appendChild(c); return c;
}

// UV Index level helper
function getUVLevel(uv) {
  if (uv <= 2) return { level: 'Low', color: 'var(--success)' };
  if (uv <= 5) return { level: 'Moderate', color: 'var(--warning)' };
  if (uv <= 7) return { level: 'High', color: '#ff8c00' };
  if (uv <= 10) return { level: 'Very High', color: 'var(--danger)' };
  return { level: 'Extreme', color: '#9b59b6' };
}

// AQI level helper (European AQI from Open-Meteo)
function getAQILevel(aqi) {
  if (aqi <= 20) return { level: 'Good', color: 'var(--success)' };
  if (aqi <= 40) return { level: 'Fair', color: '#a3d977' };
  if (aqi <= 60) return { level: 'Moderate', color: 'var(--warning)' };
  if (aqi <= 80) return { level: 'Poor', color: '#ff8c00' };
  if (aqi <= 100) return { level: 'Very Poor', color: 'var(--danger)' };
  return { level: 'Hazardous', color: '#9b59b6' };
}

// Wind direction from degrees
function getWindDirection(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Format sunrise/sunset time
function formatSunTime(isoStr) {
  return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
