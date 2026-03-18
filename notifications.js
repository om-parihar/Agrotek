document.addEventListener('DOMContentLoaded', async () => {
  AgroTechApp.requireLoginOrRedirect();

  const listEl = document.getElementById('notificationsList');
  const emptyState = document.getElementById('emptyState');

  let data;
  try {
    data = await AgroTechApp.api('/api/notifications');
  } catch {
    AgroTechApp.clearSession();
    window.location.href = 'login.html';
    return;
  }

  const notifications = data.notifications || [];
  if (!notifications.length) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (!listEl) return;
  listEl.innerHTML = '';
  for (const n of notifications) {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <div class="article-content">
        <h3>${escapeHtml(n.title)}</h3>
        <p>${escapeHtml(n.body)}</p>
        <div style="display:flex; gap: 12px; align-items:center; justify-content: space-between;">
          <small style="color: var(--light-text);">${new Date(n.createdAt).toLocaleString()}</small>
          ${n.readAt ? '<small style="color: var(--light-text);">Read</small>' : '<button class="btn btn-primary" style="padding: 8px 14px; font-size: 0.9rem;">Mark read</button>'}
        </div>
      </div>
    `;
    const btn = card.querySelector('button');
    if (btn) {
      btn.addEventListener('click', async () => {
        try {
          await AgroTechApp.api('/api/notifications/mark-read', { method: 'POST', body: { id: n.id } });
          btn.remove();
        } catch {
          alert('Could not mark as read.');
        }
      });
    }
    listEl.appendChild(card);
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text || '');
  return div.innerHTML;
}

