const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');
const db = require('./db');
const { getProducts, findProduct } = require('./services/products');

const app = express();
const corsOptions = {
  // In dev, allow any origin so the frontend can run on any localhost port/host
  origin: (origin, cb) => cb(null, true),
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Mock user handling (single default user persisted in DB)
const ensureDefaultUser = () => {
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get('u1');
  if (user) return user;
  db.prepare('INSERT INTO users (id, name, email) VALUES (?, ?, ?)').run('u1', 'Demo User', 'demo@example.com');
  return { id: 'u1', name: 'Demo User', email: 'demo@example.com' };
};

const defaultUser = () => ensureDefaultUser();

const buildCartResponse = (userId) => {
  const rows = db.prepare(`
    SELECT ci.id as id, ci.qty as qty, p.id as productId, p.name as name, p.price as price
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY p.name
  `).all(userId);
  const items = rows.map((r) => ({
    id: r.id,
    product: { id: r.productId, name: r.name, price: r.price },
    qty: r.qty,
    lineTotal: r.price * r.qty,
  }));
  const total = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, total };
};

// Centralized error handler
function asyncWrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.get('/api/products', asyncWrap(async (req, res) => {
  const products = await getProducts();
  res.json(products);
}));

app.get('/api/cart', (req, res) => {
  const user = defaultUser();
  res.json(buildCartResponse(user.id));
});

app.post('/api/cart', asyncWrap(async (req, res) => {
  const user = defaultUser();
  const { productId, qty } = req.body || {};
  if (!productId || typeof qty !== 'number' || qty <= 0) {
    return res.status(400).json({ error: 'Invalid payload. Expect { productId, qty > 0 }' });
  }
  const product = findProduct(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const existing = db.prepare('SELECT id, qty FROM cart_items WHERE user_id = ? AND product_id = ?').get(user.id, productId);
  if (existing) {
    db.prepare('UPDATE cart_items SET qty = qty + ? WHERE id = ?').run(qty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (id, user_id, product_id, qty) VALUES (?, ?, ?, ?)')
      .run(randomUUID(), user.id, productId, qty);
  }
  res.status(201).json(buildCartResponse(user.id));
}));

app.delete('/api/cart/:id', (req, res) => {
  const user = defaultUser();
  const { id } = req.params;
  const result = db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(id, user.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Cart item not found' });
  }
  res.json(buildCartResponse(user.id));
});

app.patch('/api/cart/:id', (req, res) => {
  const user = defaultUser();
  const { id } = req.params;
  const { qty } = req.body || {};
  if (typeof qty !== 'number' || qty <= 0) return res.status(400).json({ error: 'qty must be > 0' });
  const exists = db.prepare('SELECT id FROM cart_items WHERE id = ? AND user_id = ?').get(id, user.id);
  if (!exists) return res.status(404).json({ error: 'Cart item not found' });
  db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(qty, id);
  res.json(buildCartResponse(user.id));
});

app.post('/api/checkout', (req, res) => {
  const user = defaultUser();
  const { name = '', email = '' } = req.body || {};
  const snapshot = buildCartResponse(user.id);
  const receipt = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    total: snapshot.total,
    items: snapshot.items,
    customer: { name, email },
  };
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.id);
  res.status(201).json({ receipt });
});

// Error middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
}

module.exports = app;
