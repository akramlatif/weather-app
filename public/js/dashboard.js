document.addEventListener('DOMContentLoaded', () => {
  // 1. Authenticate check on enter
  if (!getToken()) {
    window.location.href = '/';
    return;
  }

  // Load user data in header
  const user = getUser();
  if (user) {
    if (user.profilePicture) {
      document.getElementById('headerAvatar').src = user.profilePicture;
    }
    // Set active unit button based on cache preferences
    const unit = localStorage.getItem('skypulse_unit') || 'C';
    setUnit(unit);
    document.getElementById('btnC').classList.toggle('active', unit === 'C');
    document.getElementById('btnF').classList.toggle('active', unit === 'F');
  }

  // Fetch saved favorite list mapping on startup
  loadFavorites().then(() => {
    // If favorite pins need to load on map load
    if (leafletMap) refreshMapFavoritePins();
  });

  // Load history records
  loadSearchHistory();

  // Initialize interactive map layer
  initMap();

  // 2. Navigation bar sidebar clicks handler
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Toggle sidebar active color lists
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetSectionId = link.dataset.section;
      switchSectionView(targetSectionId);

      // Mobile close menu overlay helper
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebarOverlay');
      if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      }
    });
  });
});

// View Section visibility switcher
function switchSectionView(sectionId) {
  const sections = ['weather', 'favorites', 'history', 'map', 'charts', 'insights'];
  
  sections.forEach(id => {
    const el = document.getElementById(`${id}Section`);
    if (el) {
      if (id === sectionId) {
        show(el);
        hide(document.getElementById('welcomeState'));
      } else {
        hide(el);
      }
    }
  });

  // Special triggers on tab focus
  if (sectionId === 'map') {
    handleMapContainerResize();
    refreshMapFavoritePins();
  } else if (sectionId === 'charts' && weatherData) {
    renderCharts(weatherData);
  } else if (sectionId === 'favorites') {
    loadFavorites();
  } else if (sectionId === 'history') {
    loadSearchHistory();
  } else if (sectionId === 'insights' && weatherData) {
    generateInsights(weatherData, airQualityData);
  }
}

// Sidebars menu slider toggles for mobile view
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (sidebar && overlay) {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

// Clear account caches and redirect to register
function logoutUser() {
  removeToken();
  removeUser();
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = '/';
  }, 800);
}
