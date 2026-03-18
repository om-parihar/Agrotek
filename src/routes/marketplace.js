const express = require('express');
const { requireAuth, requireRole } = require('../auth');
const { readDb, writeDb, nextId } = require('../db');
const { pushNotification } = require('./notifications');

const marketplaceRouter = express.Router();

marketplaceRouter.get('/listings', (req, res) => {
  const db = readDb();
  const q = String(req.query?.q || '').trim().toLowerCase();
  let listings = db.marketplace.listings.filter((l) => l.status === 'active');
  if (q) {
    listings = listings.filter((l) =>
      [l.title, l.crop, l.location, l.description].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }
  listings = listings.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return res.json({ listings });
});

marketplaceRouter.post('/listings', requireAuth, requireRole('farmer', 'admin'), (req, res) => {
  const title = String(req.body?.title || '').trim();
  const crop = String(req.body?.crop || '').trim();
  const location = String(req.body?.location || '').trim();
  const price = Number(req.body?.price);
  const unit = String(req.body?.unit || '').trim() || 'kg';
  const quantity = Number(req.body?.quantity);
  const description = String(req.body?.description || '').trim();

  if (!title || !crop || !location) return res.status(400).json({ error: 'missing_fields' });
  if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ error: 'invalid_price' });
  if (!Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ error: 'invalid_quantity' });

  const db = readDb();
  const listing = {
    id: nextId('lst'),
    sellerId: req.auth.sub,
    title,
    crop,
    location,
    price,
    unit,
    quantity,
    description,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  db.marketplace.listings.push(listing);

  // Notify all buyers (simple hackathon-style broadcast)
  const buyers = db.users.filter((u) => u.role === 'buyer');
  for (const buyer of buyers) {
    pushNotification(db, {
      userId: buyer.id,
      title: 'New marketplace listing',
      body: `${listing.crop}: ${listing.title} (${listing.price}/${listing.unit}) in ${listing.location}`,
      type: 'marketplace',
      meta: { listingId: listing.id }
    });
  }

  writeDb(db);
  return res.json({ listing });
});

marketplaceRouter.post('/listings/:id/interest', requireAuth, requireRole('buyer', 'admin'), (req, res) => {
  const listingId = String(req.params.id);
  const message = String(req.body?.message || '').trim();
  const qty = req.body?.quantity == null ? null : Number(req.body.quantity);

  const db = readDb();
  const listing = db.marketplace.listings.find((l) => l.id === listingId && l.status === 'active');
  if (!listing) return res.status(404).json({ error: 'not_found' });

  const interest = {
    id: nextId('int'),
    listingId,
    buyerId: req.auth.sub,
    sellerId: listing.sellerId,
    message,
    quantity: Number.isFinite(qty) && qty > 0 ? qty : null,
    createdAt: new Date().toISOString()
  };
  db.marketplace.interests.push(interest);

  pushNotification(db, {
    userId: listing.sellerId,
    title: 'Buyer is interested',
    body: `Someone is interested in "${listing.title}". ${message ? `Message: ${message}` : ''}`,
    type: 'marketplace',
    meta: { listingId: listing.id, interestId: interest.id }
  });

  writeDb(db);
  return res.json({ ok: true });
});

module.exports = { marketplaceRouter };

