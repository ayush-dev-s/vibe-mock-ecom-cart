import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

export const getProducts = async () => (await api.get('/products')).data
export const getCart = async () => (await api.get('/cart')).data
export const addToCart = async (productId, qty = 1) => (await api.post('/cart', { productId, qty })).data
export const removeFromCart = async (id) => (await api.delete(`/cart/${id}`)).data
export const setCartQty = async (id, qty) => (await api.patch(`/cart/${id}`, { qty })).data
export const checkout = async (customer) => (await api.post('/checkout', customer)).data