document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        const data = await AgroTechApp.api('/api/auth/login', {
          method: 'POST',
          body: { email, password }
        });
        AgroTechApp.setSession(data);
        window.location.href = 'dashboard.html';
      } catch (err) {
        alert('Login failed. Please check your credentials.');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('regEmail').value;
      const password = document.getElementById('regPassword').value;
      const role = document.getElementById('role').value;
      const language = AgroTechApp.getLang();
      try {
        const data = await AgroTechApp.api('/api/auth/register', {
          method: 'POST',
          body: { name, email, password, role, language }
        });
        AgroTechApp.setSession(data);
        window.location.href = 'dashboard.html';
      } catch (err) {
        if (err?.data?.error === 'email_exists') {
          alert('This email is already registered. Please login.');
        } else {
          alert('Registration failed. Please try again.');
        }
      }
    });
  }
});

