# PizzaHub

PizzaHub is a full-stack pizza ordering and POS web app with a customer storefront and an admin back office.

- Live paths (localhost): customer app at `frontend/dist/index.html`, admin at `frontend/dist/index.html#/admin/login`
- Client setup guide: see [SETUP.md](SETUP.md)

## Tech Stack
- Frontend: React (Vite), React Router, Lucide icons, CSS (custom)
- Backend: PHP (procedural), MySQL
- Build: Vite

## Key Features
- Customer: browse menu, size selection modal, cart, checkout, auth, order success flow
- Admin: auth, dashboard stats, products/categories CRUD, orders, POS, reports, customers, profile/settings
- Theming: shared light/dark support (document data-theme)

## Project Structure (top-level)
- `frontend/` React app (source in `src/`, build output in `dist/`)
- `backend/` PHP endpoints for customer/admin
- `database/` SQL dumps (`pizzahub_db.sql`, optional sample orders)
- `SETUP.md` docs

## Development (maintainers)
From `frontend/`:
- Install deps: `npm install`
- Dev server: `npm run dev -- --host`
- Build: `npm run build`

Backend runs via Apache/PHP in XAMPP; API base is `http://localhost/PizzaHub/backend`.

## Deployment / Delivery Notes
- For client localhost delivery, ship the built `frontend/dist/` and point the browser to `http://localhost/PizzaHub/frontend/dist/index.html` (see [SETUP.md](SETUP.md)).
- `.htaccess` in `frontend/dist/` provides SPA fallback for deep links.

## Environment / Config
- DB credentials: `backend/admin/config.php`
- API URLs: hardcoded to `http://localhost/PizzaHub/backend` in frontend services/components.

## Credentials
- Default admin credentials depend on the imported DB. Sample seed often uses `admin` / `admin123`.
