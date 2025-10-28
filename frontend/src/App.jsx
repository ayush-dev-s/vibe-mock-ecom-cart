import { useEffect, useState } from 'react'
import './index.css'
import { getProducts, getCart, addToCart, removeFromCart, setCartQty, checkout } from './api'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [name, setName] = useState('Demo User')
  const [email, setEmail] = useState('demo@example.com')

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

  const onCheckout = async (e) => {
    e?.preventDefault()
    const res = await checkout({ name, email })
    alert(`Order placed!\nReceipt: ${res.receipt.id}\nTotal: $${res.receipt.total.toFixed(2)}`)
    setShowCheckout(false)
    await refresh()
  }

  const isLoading = loading

  return (
    <div className="container">
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '.5rem .75rem', borderRadius: 8, marginBottom: '.75rem' }}>
          {error}
        </div>
      )}
      <header className="header" style={{ marginBottom: '1rem' }}>
        <div className="brand">Vibe Shop</div>
        <nav>
          <span className="muted">Items: {cart.items.length}</span>
          <span className="muted">Total: ${cart.total.toFixed(2)}</span>
        </nav>
      </header>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <section>
          <h1>Products</h1>
          <div className="grid">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card" aria-busy="true">
                    <div className="prod">
                      <div className="prod-name" style={{ width: '60%', background: '#eee', height: 16 }} />
                      <div className="price" style={{ width: 60, background: '#eee', height: 16 }} />
                    </div>
                    <div style={{ height: 32, background: '#f2f2f2', borderRadius: 6 }} />
                  </div>
                ))
              : products.map((p) => (
                  <article key={p.id} className="card">
                    <div className="prod">
                      <div className="prod-name">{p.name}</div>
                      <div className="price">${p.price.toFixed(2)}</div>
                    </div>
                    <button onClick={() => onAdd(p.id)} className="primary">Add to cart</button>
                  </article>
                ))}
          </div>
        </section>

        <aside>
          <h1>Cart</h1>
          {isLoading ? (
            <div className="cart-list">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="cart-row">
                  <div className="grow">
                    <span className="prod-name" style={{ width: '70%', background: '#eee', height: 16 }} />
                    <span className="muted" style={{ width: 80, background: '#f2f2f2', height: 14 }} />
                  </div>
                  <div className="qty">
                    <span className="muted">Qty</span>
                    <input disabled value={1} />
                  </div>
                  <div className="line-total" style={{ width: 60, background: '#eee', height: 16 }} />
                  <button className="danger" disabled>Remove</button>
                </div>
              ))}
              <div className="cart-total">Total: $0.00</div>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="muted">Your cart is empty</div>
          ) : (
            <div className="cart-list">
              {cart.items.map((i) => (
                <div key={i.id} className="cart-row">
                  <div className="grow">
                    <span className="prod-name">{i.product?.name}</span>
                    <span className="muted">${i.product?.price.toFixed(2)}</span>
                  </div>
                  <div className="qty">
                    <span className="muted">Qty</span>
                    <input
                      type="number"
                      min={1}
                      value={i.qty}
                      onChange={(e) => onSetQty(i.id, Math.max(1, Number(e.target.value)))}
                    />
                  </div>
                  <div className="line-total">${i.lineTotal.toFixed(2)}</div>
                  <button onClick={() => onRemove(i.id)} aria-label={`remove-${i.product?.id}`} className="danger">Remove</button>
                </div>
              ))}
              <div className="cart-total">Total: ${cart.total.toFixed(2)}</div>
              <div className="checkout-cta">
                <button onClick={() => setShowCheckout(true)} disabled={cart.items.length === 0} className="primary">Checkout</button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {showCheckout && (
        <div className="modal-backdrop" onClick={() => setShowCheckout(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Checkout</h2>
            <form className="checkout-form" onSubmit={onCheckout}>
              <label>
                <span>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label>
                <span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <div className="actions">
                <button type="button" onClick={() => setShowCheckout(false)}>Cancel</button>
                <button type="submit" className="primary">Place order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
