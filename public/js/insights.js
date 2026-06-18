// Smart Weather Insights Engine
function generateInsights(weather, aqi) {
  if (!weather) return;

  const current = weather.current;
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;
  
  // Calculate average rain probability in next 6 hours
  const hourly = weather.hourly;
  const now = new Date();
  let startIdx = hourly.time.findIndex(t => new Date(t) >= now);
  if (startIdx < 0) startIdx = 0;
  
  const daily = weather.daily;
  const uvIndex = daily.uv_index_max[0];
  const precipitationSum = daily.precipitation_sum[0];

  // 1. Generate clothing recommendations
  const clothing = getClothingSuggestion(temp, precipitationSum, wind, uvIndex);
  document.getElementById('clothingText').textContent = clothing.text;
  document.querySelector('#clothingInsight .insight-icon').textContent = clothing.icon;

  // 2. Generate activity / travel recommendations
  const travel = getTravelRecommendation(temp, precipitationSum, wind, uvIndex, current.visibility);
  document.getElementById('travelText').textContent = travel.text;
  document.querySelector('#travelInsight .insight-icon').textContent = travel.icon;

  // 3. Generate warning alerts
  const alerts = getWeatherAlerts(weather, aqi);
  const alertsText = document.getElementById('alertsText');
  const alertCard = document.getElementById('weatherAlertsInsight');
  
  if (alerts.length > 0) {
    alertsText.innerHTML = `<ul>${alerts.map(a => `<li>${a}</li>`).join('')}</ul>`;
    alertCard.classList.remove('alert-warning', 'alert-danger');
    // Color code based on severity
    if (alerts.some(a => a.includes('Storm') || a.includes('Extreme'))) {
      alertCard.classList.add('alert-danger');
    } else {
      alertCard.classList.add('alert-warning');
    }
  } else {
    alertsText.textContent = 'Weather is stable. No severe warnings or alerts for this location.';
    alertCard.classList.remove('alert-warning', 'alert-danger');
  }

  // 4. Generate daily summary text
  const summary = getDailySummary(weather, locationData);
  document.getElementById('summaryText').textContent = summary;
}

// Clothing selection logic
function getClothingSuggestion(temp, precipitationSum, wind, uvIndex) {
  let text = '';
  let icon = '👕';

  if (temp < 0) {
    text = 'Extreme cold temperatures detected! Dress in heavy winter clothing (coat, gloves, scarf, thermal layers) to stay warm.';
    icon = '🧥';
  } else if (temp >= 0 && temp < 12) {
    text = 'Chilly weather. Wearing a thick jacket, coat or heavy sweater is recommended, along with long pants.';
    icon = '🧥';
  } else if (temp >= 12 && temp < 20) {
    text = 'Mild and comfortable temperatures. A light jacket, cardigans, sweatshirt or long sleeve shirt is perfect.';
    icon = '🧤';
  } else if (temp >= 20 && temp < 30) {
    text = 'Warm and pleasant. Regular t-shirts, light shirts, and shorts or cotton pants are suitable.';
    icon = '👕';
  } else {
    text = 'Hot weather conditions! Wear very light, loose-fitting cotton clothing. Keep hydrated and try to stay in the shade.';
    icon = '🩳';
  }

  // Overlap rainfall check
  if (precipitationSum > 1) {
    text += ' Rain detected or highly likely, so carry an umbrella or wear a waterproof raincoat.';
    icon = '☂️';
  }

  // Sun Protection check
  if (uvIndex > 6) {
    text += ' High UV levels today. Wear sunglasses, a sun hat, and apply sunscreen protection before going outside.';
  }

  return { text, icon };
}

// Travel and outdoor index scoring
function getTravelRecommendation(temp, rain, wind, uv, visibility) {
  let score = 100;
  let reasons = [];

  // Weather scoring factors
  if (temp < 5 || temp > 35) {
    score -= 20;
    reasons.push(temp < 5 ? 'cold temps' : 'extreme heat');
  }
  if (rain > 5) {
    score -= 30;
    reasons.push('heavy rainfall');
  } else if (rain > 1) {
    score -= 15;
    reasons.push('light rain probability');
  }
  if (wind > 40) {
    score -= 25;
    reasons.push('strong winds');
  }
  if (visibility && visibility < 5000) {
    score -= 20;
    reasons.push('poor visibility');
  }
  if (uv > 8) {
    score -= 10;
    reasons.push('high UV radiation');
  }

  let text = '';
  let icon = '✈️';

  if (score >= 80) {
    text = `Excellent conditions for travel and outdoor activities (Score: ${score}/100). Clear visibility and pleasant conditions overall. Enjoy your day!`;
    icon = '☀️';
  } else if (score >= 60 && score < 80) {
    text = `Good conditions (Score: ${score}/100), but expect minor interruptions from ${reasons.join(', ')}. Outdoor plans are completely fine with basic precautions.`;
    icon = '⛅';
  } else if (score >= 40 && score < 60) {
    text = `Fair conditions (Score: ${score}/100). Travel with caution as you may encounter issues like ${reasons.join(' and ')}. Carrying appropriate gear is advised.`;
    icon = '☁️';
  } else {
    text = `Poor conditions for travel (Score: ${score}/100). Postponing non-essential outdoor trips is suggested due to severe elements like ${reasons.join(', ')}.`;
    icon = '🌪️';
  }

  return { text, icon };
}

// Generate Warning Messages
function getWeatherAlerts(weather, aqi) {
  const alerts = [];
  const current = weather.current;
  const daily = weather.daily;

  // Temperature alert check
  if (current.temperature_2m < 0) {
    alerts.push('<b>Extreme Cold:</b> Freezing temperatures. Watch out for black ice on roads.');
  } else if (current.temperature_2m > 38) {
    alerts.push('<b>Extreme Heat Warning:</b> Heat wave risk. Stay indoor in cooled spaces.');
  }

  // Wind speed alert check
  if (current.wind_speed_10m > 50) {
    alerts.push('<b>Severe Wind Warning:</b> Gale-force wind gusts detected. Watch for falling tree branches.');
  }

  // Storm/Thunderstorm code check
  const code = current.weather_code;
  if (code >= 95 && code <= 99) {
    alerts.push('<b>Severe Thunderstorm Alert:</b> Lightning strikes and possible hail in the area. Find solid shelter.');
  } else if (code === 82) {
    alerts.push('<b>Extreme Precipitation:</b> Torrential rain downpours. High flash flooding risk.');
  }

  // UV Warning check
  if (daily.uv_index_max[0] >= 8) {
    alerts.push(`<b>Extreme UV Index (${daily.uv_index_max[0]}):</b> Skin damage can occur rapidly. Avoid midday sun.`);
  }

  // Air Quality Warning check
  if (aqi && aqi > 75) {
    alerts.push(`<b>Poor Air Quality Alert (${aqi} AQI):</b> Sensitive groups (asthma, heart issues) should limit outdoor exposure.`);
  }

  return alerts;
}

// Natural weather summary
function getDailySummary(weather, loc) {
  const current = weather.current;
  const daily = weather.daily;
  const wmo = getWMO(current.weather_code);
  const maxTemp = formatTemp(daily.temperature_2m_max[0]);
  const minTemp = formatTemp(daily.temperature_2m_min[0]);
  
  let summary = `Weather in ${loc.name} is currently ${wmo.desc.toLowerCase()} with a temperature of ${formatTemp(current.temperature_2m)}. `;
  summary += `For the rest of today, temperatures are forecasted to peak at a high of ${maxTemp} and drop to a cool low of ${minTemp} overnight. `;
  
  if (daily.precipitation_probability_max[0] > 30) {
    summary += `There is a significant (${daily.precipitation_probability_max[0]}%) chance of rainfall today. `;
  } else {
    summary += `Expect dry conditions with very minimal chance of precipitation. `;
  }

  summary += `Winds will be blowing at about ${Math.round(current.wind_speed_10m)} km/h. `;
  
  return summary;
}
