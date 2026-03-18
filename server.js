const express = require('express');
const path = require('path');

const { ensureDbInitialized } = require('./src/db');
const { authRouter } = require('./src/routes/auth');
const { meRouter } = require('./src/routes/me');
const { notificationsRouter } = require('./src/routes/notifications');
const { marketplaceRouter } = require('./src/routes/marketplace');

const app = express();
const PORT = process.env.PORT || 3000;

ensureDbInitialized();

app.use(express.json({ limit: '1mb' }));

// API routes
app.get('/api/health', (req, res) => res.json({ ok: true }));
console.log('API routes registered');
app.use('/api/auth', authRouter);
app.use('/api/me', meRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/marketplace', marketplaceRouter);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
