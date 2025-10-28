import { useEffect, useState } from 'react'
import './App.css'
import { getProducts, getCart, addToCart, removeFromCart, setCartQty, checkout } from './api'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [p, c] = await Promise.all([getProducts(), getCart()])
      setProducts(p)
      setCart(c)
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const onAdd = async (productId) => {
    await addToCart(productId, 1)
    const c = await getCart()
    setCart(c)
  }

  const onRemove = async (id) => {
    await removeFromCart(id)
    const c = await getCart()
    setCart(c)
  }

  const onSetQty = async (id, qty) => {
    await setCartQty(id, qty)
    const c = await getCart()
    setCart(c)
  }

  const onCheckout = async () => {
    const res = await checkout({ name: 'Demo User', email: 'demo@example.com' })
    alert(`Order placed! Receipt: ${res.receipt.id}\nTotal: $${res.receipt.total.toFixed(2)}`)
    await refresh()
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>
  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, padding: 24 }}>
      <section>
        <h1>Products</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {products.map((p) => (
            <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', padding: 12, marginBottom: 8, borderRadius: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ opacity: 0.7 }}>${p.price.toFixed(2)}</div>
              </div>
              <button onClick={() => onAdd(p.id)}>Add to cart</button>
            </li>
          ))}
        </ul>
      </section>

      <aside>
        <h1>Cart</h1>
        {cart.items.length === 0 ? (
          <div>Your cart is empty</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {cart.items.map((i) => (
              <li key={i.id} style={{ border: '1px solid #eee', padding: 12, marginBottom: 8, borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{i.product?.name}</div>
                    <div style={{ opacity: 0.7 }}>${i.product?.price.toFixed(2)}</div>
                  </div>
                  <button onClick={() => onRemove(i.id)} aria-label={`remove-${i.product?.id}`}>Remove</button>
                </div>
                <div style={{ marginTop: 8 }}>
                  Qty:{' '}
                  <input
                    type="number"
                    min={1}
                    value={i.qty}
                    onChange={(e) => onSetQty(i.id, Math.max(1, Number(e.target.value)))}
                    style={{ width: 64 }}
                  />
                  <span style={{ marginLeft: 12 }}>Line: ${i.lineTotal.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <strong>Total: ${cart.total.toFixed(2)}</strong>
          <button onClick={onCheckout} disabled={cart.items.length === 0}>Checkout</button>
        </div>
      </aside>
    </div>
  )
}

export default App
