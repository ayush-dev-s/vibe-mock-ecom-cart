const axios = require('axios')
const db = require('../db')

const selectAll = db.prepare('SELECT id, name, price FROM products ORDER BY name')
const insertOne = db.prepare('INSERT OR REPLACE INTO products (id, name, price) VALUES (@id, @name, @price)')

async function ensureProducts() {
  const existing = selectAll.all()
  if (existing.length > 0) return existing

  let mapped
  try {
    const { data } = await axios.get('https://fakestoreapi.com/products', { timeout: 5000 })
    mapped = (data || []).map((p) => ({ id: `fs-${p.id}`, name: p.title, price: Number(p.price) }))
  } catch (err) {
    console.warn('Falling back to local mock products due to fetch failure:', err.message)
    // Use local mock data as a fallback when external API is unavailable
    // Data already in desired shape: { id, name, price }
    // eslint-disable-next-line global-require
    const local = require('../data/products')
    mapped = local
  }

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insertOne.run(row)
  })
  insertMany(mapped)
  return selectAll.all()
}

async function getProducts() {
  return ensureProducts()
}

function findProduct(id) {
  return db.prepare('SELECT id, name, price FROM products WHERE id = ?').get(id)
}

module.exports = { getProducts, findProduct }
