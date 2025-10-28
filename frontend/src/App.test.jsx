import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

vi.mock('./api', () => ({
  getProducts: async () => [],
  getCart: async () => ({ items: [], total: 0 }),
  addToCart: async () => ({}),
  removeFromCart: async () => ({}),
  setCartQty: async () => ({}),
  checkout: async () => ({ receipt: { id: 'test', total: 0 } }),
}))

it('renders Products header', async () => {
  render(<App />)
  expect(await screen.findByText(/Products/i)).toBeInTheDocument()
})
