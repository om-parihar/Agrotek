document.addEventListener('DOMContentLoaded', async () => {
  AgroTechApp.requireLoginOrRedirect();

  const welcomeText = document.getElementById('welcomeText');
  const accountInfo = document.getElementById('accountInfo');
  const prefsForm = document.getElementById('prefsForm');

  let user = null;
  try {
    const me = await AgroTechApp.api('/api/me');
    user = me.user;
  } catch {
    AgroTechApp.clearSession();
    window.location.href = 'login.html';
    return;
  }

  if (welcomeText) welcomeText.textContent = `Welcome, ${user.name}.`;
  if (accountInfo) accountInfo.textContent = `${user.email} • ${user.role}`;

  const prefInApp = document.getElementById('prefInApp');
  const prefEmail = document.getElementById('prefEmail');
  const prefSms = document.getElementById('prefSms');
  if (user.notificationPrefs) {
    if (prefInApp) prefInApp.checked = !!user.notificationPrefs.inApp;
    if (prefEmail) prefEmail.checked = !!user.notificationPrefs.email;
    if (prefSms) prefSms.checked = !!user.notificationPrefs.sms;
  }

  if (prefsForm) {
    prefsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const data = await AgroTechApp.api('/api/me', {
          method: 'PATCH',
          body: {
            notificationPrefs: {
              inApp: !!prefInApp?.checked,
              email: !!prefEmail?.checked,
              sms: !!prefSms?.checked
            }
          }
        });
        localStorage.setItem('agrotech_user', JSON.stringify(data.user));
        alert('Saved.');
      } catch {
        alert('Could not save preferences.');
      }
    });
  }
});

