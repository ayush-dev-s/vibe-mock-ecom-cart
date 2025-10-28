# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands you’ll use often

- Install dependencies
  ```sh path=null start=null
  npm run install:all
  ```
- Run both backend (Express) and frontend (Vite) in dev (with Vite proxy to backend)
  ```sh path=null start=null
  npm run dev
  ```
- Backend only (dev) / backend (prod)
  ```sh path=null start=null
  npm --prefix backend run dev
  npm --prefix backend run start
  ```
- Frontend only (dev) / build / preview built app
  ```sh path=null start=null
  npm --prefix frontend run dev
  npm --prefix frontend run build
  npm --prefix frontend run preview
  ```
- Combined start (backend prod + frontend dev)
  ```sh path=null start=null
  npm run start
  ```
- Lint (root alias to frontend lint)
  ```sh path=null start=null
  npm run lint
  ```
- Tests (root commands)
  ```sh path=null start=null
  npm run test         # run backend (Jest) + frontend (Vitest)
  npm run test:watch   # watch mode both
  npm run coverage     # coverage both
  ```
- Run a single test
  ```sh path=null start=null
  npm --prefix frontend run test -- -t "renders"            # by test name
  npm --prefix backend run test -- __tests__/server.test.js  # by file
  ```

## High-level architecture and structure

- Repository layout
  - Root `package.json` orchestrates concurrent processes and aliases common scripts; app deps live under `backend/` and `frontend/`.

- Backend (Node + Express)
  - Entrypoint: `backend/server.js`; exported `app` for testing; server listens only when run directly.
  - Data: Products fetched from Fake Store API and cached in SQLite (`better-sqlite3`) via `backend/db.js` and `backend/services/products.js`.
  - State: Cart items persisted per mock user (`u1`) in SQLite; cleared on checkout.
  - Middleware: `cors()`, `express.json()`, centralized error handler.
  - Routes
    - GET `/api/products` → list products (cached from Fake Store)
    - GET `/api/cart` → derived cart `{ items: [{ id, product, qty, lineTotal }], total }`
    - POST `/api/cart` → add/increment item: expects `{ productId, qty > 0 }`
    - PATCH `/api/cart/:id` → set qty (> 0) on a cart line
    - DELETE `/api/cart/:id` → remove a cart line
    - POST `/api/checkout` → returns receipt `{ id, timestamp, total, items, customer }` and empties cart
  - Env: `DB_PATH` (default `backend/data/app.db`), `PORT` (default 5000).
  - Tests: Jest + Supertest in `backend/__tests__/`; run via `npm --prefix backend run test`.

- Frontend (React + Vite)
  - Entrypoint: `frontend/src/main.jsx`; app root `frontend/src/App.jsx`.
  - ESLint via `frontend/eslint.config.js`.
  - Dev proxy: Vite proxies `/api` to `http://localhost:5000` in dev and preview.
  - Testing: Vitest + RTL with JSDOM; setup at `frontend/src/test/setup.js`.

## Notes from README

- Dev workflow is split between backend (http://localhost:5000) and frontend (http://localhost:5173).
- Cart is intentionally in-memory and resets on server restart; APIs reflect simple CRUD + checkout flow.
- Future improvements listed: persistence (SQLite/MongoDB), external products API, unit/integration tests.
