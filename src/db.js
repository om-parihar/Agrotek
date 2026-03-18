const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function ensureDbInitialized() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) return;

  const now = new Date();
  const iso = (d) => new Date(d).toISOString();

  // Demo users (for hackathon/demo). Change/remove for production.
  const demoFarmerId = 'usr_demo_farmer';
  const demoBuyerId = 'usr_demo_buyer';
  const demoAdminId = 'usr_demo_admin';

  const demoPasswordHash = bcrypt.hashSync('Password@123', 10);

  const initial = {
    users: [
      {
        id: demoFarmerId,
        name: 'Ramesh (Demo Farmer)',
        email: 'farmer@demo.com',
        passwordHash: demoPasswordHash,
        role: 'farmer',
        language: 'en',
        notificationPrefs: { inApp: true, email: false, sms: false },
        createdAt: iso(now)
      },
      {
        id: demoBuyerId,
        name: 'Asha (Demo Buyer)',
        email: 'buyer@demo.com',
        passwordHash: demoPasswordHash,
        role: 'buyer',
        language: 'en',
        notificationPrefs: { inApp: true, email: false, sms: false },
        createdAt: iso(now)
      },
      {
        id: demoAdminId,
        name: 'Admin (Demo)',
        email: 'admin@demo.com',
        passwordHash: demoPasswordHash,
        role: 'admin',
        language: 'en',
        notificationPrefs: { inApp: true, email: false, sms: false },
        createdAt: iso(now)
      }
    ],
    notifications: [
      {
        id: 'ntf_welcome_farmer',
        userId: demoFarmerId,
        title: 'Welcome to Agrotek',
        body: 'List your crops in Marketplace and get buyer interest notifications.',
        type: 'info',
        meta: null,
        createdAt: iso(now),
        readAt: null
      },
      {
        id: 'ntf_welcome_buyer',
        userId: demoBuyerId,
        title: 'Welcome to Agrotek',
        body: 'Browse fresh listings and contact farmers using “I’m interested”.',
        type: 'info',
        meta: null,
        createdAt: iso(now),
        readAt: null
      }
    ],
    marketplace: {
      listings: [
        {
          id: 'lst_seed_1',
          sellerId: demoFarmerId,
          title: 'Fresh Tomatoes (Grade A)',
          crop: 'Tomato',
          location: 'Nashik, Maharashtra',
          price: 28,
          unit: 'kg',
          quantity: 450,
          description: 'Harvested today. Sweet taste, good shelf-life. Available for pickup or local delivery.',
          status: 'active',
          createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 6))
        },
        {
          id: 'lst_seed_2',
          sellerId: demoFarmerId,
          title: 'Premium Onions (Storage Ready)',
          crop: 'Onion',
          location: 'Pune, Maharashtra',
          price: 22,
          unit: 'kg',
          quantity: 900,
          description: 'Dry, storage-ready onions. Suitable for wholesalers and retailers.',
          status: 'active',
          createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 14))
        },
        {
          id: 'lst_seed_3',
          sellerId: demoFarmerId,
          title: 'Basmati Rice (New Crop)',
          crop: 'Rice (Basmati)',
          location: 'Karnal, Haryana',
          price: 62,
          unit: 'kg',
          quantity: 1200,
          description: 'Aromatic basmati, cleaned and packed. Bulk orders welcome.',
          status: 'active',
          createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 28))
        },
        {
          id: 'lst_seed_4',
          sellerId: demoFarmerId,
          title: 'Organic Spinach Bundles',
          crop: 'Spinach',
          location: 'Bengaluru, Karnataka',
          price: 12,
          unit: 'bundle',
          quantity: 300,
          description: 'Fresh organic spinach. Great for restaurants and retail shops.',
          status: 'active',
          createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 3))
        },
        {
          id: 'lst_seed_5',
          sellerId: demoFarmerId,
          title: 'Wheat (Dry, Cleaned)',
          crop: 'Wheat',
          location: 'Indore, Madhya Pradesh',
          price: 29,
          unit: 'kg',
          quantity: 2500,
          description: 'Dry wheat, cleaned and ready for milling. Negotiable for large quantity.',
          status: 'active',
          createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 40))
        }
      ],
      interests: []
    }
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
}

function readDb() {
  ensureDbInitialized();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function nextId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = {
  DB_PATH,
  ensureDbInitialized,
  readDb,
  writeDb,
  nextId
};

