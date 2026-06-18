document.addEventListener('DOMContentLoaded', () => {
  // If not logged in, redirect to login page
  if (!getToken()) {
    window.location.href = '/';
    return;
  }

  loadUserProfile();

  const profileForm = document.getElementById('profileForm');
  const passwordForm = document.getElementById('passwordForm');

  // Profile fields submit event
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const saveBtn = document.getElementById('saveProfileBtn');

    saveBtn.disabled = true;
    saveBtn.textContent = 'Updating...';

    try {
      const data = await apiClient('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email })
      });

      setUser(data.user);
      document.getElementById('profileName').textContent = data.user.name;
      document.getElementById('profileEmail').textContent = data.user.email;
      
      showToast('Profile details updated successfully.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Changes';
    }
  });

  // Password fields submit event
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const savePassBtn = document.getElementById('savePasswordBtn');

    if (newPassword !== confirmNewPassword) {
      showToast('Passwords do not match.', 'warning');
      return;
    }

    savePassBtn.disabled = true;
    savePassBtn.textContent = 'Updating Password...';

    try {
      await apiClient('/users/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      passwordForm.reset();
      showToast('Password changed successfully.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      savePassBtn.disabled = false;
      savePassBtn.textContent = 'Update Password';
    }
  });
});

// Load and render user values
async function loadUserProfile() {
  try {
    const data = await apiClient('/auth/me');
    const user = data.user;
    
    // Sync local storage cache
    setUser(user);

    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('inputName').value = user.name;
    document.getElementById('inputEmail').value = user.email;
    
    // Avatar upload render
    if (user.profilePicture) {
      document.getElementById('profileAvatar').src = user.profilePicture;
    }

    // Set Unit buttons
    const unit = user.preferences.temperatureUnit || 'C';
    setUnit(unit);
    document.getElementById('profileBtnC').classList.toggle('active', unit === 'C');
    document.getElementById('profileBtnF').classList.toggle('active', unit === 'F');

    // Theme selector checked state
    const theme = user.preferences.theme || 'dark';
    document.getElementById('themePreferenceToggle').checked = theme === 'light';

    // Account created dates
    const createdDate = new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('memberSinceText').textContent = createdDate;

  } catch (error) {
    showToast('Failed to fetch user settings.', 'error');
  }
}

// Click camera area triggers input click
function triggerAvatarUpload() {
  document.getElementById('avatarInput').click();
}

// Handles input file change and uploads
async function handleAvatarFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('profilePicture', file);

  showToast('Uploading profile image...', 'info');

  try {
    const data = await apiClient('/users/profile/picture', {
      method: 'PUT',
      body: formData
    });

    setUser(data.user);
    // Reload image tag
    document.getElementById('profileAvatar').src = data.user.profilePicture;
    showToast('Avatar picture updated.', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Toggle units inside profile view
async function switchProfileUnit(unit) {
  setUnit(unit);
  document.getElementById('profileBtnC').classList.toggle('active', unit === 'C');
  document.getElementById('profileBtnF').classList.toggle('active', unit === 'F');

  try {
    const data = await apiClient('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({
        preferences: { temperatureUnit: unit }
      })
    });
    setUser(data.user);
    showToast(`Display unit updated to °${unit}`, 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Theme toggles in settings
async function handleThemePreferenceChange(event) {
  const selectTheme = event.target.checked ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', selectTheme);
  localStorage.setItem('skypulse_theme', selectTheme);

  try {
    const data = await apiClient('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({
        preferences: { theme: selectTheme }
      })
    });
    setUser(data.user);
    showToast(`Theme changed to ${selectTheme} mode`, 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}
