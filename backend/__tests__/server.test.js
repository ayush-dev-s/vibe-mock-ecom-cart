process.env.DB_PATH = ':memory:'
const request = require('supertest')
const app = require('../server')

describe('API', () => {
  it('GET /api/products returns products (from Fake Store or cache)', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('Cart CRUD works', async () => {
    const products = await request(app).get('/api/products')
    const first = products.body[0]

    const add = await request(app).post('/api/cart').send({ productId: first.id, qty: 2 })
    expect(add.status).toBe(201)
    expect(add.body.items.length).toBe(1)

    const itemId = add.body.items[0].id
    const patch = await request(app).patch(`/api/cart/${itemId}`).send({ qty: 3 })
    expect(patch.status).toBe(200)
    expect(patch.body.items[0].qty).toBe(3)

    const del = await request(app).delete(`/api/cart/${itemId}`)
    expect(del.status).toBe(200)
    expect(del.body.items.length).toBe(0)
  })
})
