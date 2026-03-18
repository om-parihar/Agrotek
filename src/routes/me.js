const express = require('express');
const { requireAuth } = require('../auth');
const { readDb, writeDb } = require('../db');

const meRouter = express.Router();

meRouter.get('/', requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.auth.sub);
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      notificationPrefs: user.notificationPrefs
    }
  });
});

meRouter.patch('/', requireAuth, (req, res) => {
  const db = readDb();
  const user = db.users.find((u) => u.id === req.auth.sub);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const language = req.body?.language;
  const notificationPrefs = req.body?.notificationPrefs;

  if (language && typeof language === 'string') user.language = language;
  if (notificationPrefs && typeof notificationPrefs === 'object') {
    user.notificationPrefs = {
      ...user.notificationPrefs,
      ...notificationPrefs
    };
  }

  writeDb(db);
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      language: user.language,
      notificationPrefs: user.notificationPrefs
    }
  });
});

module.exports = { meRouter };

