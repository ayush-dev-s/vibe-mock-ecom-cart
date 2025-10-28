# Mock E-Com Cart (Vibe Commerce Internship Assignment)

[![CI](https://github.com/ayush-dev-s/vibe-mock-ecom-cart/actions/workflows/ci.yml/badge.svg)](https://github.com/ayush-dev-s/vibe-mock-ecom-cart/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-20.x-43853d?logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-7-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/express-5-black?logo=express&logoColor=white)

A minimal, production-ready full-stack shopping cart app.

- Backend: Node + Express, SQLite persistence (better-sqlite3), Fake Store API products, centralized error handling
- Frontend: React (Vite), REST integration, responsive UI, interactive cart
- APIs: GET /api/products, GET/POST/DELETE/PATCH /api/cart, POST /api/checkout

## Quick start

1) Install deps

```
npm run install:all
```

2) Run dev (starts server :5000 and client :5173 with proxy)

```
npm run dev
```

Open http://localhost:5173

## Scripts

- Lint: `npm run lint`
- Tests: `npm run test` | Watch: `npm run test:watch` | Coverage: `npm run coverage`
- Frontend only: `npm --prefix frontend run dev` | Backend only: `npm --prefix backend run dev`

## Environment

- `PORT` (backend, default 5000)
- `DB_PATH` (SQLite path; default `backend/data/app.db`). For tests, an in-memory DB is used automatically.

## Architecture

- Backend
  - `backend/server.js`: Express app (exports `app`).
  - `backend/db.js`: SQLite init and schema (users, products, cart_items).
  - `backend/services/products.js`: Fetches from Fake Store API and caches in DB.
  - Mock user `u1` persisted in DB; cart is per-user and survives restarts.
- Frontend
  - `frontend/src/App.jsx`: product list and cart UI; calls `/api` via `frontend/src/api.js`.
  - Vite proxy forwards `/api` to backend in dev and preview.

## Screenshots

Screenshots (place under `docs/screenshots/`):

- UI – Products list
  ![Products](docs/screenshots/products.png)
- Cart with items and totals
  ![Cart](docs/screenshots/cart.png)
- Checkout success (receipt ID)
  ![Checkout](docs/screenshots/checkout.png)

## Testing

- Backend: Jest + Supertest (`backend/__tests__/`) – example covers products and cart CRUD
- Frontend: Vitest + React Testing Library – example test in `frontend/src/App.test.jsx`

## Notes
- Checkout returns a mock receipt and empties the cart for the mock user.
- Products are cached from Fake Store API on first request and then served from SQLite.
