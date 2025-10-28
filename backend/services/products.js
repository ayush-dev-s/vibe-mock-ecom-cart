const axios = require('axios')
const db = require('../db')

const selectAll = db.prepare('SELECT id, name, price FROM products ORDER BY name')
const insertOne = db.prepare('INSERT OR REPLACE INTO products (id, name, price) VALUES (@id, @name, @price)')

async function ensureProducts() {
  const existing = selectAll.all()
  if (existing.length > 0) return existing
  const { data } = await axios.get('https://fakestoreapi.com/products')
  const mapped = (data || []).map((p) => ({ id: `fs-${p.id}`, name: p.title, price: Number(p.price) }))
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