document.addEventListener('DOMContentLoaded', async () => {
  const listingsEl = document.getElementById('listings');
  const noListings = document.getElementById('noListings');
  const searchBox = document.getElementById('searchBox');
  const searchBtn = document.getElementById('searchBtn');

  const createCard = document.getElementById('createListingCard');
  const createForm = document.getElementById('createListingForm');

  let user = AgroTechApp.getCachedUser();
  if (AgroTechApp.getToken() && !user) {
    try {
      const me = await AgroTechApp.api('/api/me');
      user = me.user;
    } catch {}
  }

  const canCreate = user?.role === 'farmer' || user?.role === 'admin';
  if (createCard) createCard.style.display = canCreate ? 'block' : 'none';

  async function loadListings() {
    const q = (searchBox?.value || '').trim();
    const data = await AgroTechApp.api(`/api/marketplace/listings${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    const listings = data.listings || [];
    if (!listings.length) {
      if (noListings) noListings.style.display = 'block';
      if (listingsEl) listingsEl.innerHTML = '';
      return;
    }
    if (noListings) noListings.style.display = 'none';
    if (!listingsEl) return;
    listingsEl.innerHTML = '';

    for (const l of listings) {
      const card = document.createElement('div');
      card.className = 'article-card';
      const interestBtn = AgroTechApp.getToken() ? `<button class="btn btn-primary" style="padding: 8px 14px; font-size: 0.9rem;">I'm interested</button>` : `<a class="btn btn-primary" style="padding: 8px 14px; font-size: 0.9rem;" href="login.html">Login to contact</a>`;
      card.innerHTML = `
        <div class="article-content">
          <h3>${escapeHtml(l.title)}</h3>
          <p><strong>${escapeHtml(l.crop)}</strong> • ${escapeHtml(l.location)}</p>
          <p>${escapeHtml(l.description || '')}</p>
          <div style="display:flex; gap: 12px; align-items:center; justify-content: space-between; flex-wrap: wrap;">
            <small style="color: var(--light-text);">${Number(l.price).toLocaleString()} / ${escapeHtml(l.unit)} • Qty ${Number(l.quantity).toLocaleString()}</small>
            <div class="interest-area">${interestBtn}</div>
          </div>
        </div>
      `;

      const btn = card.querySelector('button');
      if (btn) {
        btn.addEventListener('click', async () => {
          if (!AgroTechApp.getToken()) {
            window.location.href = 'login.html';
            return;
          }
          const message = prompt('Message to seller (optional):', 'Hi, I am interested in your listing.');
          try {
            await AgroTechApp.api(`/api/marketplace/listings/${encodeURIComponent(l.id)}/interest`, {
              method: 'POST',
              body: { message: message || '' }
            });
            alert('Sent! The seller will receive a notification.');
          } catch (e) {
            if (e?.status === 403) alert('Only buyers can send interest requests.');
            else alert('Could not send interest. Try again.');
          }
        });
      }

      listingsEl.appendChild(card);
    }
  }

  if (searchBtn) searchBtn.addEventListener('click', loadListings);
  if (searchBox) searchBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadListings();
  });

  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      AgroTechApp.requireLoginOrRedirect();
      try {
        const body = {
          title: document.getElementById('lstTitle').value,
          crop: document.getElementById('lstCrop').value,
          location: document.getElementById('lstLocation').value,
          price: Number(document.getElementById('lstPrice').value),
          unit: document.getElementById('lstUnit').value,
          quantity: Number(document.getElementById('lstQty').value),
          description: document.getElementById('lstDesc').value
        };
        await AgroTechApp.api('/api/marketplace/listings', { method: 'POST', body });
        createForm.reset();
        await loadListings();
        alert('Listing published.');
      } catch (e) {
        if (e?.status === 403) alert('Only farmers can create listings.');
        else alert('Could not publish listing. Check fields and try again.');
      }
    });
  }

  await loadListings();
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text || '');
  return div.innerHTML;
}

