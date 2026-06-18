let tempChartInstance = null;
let humidityChartInstance = null;
let windChartInstance = null;
let weeklyChartInstance = null;

// Initialize and render all Chart.js visualizations
function renderCharts(data) {
  if (!data) return;

  const hourly = data.hourly;
  const daily = data.daily;
  
  // Setup Chart global configuration styling defaults
  Chart.defaults.font.family = "'Outfit', sans-serif";
  Chart.defaults.color = getComputedStyle(document.documentElement).getPropertyValue('--text-dim').trim() || '#888';

  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(255,255,255,0.08)';
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6c8cff';
  const accentRGB = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '108, 140, 255';
  const accent2Color = getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim() || '#a78bfa';

  // Get next 24 Hours slice
  const now = new Date();
  let startIdx = hourly.time.findIndex(t => new Date(t) >= now);
  if (startIdx < 0) startIdx = 0;
  const length = 24;

  const labels = hourly.time.slice(startIdx, startIdx + length).map(t => formatHour(t));
  const tempValues = hourly.temperature_2m.slice(startIdx, startIdx + length).map(t => {
    return currentUnit === 'F' ? Math.round(cToF(t)) : Math.round(t);
  });
  const humidityValues = hourly.relative_humidity_2m.slice(startIdx, startIdx + length);
  const windValues = hourly.wind_speed_10m.slice(startIdx, startIdx + length);

  // Destroy existing charts to prevent canvas re-use errors
  if (tempChartInstance) tempChartInstance.destroy();
  if (humidityChartInstance) humidityChartInstance.destroy();
  if (windChartInstance) windChartInstance.destroy();
  if (weeklyChartInstance) weeklyChartInstance.destroy();

  // 1. Temperature Trend Line Chart
  const ctxTemp = document.getElementById('tempChart').getContext('2d');
  const tempGradient = ctxTemp.createLinearGradient(0, 0, 0, 300);
  tempGradient.addColorStop(0, `rgba(${accentRGB}, 0.3)`);
  tempGradient.addColorStop(1, `rgba(${accentRGB}, 0.0)`);

  tempChartInstance = new Chart(ctxTemp, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Temperature (°${currentUnit})`,
        data: tempValues,
        borderColor: accentColor,
        borderWidth: 3,
        fill: true,
        backgroundColor: tempGradient,
        tension: 0.4,
        pointBackgroundColor: accentColor,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
        y: { grid: { color: gridColor }, ticks: { callback: value => `${value}°` } }
      }
    }
  });

  // 2. Humidity Bar Chart
  const ctxHum = document.getElementById('humidityChart').getContext('2d');
  humidityChartInstance = new Chart(ctxHum, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Humidity (%)',
        data: humidityValues,
        backgroundColor: 'rgba(56, 189, 248, 0.45)',
        borderColor: 'var(--accent-3)',
        borderWidth: 1.5,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
        y: { grid: { color: gridColor }, max: 100, ticks: { callback: value => `${value}%` } }
      }
    }
  });

  // 3. Wind Speed line plot
  const ctxWind = document.getElementById('windChart').getContext('2d');
  windChartInstance = new Chart(ctxWind, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Wind Speed (km/h)',
        data: windValues,
        borderColor: accent2Color,
        borderWidth: 2.5,
        borderDash: [5, 5],
        tension: 0.3,
        fill: false,
        pointBackgroundColor: accent2Color
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
        y: { grid: { color: gridColor }, ticks: { callback: value => `${value} km/h` } }
      }
    }
  });

  // 4. Weekly forecasts Max/Min temps grouped bar chart
  const weeklyLabels = daily.time.map(t => formatDay(t));
  const weeklyMax = daily.temperature_2m_max.map(t => {
    return currentUnit === 'F' ? Math.round(cToF(t)) : Math.round(t);
  });
  const weeklyMin = daily.temperature_2m_min.map(t => {
    return currentUnit === 'F' ? Math.round(cToF(t)) : Math.round(t);
  });

  const ctxWeekly = document.getElementById('weeklyChart').getContext('2d');
  weeklyChartInstance = new Chart(ctxWeekly, {
    type: 'bar',
    data: {
      labels: weeklyLabels,
      datasets: [
        {
          label: 'Max Temp',
          data: weeklyMax,
          backgroundColor: 'rgba(248, 113, 113, 0.6)',
          borderColor: 'var(--danger)',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Min Temp',
          data: weeklyMin,
          backgroundColor: 'rgba(108, 140, 255, 0.6)',
          borderColor: 'var(--accent)',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top', labels: { boxWidth: 12 } } },
      scales: {
        x: { grid: { color: gridColor } },
        y: { grid: { color: gridColor }, ticks: { callback: value => `${value}°` } }
      }
    }
  });
}

// Chart tab switcher logic
function switchChartTab(tab) {
  const tabs = ['temp', 'humidity', 'wind'];
  
  // Update tab buttons active classes
  const tabBtns = document.querySelectorAll('.chart-tab-btn');
  tabBtns.forEach((btn, idx) => {
    btn.classList.toggle('active', tabs[idx] === tab);
  });

  // Toggle canvas elements
  tabs.forEach(t => {
    const canvas = document.getElementById(`${t}Chart`);
    if (canvas) {
      if (t === tab) {
        show(canvas);
      } else {
        hide(canvas);
      }
    }
  });
}
