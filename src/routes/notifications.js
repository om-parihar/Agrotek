const express = require('express');
const { requireAuth } = require('../auth');
const { readDb, writeDb, nextId } = require('../db');

const notificationsRouter = express.Router();

notificationsRouter.get('/', requireAuth, (req, res) => {
  const db = readDb();
  const list = db.notifications
    .filter((n) => n.userId === req.auth.sub)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return res.json({ notifications: list });
});

notificationsRouter.post('/mark-read', requireAuth, (req, res) => {
  const id = String(req.body?.id || '');
  if (!id) return res.status(400).json({ error: 'missing_id' });

  const db = readDb();
  const n = db.notifications.find((x) => x.id === id && x.userId === req.auth.sub);
  if (!n) return res.status(404).json({ error: 'not_found' });
  n.readAt = new Date().toISOString();
  writeDb(db);
  return res.json({ ok: true });
});

function pushNotification(db, { userId, title, body, type = 'info', meta = null }) {
  db.notifications.push({
    id: nextId('ntf'),
    userId,
    title,
    body,
    type,
    meta,
    createdAt: new Date().toISOString(),
    readAt: null
  });
}

module.exports = { notificationsRouter, pushNotification };

