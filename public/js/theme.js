// Load and initialize theme on startup
(function initTheme() {
  const savedTheme = localStorage.getItem('skypulse_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
  updateThemeToggleIcon();
});

// Switch themes between Light and Dark
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Apply smooth transition style temporarily
  document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('skypulse_theme', newTheme);

  updateThemeToggleIcon();

  // Save preference on the backend database if logged in
  if (getToken()) {
    apiClient('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({
        preferences: { theme: newTheme }
      })
    })
    .then(data => {
      // Sync local cache
      setUser(data.user);
    })
    .catch(() => {}); // silent fail, fallback to localStorage
  }
}

// Update sun/moon icon indicators on header toggler button
function updateThemeToggleIcon() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;
  const currentTheme = document.documentElement.getAttribute('data-theme');
  toggleBtn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}
