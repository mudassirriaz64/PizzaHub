# Setup (Client)

These instructions are for the client to run PizzaHub locally on Windows without installing Node.

## Prereqs
- XAMPP with Apache and MySQL running
- Browser

## Files you received
- The entire `PizzaHub` folder containing:
  - `backend/` (PHP API)
  - `database/` (SQL dumps)
  - `frontend/` with built assets in `frontend/dist/`
  - `SETUP.md`

## Steps
1) Place folder: copy `PizzaHub` to `C:\xampp\htdocs\PizzaHub`.
2) Start services: open XAMPP Control Panel, start **Apache** and **MySQL**.
3) Create database:
   - Open phpMyAdmin (http://localhost/phpmyadmin).
   - Create database `pizzahub` (utf8mb4).
4) Import data:
   - Import `database/pizzahub_db.sql`.
   - (Optional) Import `database/sample_pakistani_orders.sql` for demo orders.
5) Configure backend DB credentials:
   - Edit `backend/admin/config.php` and set DB host, username, password, and database name (e.g., `pizzahub`).
6) Open the site:
    - Go to `http://localhost/PizzaHub/`
    - Admin: `http://localhost/PizzaHub/admin/login`

## Notes
- All API calls expect the backend at `http://localhost/PizzaHub/backend`.
- If you move the folder, keep paths consistent or update URLs in the frontend build accordingly.
- If refreshing deep links shows 404, the provided `.htaccess` in `frontend/dist/` handles SPA fallback.
- Default admin credentials are whatever you set in the database (sample: `admin` / `admin123` if present).
