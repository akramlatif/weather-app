let leafletMap = null;
let mapMarker = null;
let favoritePins = [];

// Initialize Leaflet Map
function initMap() {
  if (leafletMap !== null) return;

  const mapContainer = document.getElementById('mapContainer');
  if (!mapContainer) return;

  // Center on global coords
  leafletMap = L.map('mapContainer').setView([20.0, 0.0], 2);

  // Add free OSM standard map tiles layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(leafletMap);

  // Set click handler on map grid coordinates
  leafletMap.on('click', onMapGridClick);
}

// Adjust map view and slide marker node
function updateMapLocation(lat, lon, cityName) {
  initMap();
  if (!leafletMap) return;

  // Zoom to destination
  leafletMap.setView([lat, lon], 10);

  if (mapMarker) {
    mapMarker.setLatLng([lat, lon]);
  } else {
    mapMarker = L.marker([lat, lon]).addTo(leafletMap);
  }

  mapMarker.bindPopup(`<b>${cityName}</b><br>Currently Selected`).openPopup();
  
  // Reload all favorites markers
  refreshMapFavoritePins();
}

// Click anywhere on map to fetch weather for coordinates
async function onMapGridClick(e) {
  const { lat, lng } = e.latlng;

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const data = await res.json();
    
    const loc = {
      name: data.address.city || data.address.town || data.address.village || 'Queried Coords',
      country: data.address.country || '',
      admin1: data.address.state || '',
      latitude: lat,
      longitude: lng
    };
    
    // Switch to weather dashboard view and fetch
    document.querySelector('[data-section="weather"]').click();
    fetchWeather(loc);
  } catch (_) {
    showToast('Failed to identify location from click coords', 'warning');
  }
}

// Draw heart icons on all saved locations on the interactive map
function refreshMapFavoritePins() {
  if (!leafletMap) return;

  // Remove existing favorite pins
  favoritePins.forEach(pin => leafletMap.removeLayer(pin));
  favoritePins = [];

  // Call API for saved favorites list
  apiClient('/favorites')
    .then(res => {
      const favs = res.data || [];
      favs.forEach(fav => {
        // Skip current selected node marker overlap
        if (locationData && Math.abs(fav.latitude - locationData.latitude) < 0.01 && Math.abs(fav.longitude - locationData.longitude) < 0.01) {
          return;
        }

        const marker = L.marker([fav.latitude, fav.longitude], {
          icon: L.divIcon({
            html: '❤️',
            className: 'custom-fav-pin',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        }).addTo(leafletMap);

        marker.bindPopup(`<b>${fav.cityName}</b><br><a href="#" onclick="quickSearch('${fav.cityName}'); return false;">Click to view weather</a>`);
        favoritePins.push(marker);
      });
    })
    .catch(() => {});
}

// Handle layout visibility trigger redraw
function handleMapContainerResize() {
  if (leafletMap) {
    setTimeout(() => {
      leafletMap.invalidateSize();
    }, 200);
  }
}
