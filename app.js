// AgroTech app layer: auth, roles, i18n, notifications, marketplace UI glue.

const AgroTechApp = (() => {
  const STORAGE_TOKEN = 'agrotech_token';
  const STORAGE_USER = 'agrotech_user';
  const STORAGE_LANG = 'agrotech_lang';

  const SUPPORTED_LANGS = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' }
  ];

  const translations = {
    en: {
      nav_home: 'Home',
      nav_solutions: 'Solutions',
      nav_products: 'Products',
      nav_resources: 'Resources',
      nav_about: 'About Us',
      nav_contact: 'Contact',
      nav_ai: 'AI Assistant',
      nav_more: 'More',
      nav_marketplace: 'Marketplace',
      nav_dashboard: 'Dashboard',
      nav_notifications: 'Notifications',
      nav_login: 'Login',
      nav_logout: 'Logout',
      role_farmer: 'Farmer',
      role_buyer: 'Buyer',
      role_admin: 'Admin'
    },
    hi: {
      nav_home: 'होम',
      nav_solutions: 'समाधान',
      nav_products: 'उत्पाद',
      nav_resources: 'संसाधन',
      nav_about: 'हमारे बारे में',
      nav_contact: 'संपर्क',
      nav_ai: 'एआई सहायक',
      nav_more: 'और',
      nav_marketplace: 'मार्केटप्लेस',
      nav_dashboard: 'डैशबोर्ड',
      nav_notifications: 'सूचनाएँ',
      nav_login: 'लॉगिन',
      nav_logout: 'लॉगआउट',
      role_farmer: 'किसान',
      role_buyer: 'खरीदार',
      role_admin: 'एडमिन'
    }
  };

  function getLang() {
    return localStorage.getItem(STORAGE_LANG) || 'en';
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_LANG, lang);
    applyI18n();
  }

  function t(key) {
    const lang = getLang();
    return translations[lang]?.[key] || translations.en[key] || key;
  }

  function applyI18n() {
    const lang = getLang();
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      el.textContent = t(key);
    });
  }

  function getToken() {
    return localStorage.getItem(STORAGE_TOKEN);
  }

  function setSession({ token, user }) {
    localStorage.setItem(STORAGE_TOKEN, token);
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    if (user?.language) setLang(user.language);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
  }

  function getCachedUser() {
    try {
      const raw = localStorage.getItem(STORAGE_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async function api(path, { method = 'GET', body = null } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error || 'request_failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function enhanceNav() {
    const navMenu = document.getElementById('navMenu');
    if (!navMenu) return;

    // i18n: tag existing links if they match known hrefs
    const hrefToKey = new Map([
      ['index.html', 'nav_home'],
      ['solutions.html', 'nav_solutions'],
      ['products.html', 'nav_products'],
      ['resources.html', 'nav_resources'],
      ['about.html', 'nav_about'],
      ['contact.html', 'nav_contact'],
      ['chatbot.html', 'nav_ai']
    ]);

    // Rebuild nav so only the requested items stay visible.
    const PRIMARY_HREFS = ['index.html', 'solutions.html', 'products.html', 'resources.html', 'about.html', 'chatbot.html'];

    const existingLinks = Array.from(navMenu.querySelectorAll('a[href]')).map((a) => ({
      href: a.getAttribute('href'),
      text: a.textContent || '',
      el: a
    }));

    // Tag i18n on existing anchors (before we move them around)
    existingLinks.forEach(({ href, el }) => {
      const key = hrefToKey.get(href);
      if (key) el.setAttribute('data-i18n', key);
    });

    const liForHref = (href, fallbackText) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      const key = hrefToKey.get(href);
      if (key) a.setAttribute('data-i18n', key);
      a.textContent = key ? t(key) : fallbackText;
      li.appendChild(a);
      return li;
    };

    // Gather "other" items from existing HTML (ex: Contact) to put into More
    const existingOther = existingLinks
      .filter((x) => x.href && !PRIMARY_HREFS.includes(x.href))
      .map((x) => x.href);

    // Build fresh nav list
    navMenu.innerHTML = '';

    // Primary items
    for (const href of PRIMARY_HREFS) {
      navMenu.appendChild(liForHref(href, href));
    }

    // More dropdown
    const moreLi = document.createElement('li');
    moreLi.className = 'nav-more';
    moreLi.innerHTML = `
      <button type="button" class="more-toggle" id="moreToggle" data-i18n="nav_more">${t('nav_more')}</button>
      <div class="more-menu" id="moreMenu" role="menu" aria-label="More menu">
        <a role="menuitem" href="contact.html" data-i18n="nav_contact">${t('nav_contact')}</a>
        <div class="more-sep"></div>
        <a role="menuitem" href="marketplace.html" data-i18n="nav_marketplace">${t('nav_marketplace')}</a>
        <a role="menuitem" href="notifications.html" data-i18n="nav_notifications">${t('nav_notifications')}</a>
        <a role="menuitem" href="dashboard.html" data-i18n="nav_dashboard">${t('nav_dashboard')}</a>
        <div class="more-sep"></div>
        <a role="menuitem" href="login.html" id="authMenuLink" data-i18n="nav_login">${t('nav_login')}</a>
        <a role="menuitem" href="firebase-register.html" id="registerMenuLink">Register</a>
        <div class="more-sep"></div>
        <div class="more-lang">
          <label class="more-label">Language</label>
          <select id="langSelect" class="lang-select" aria-label="Language selector"></select>
        </div>
      </div>
    `;
    navMenu.appendChild(moreLi);

    // Fill language options
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.innerHTML = SUPPORTED_LANGS.map((l) => `<option value="${l.code}">${l.label}</option>`).join('');
      langSelect.value = getLang();
      langSelect.addEventListener('change', async (e) => {
        const next = e.target.value;
        setLang(next);
        try {
          await api('/api/me', { method: 'PATCH', body: { language: next } });
        } catch {}
      });
    }

    // More toggle interactions
    const toggle = document.getElementById('moreToggle');
    const menu = document.getElementById('moreMenu');
    const closeMenu = () => menu?.classList.remove('open');
    const toggleMenu = () => menu?.classList.toggle('open');

    if (toggle && menu) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu();
      });
      document.addEventListener('click', (e) => {
        if (!moreLi.contains(e.target)) closeMenu();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });
    }

    // If the existing HTML had other items (besides contact) we can also include them
    // (Currently you only had Contact in HTML; app-added items are already in the menu above.)
    void existingOther;

    renderAuthNav();
  }

  function renderAuthNav() {
    const authLink = document.getElementById('authMenuLink');
    if (!authLink) return;
    const user = getCachedUser();
    if (getToken() && user) {
      authLink.setAttribute('href', '#');
      authLink.setAttribute('data-i18n', 'nav_logout');
      authLink.textContent = t('nav_logout');
      authLink.onclick = (e) => {
        e.preventDefault();
        clearSession();
        window.location.href = 'index.html';
      };
    } else {
      authLink.setAttribute('href', 'login.html');
      authLink.setAttribute('data-i18n', 'nav_login');
      authLink.textContent = t('nav_login');
      authLink.onclick = null;
    }
    applyI18n();
  }

  async function refreshMe() {
    if (!getToken()) return null;
    try {
      const data = await api('/api/me');
      localStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
      if (data.user?.language) setLang(data.user.language);
      renderAuthNav();
      return data.user;
    } catch {
      clearSession();
      renderAuthNav();
      return null;
    }
  }

  function requireLoginOrRedirect() {
    if (!getToken()) window.location.href = 'login.html';
  }

  return {
    t,
    api,
    getLang,
    setLang,
    getToken,
    setSession,
    clearSession,
    getCachedUser,
    applyI18n,
    enhanceNav,
    refreshMe,
    requireLoginOrRedirect
  };
})();

document.addEventListener('DOMContentLoaded', async () => {
  AgroTechApp.enhanceNav();
  AgroTechApp.applyI18n();
  await AgroTechApp.refreshMe();
});

