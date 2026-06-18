document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard
  if (getToken()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // Login Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const submitBtn = document.getElementById('loginSubmitBtn');
    
    setButtonLoading(submitBtn, true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      setToken(data.token);
      setUser(data.user);
      
      // Update local storage preference details
      if (data.user.preferences) {
        localStorage.setItem('skypulse_unit', data.user.preferences.temperatureUnit || 'C');
        localStorage.setItem('skypulse_theme', data.user.preferences.theme || 'dark');
      }

      showToast('Welcome back to SkyPulse!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });

  // Register Form Submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('regConfirmPassword').value.trim();
    const submitBtn = document.getElementById('registerSubmitBtn');

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'warning');
      return;
    }

    setButtonLoading(submitBtn, true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setToken(data.token);
      setUser(data.user);
      
      if (data.user.preferences) {
        localStorage.setItem('skypulse_unit', data.user.preferences.temperatureUnit || 'C');
        localStorage.setItem('skypulse_theme', data.user.preferences.theme || 'dark');
      }

      showToast('Account created successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
});

// Tab switching login ↔ register
function switchTab(type) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const authTabs = document.getElementById('authTabs');
  const authToggleText = document.getElementById('authToggleText');

  if (type === 'login') {
    show(loginForm);
    hide(registerForm);
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    authTabs.classList.remove('register-active');
    authToggleText.innerHTML = `Don't have an account? <a href="#" onclick="switchTab('register'); return false;">Register here</a>`;
  } else {
    hide(loginForm);
    show(registerForm);
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    authTabs.classList.add('register-active');
    authToggleText.innerHTML = `Already have an account? <a href="#" onclick="switchTab('login'); return false;">Login here</a>`;
  }
}

// Password visibility toggler
function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  if (field.type === 'password') {
    field.type = 'text';
  } else {
    field.type = 'password';
  }
}

function setButtonLoading(btn, isLoading) {
  const span = btn.querySelector('span');
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalText = span.textContent;
    span.textContent = 'Please wait...';
  } else {
    btn.disabled = false;
    span.textContent = btn.dataset.originalText || 'Submit';
  }
}
