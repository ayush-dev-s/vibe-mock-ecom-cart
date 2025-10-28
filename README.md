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

If ports are busy or you see 403 from a non-Express server, try:

```
# Backend on alternative port
PORT=5050 npm run server:start

# Frontend pointing to backend directly (bypasses proxy)
printf "VITE_API_URL=http://127.0.0.1:5050/api\n" > frontend/.env.development
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5175
# open http://127.0.0.1:5175
```

## Scripts

- Lint: `npm run lint`
- Tests: `npm run test` | Watch: `npm run test:watch` | Coverage: `npm run coverage`
- Frontend only: `npm --prefix frontend run dev` | Backend only: `npm --prefix backend run dev`

## Environment

- `PORT` (backend, default 5000)
- `DB_PATH` (SQLite path; default `backend/data/app.db`). For tests, an in-memory DB is used automatically.
- `VITE_API_URL` (frontend, optional). If set, axios will call this base URL (e.g. `http://127.0.0.1:5050/api`). If unset, Vite dev proxy forwards `/api` to the backend.

## Architecture

- Backend
  - `backend/server.js`: Express app (exports `app`). Dev CORS is permissive to ease local iteration.
  - `backend/db.js`: SQLite init and schema (users, products, cart_items).
  - `backend/services/products.js`: Fetches from Fake Store API and caches in DB; falls back to local mock products if external API is unavailable.
  - Mock user `u1` persisted in DB; cart is per-user and survives restarts.
- Frontend
  - `frontend/src/App.jsx`: product list and cart UI; calls `/api` via `frontend/src/api.js`.
  - Vite proxy forwards `/api` to backend in dev and preview; or set `VITE_API_URL` to bypass proxy.

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

## Troubleshooting
- 403 with `Server: AirTunes` or similar: another service is bound on the default ports. Use the alternative port recipe above (`PORT=5050` + `VITE_API_URL=http://127.0.0.1:5050/api`).
- CORS error in browser: prefer the default Vite proxy (no CORS). If calling backend directly, ensure backend is running and `VITE_API_URL` points to it.
- Blank page when opening `index.html`: don’t open static file directly; run the dev server (`npm run dev`).
