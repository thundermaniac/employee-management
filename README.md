# Employee Management Dashboard (MERN)

A full-stack employee management dashboard: JWT authentication, employee CRUD,
server-side search / filtering / pagination, and an analytics view built on the
live employee data.

**Stack:** MongoDB + Mongoose · Express · React 19 (Vite) · Node.js
**UI:** Material UI v9 · Recharts · Axios · React Router v7

---

## Quick start

```bash
npm run install:all   # installs root, server and client dependencies
cp server/.env.example server/.env
npm run dev           # starts the API on :5001 and the client on :5173
```

Open <http://localhost:5173> and sign in with the seeded demo account:

| Email | Password |
| --- | --- |
| `admin@example.com` | `admin123` |

The login page has a button that fills these in for you.

### About the database

`server/.env` controls where data lives:

- **`MONGODB_URI` left empty (default)** — the server starts an in-memory
  MongoDB automatically, so the project runs with zero database setup. The same
  Mongoose models and queries are used; the data just resets on each restart.
- **`MONGODB_URI` set** — points at a real database (MongoDB Atlas or a local
  `mongod`), e.g. `mongodb://127.0.0.1:27017/employee_management`.

Either way the server seeds a demo user and 48 sample employees when the
collections are empty. `npm run seed` wipes and re-seeds on demand.

> **Note:** the API listens on **5001**, not 5000 — on macOS port 5000 is taken
> by the AirPlay Receiver.

---

## Features

### Authentication
- Login page with client-side validation (email format, password length) plus
  server-side validation via `express-validator`.
- Passwords hashed with bcrypt; JWT issued on login and stored in
  `localStorage`.
- An Axios request interceptor attaches the token to every call; a response
  interceptor catches `401`s, clears the token and returns the user to login.
- A token restored from `localStorage` is re-verified against `/api/auth/me`
  before it is trusted, so a stale token cannot render the dashboard.
- Protected routes remember the page you were headed to and send you back there
  after login. Logout is behind a confirmation dialog.

### Employee management
- Table showing name, email, department, designation, status and joining date.
- Create, edit and delete, with delete behind a confirmation dialog.
- Duplicate emails are rejected by a unique index and surfaced as a field-level
  error on the form, not just a generic message.
- Sortable columns.

### Search, filter, pagination
- Search by name or email, **debounced by 400 ms**.
- Filter by department and by status.
- All of it runs **server-side** — the API paginates, so the client never loads
  more than one page of rows. Overlapping requests are aborted so a slow earlier
  response can't overwrite a newer one.

### Analytics
- Stat cards: total, active, on leave, department count.
- Department-wise headcount (bar), status distribution (donut), monthly joins
  over the last 12 months (area), and the five most recent joiners.
- All figures come from MongoDB aggregation pipelines, not client-side counting.
- Charts follow a deliberate colour method: headcount is a single measure so it
  uses **one hue** rather than a colour per bar; status uses reserved status
  colours that are always paired with a text label, so meaning never rests on
  colour alone. The palette was checked for colour-vision-deficiency separation
  in both light and dark modes.

### Loading, error and empty states
- Skeleton rows on first load; a thin progress bar on refetches so the table
  doesn't flash.
- API failures render a retry block; an unreachable server says so explicitly.
- Distinct empty states for "no employees yet" and "nothing matches your
  filters" — the latter offers to clear them.

### Extras
- Light **and** dark theme with a toggle, persisted to `localStorage`.
- Responsive: the sidebar collapses to a drawer, cards stack, and the table
  scrolls inside its own container instead of pushing the page wide.

---

## API

All `/api/employees` routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in, returns `{ token, user }` |
| `GET` | `/api/auth/me` | Verify token, returns the current user |
| `GET` | `/api/employees` | List — `search`, `department`, `status`, `page`, `limit`, `sortBy`, `order` |
| `POST` | `/api/employees` | Create |
| `GET` | `/api/employees/:id` | Fetch one |
| `PUT` | `/api/employees/:id` | Update |
| `DELETE` | `/api/employees/:id` | Delete |
| `GET` | `/api/employees/analytics/summary` | Aggregated dashboard figures |
| `GET` | `/api/meta` | Department and status options for the dropdowns |
| `GET` | `/api/health` | Health check (unauthenticated) |

---

## Project structure

```
employee-management/
├── server/
│   └── src/
│       ├── config/db.js            # Mongo connection + in-memory fallback
│       ├── models/                 # User, Employee (Mongoose schemas)
│       ├── middleware/             # JWT guard, validation, error handling
│       ├── controllers/            # Auth and employee logic
│       ├── routes/                 # Route definitions + validators
│       ├── utils/                  # Seed data and seed CLI
│       └── index.js                # App entry point
└── client/
    └── src/
        ├── api/                    # Axios instance, interceptors, endpoints
        ├── context/                # AuthContext, ColorModeContext
        ├── hooks/                  # useEmployees, useDebounce
        ├── components/             # Layout, table, forms, shared UI
        ├── pages/                  # Login, Analytics, Employees, 404
        ├── utils/                  # Formatting, chart palette
        └── theme.js                # MUI theme (light + dark)
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run install:all` | Install dependencies for root, server and client |
| `npm run dev` | Run API and client together |
| `npm run dev:server` | API only (`http://localhost:5001`) |
| `npm run dev:client` | Client only (`http://localhost:5173`) |
| `npm run seed` | Wipe and re-seed the database |
| `npm run build` | Production build of the client |
