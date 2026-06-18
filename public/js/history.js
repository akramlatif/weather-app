// Fetch search history records from API and display
async function loadSearchHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;

  container.innerHTML = '<p class="skeleton" style="height: 100px;"></p>';

  try {
    const res = await apiClient('/history');
    renderSearchHistory(res.data || []);
  } catch (error) {
    container.innerHTML = `<p style="color: var(--danger); text-align: center;">Error loading history: ${error.message}</p>`;
  }
}

// Display search logs
function renderSearchHistory(items) {
  const container = document.getElementById('historyList');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `<p style="color: var(--text-dim); text-align: center; padding: 40px 0;">Your search history is empty.</p>`;
    return;
  }

  container.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'glass-card history-item animate-fade-up';
    div.innerHTML = `
      <div class="hist-left">
        <span class="hist-icon">🕒</span>
        <span class="hist-name">${item.cityName}</span>
        <span class="hist-country">${item.country || ''}</span>
      </div>
      <div class="hist-time">${timeAgo(item.searchedAt)}</div>`;

    // Click handler to re-query
    div.addEventListener('click', () => {
      document.querySelector('[data-section="weather"]').click();
      fetchWeather({
        name: item.cityName,
        country: item.country,
        latitude: item.latitude,
        longitude: item.longitude
      });
    });

    container.appendChild(div);
  });
}

// Clear history
async function clearSearchHistory() {
  try {
    await apiClient('/history', { method: 'DELETE' });
    showToast('Search history cleared.', 'success');
    renderSearchHistory([]);
  } catch (error) {
    showToast(error.message, 'error');
  }
}
