let userFavorites = [];

// Load favorites and render them
async function loadFavorites() {
  const container = document.getElementById('favoritesList');
  if (!container) return;
  
  container.innerHTML = '<p class="skeleton" style="height: 100px; grid-column: 1/-1;"></p>';

  try {
    const res = await apiClient('/favorites');
    userFavorites = res.data || [];
    renderFavorites(userFavorites);
  } catch (error) {
    container.innerHTML = `<p style="color: var(--danger); text-align: center; grid-column: 1/-1;">Error loading favorites: ${error.message}</p>`;
  }
}

// Render Favorite cards with live weather stats
function renderFavorites(favs) {
  const container = document.getElementById('favoritesList');
  if (!container) return;

  if (favs.length === 0) {
    container.innerHTML = `<p style="color: var(--text-dim); text-align: center; grid-column: 1/-1; padding: 40px 0;">No favorite locations saved yet. Press the heart icon on any weather card to save.</p>`;
    return;
  }

  container.innerHTML = '';
  
  favs.forEach(fav => {
    const card = document.createElement('div');
    card.className = 'glass-card favorite-item animate-fade-up';
    
    // Add base info outline
    card.innerHTML = `
      <div class="fav-info" onclick="selectFavoriteCity('${fav.cityName}', ${fav.latitude}, ${fav.longitude}, '${fav.country || ''}')">
        <h3>${fav.cityName}</h3>
        <p>${fav.country || 'Unknown'}</p>
      </div>
      <div class="fav-weather" id="fav-weather-${fav._id}">
        <span class="skeleton" style="width: 50px; height: 24px; border-radius: 4px;"></span>
      </div>
      <div>
        <button class="btn btn-icon btn-remove-fav" onclick="removeFavoriteCity(event, '${fav._id}')" title="Remove favorite">🗑️</button>
      </div>`;
      
    container.appendChild(card);

    // Async query temperature details
    fetchFavoriteMiniWeather(fav);
  });
}

async function fetchFavoriteMiniWeather(fav) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${fav.latitude}&longitude=${fav.longitude}&current=temperature_2m,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();

    const wmo = getWMO(data.current.weather_code);
    const div = document.getElementById(`fav-weather-${fav._id}`);
    if (div) {
      div.innerHTML = `
        <span class="fav-temp">${formatTemp(data.current.temperature_2m)}</span>
        <span class="fav-icon">${wmo.icon}</span>`;
    }
  } catch (_) {
    const div = document.getElementById(`fav-weather-${fav._id}`);
    if (div) div.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-dim);">N/A</span>';
  }
}

// Heart icon toggles on main weather card
async function toggleFavoriteCurrentLocation() {
  if (!locationData) return;

  const heartBtn = document.getElementById('favToggleBtn');
  const cityName = locationData.name;
  
  // Find match
  const favMatch = userFavorites.find(f => f.cityName.toLowerCase() === cityName.toLowerCase());

  try {
    if (favMatch) {
      // Remove favorite
      await apiClient(`/favorites/${favMatch._id}`, { method: 'DELETE' });
      userFavorites = userFavorites.filter(f => f._id !== favMatch._id);
      showToast(`${cityName} removed from favorites.`, 'info');
    } else {
      // Add favorite
      if (userFavorites.length >= 10) {
        showToast('You cannot add more than 10 favorite cities.', 'warning');
        return;
      }

      const res = await apiClient('/favorites', {
        method: 'POST',
        body: JSON.stringify({
          cityName: locationData.name,
          country: locationData.country || '',
          latitude: locationData.latitude,
          longitude: locationData.longitude
        })
      });
      userFavorites.push(res.data);
      showToast(`${cityName} saved to favorites list!`, 'success');
    }
    
    updateFavoriteButton();
    refreshMapFavoritePins();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Update heart button look
function updateFavoriteButton() {
  const heartBtn = document.getElementById('favToggleBtn');
  if (!heartBtn || !locationData) return;

  const isFav = userFavorites.some(f => f.cityName.toLowerCase() === locationData.name.toLowerCase());
  if (isFav) {
    heartBtn.textContent = '❤️';
    heartBtn.classList.add('active');
  } else {
    heartBtn.textContent = '♡';
    heartBtn.classList.remove('active');
  }
}

// Click favorite card load handler
function selectFavoriteCity(name, lat, lon, country) {
  // Jump to weather view
  document.querySelector('[data-section="weather"]').click();
  
  fetchWeather({
    name,
    latitude: lat,
    longitude: lon,
    country
  });
}

async function removeFavoriteCity(e, favId) {
  e.stopPropagation(); // Avoid triggering card selection click
  
  try {
    await apiClient(`/favorites/${favId}`, { method: 'DELETE' });
    userFavorites = userFavorites.filter(f => f._id !== favId);
    showToast('Removed from favorites', 'info');
    
    // Refresh DOM
    renderFavorites(userFavorites);
    updateFavoriteButton();
    refreshMapFavoritePins();
  } catch (error) {
    showToast(error.message, 'error');
  }
}
