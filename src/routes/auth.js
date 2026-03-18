const express = require('express');
const bcrypt = require('bcryptjs');
const { readDb, writeDb, nextId } = require('../db');
const { signToken } = require('../auth');

const authRouter = express.Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

authRouter.post('/register', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  const role = String(req.body?.role || '').trim() || 'farmer';
  const language = String(req.body?.language || '').trim() || 'en';

  if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' });
  if (!['farmer', 'buyer', 'admin'].includes(role)) return res.status(400).json({ error: 'invalid_role' });
  if (password.length < 6) return res.status(400).json({ error: 'weak_password' });

  const db = readDb();
  const exists = db.users.some((u) => u.email === email);
  if (exists) return res.status(409).json({ error: 'email_exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nextId('usr'),
    name,
    email,
    passwordHash,
    role,
    language,
    notificationPrefs: {
      inApp: true,
      email: false,
      sms: false
    },
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  writeDb(db);

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, language: user.language }
  });
});

authRouter.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });

  const db = readDb();
  const user = db.users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

  const token = signToken(user);
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, language: user.language }
  });
});

module.exports = { authRouter };

