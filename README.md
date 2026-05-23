# Issue Tracker

A full-stack issue tracking application built on a modern **Nx monorepo** architecture. The frontend is a React 18 + Vite SPA using Zustand for state management; the backend is a TypeScript Express REST API persisted by MongoDB (Mongoose). Shared TypeScript types are published from an internal library so that the client and server stay in sync.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Project Structure](#project-structure)
6. [Setup Instructions](#setup-instructions)
7. [Environment Variables](#environment-variables)
8. [Usage](#usage)
9. [Available Scripts](#available-scripts)
10. [API Reference](#api-reference)
11. [Dependencies](#dependencies)
12. [Testing the API (Postman)](#testing-the-api-postman)
13. [Deployment](#deployment)

---

## Architecture

```
issue-tracker/
├── apps/
│   ├── frontend/       React 18 + Vite + TypeScript + Tailwind CSS
│   └── backend/        Express.js + TypeScript + MongoDB (Mongoose)
└── libs/
    └── shared-types/   Shared TypeScript interfaces (Issue, User, Auth)
```

The frontend talks to the backend over a versioned REST API (`/api/...`). JWT tokens are stored on the client and forwarded via an Axios interceptor on every request.

---

## Features

- User registration and login with JWT authentication
- Dashboard with issue status counts (Open, In Progress, Resolved, Closed)
- Full CRUD operations for issues with ownership-based authorization
- Search with debounce optimization (400ms)
- Filter by status and priority with custom dropdown components
- Server-side pagination
- Status / priority / severity indicators with color-coded badges
- CSV export for issue data
- Confirmation modals for destructive actions (resolve, close, delete)
- Responsive design — sidebar navigation (desktop) and card layout (mobile)
- Protected routes with automatic 401 redirect
- Shared TypeScript types between frontend and backend

---

## Tech Stack

| Layer       | Technology                                                            |
| ----------- | --------------------------------------------------------------------- |
| Frontend    | React 18, Vite 6, TypeScript, Tailwind CSS 4, Zustand, React Router 6 |
| Backend     | Express.js, TypeScript, Mongoose ODM                                  |
| Database    | MongoDB (Atlas or local)                                              |
| Auth        | JWT (`jsonwebtoken`), `bcryptjs`                                      |
| HTTP Client | Axios                                                                 |
| Monorepo    | Nx Workspace 20                                                       |

---

## Prerequisites

Make sure the following are installed and available on your `PATH`:

| Tool    | Minimum Version | Notes                                                       |
| ------- | --------------- | ----------------------------------------------------------- |
| Node.js | 18.x            | 20.x LTS recommended                                        |
| npm     | 9.x             | Comes with Node.js                                          |
| MongoDB | 6.x             | Use either a local instance or a free MongoDB Atlas cluster |
| Git     | any             | For cloning the repository                                  |

Optional:

- **Nx CLI** (global) — `npm i -g nx` lets you run `nx ...` directly. Otherwise use `npx nx ...`.
- **Postman** — for exercising the API using the included collection.

---

## Project Structure

### Frontend (`apps/frontend/`)

```
src/
├── api/            Axios instance + API service functions
├── assets/         SVG illustrations
├── components/
│   ├── common/     Button, Input, Modal, Spinner, EmptyState
│   ├── issues/     IssueForm, FilterBar, Table, Card, Badges
│   └── layout/     Sidebar, Layout, PageHeader
├── pages/          Route page components
├── routes/         ProtectedRoute guard
├── store/          Zustand stores (auth, issues)
├── types/          Re-exports from shared-types
└── utils/          debounce, formatDate, exportCsv, issueOwnership
```

### Backend (`apps/backend/`)

```
src/
├── config/         MongoDB connection
├── controllers/    Auth + Issue controllers
├── middleware/     JWT auth, error handling
├── models/         Mongoose schemas (User, Issue)
├── routes/         Express routers
├── types/          Express request type augmentation
└── utils/          JWT token generator
```

### Shared Types (`libs/shared-types/`)

Centralised TypeScript interfaces (`Issue`, `User`, auth payloads) consumed by both apps to guarantee request / response shape parity.

---

## Setup Instructions

### 1. Clone and install dependencies

```bash
git clone <your-repo-url> issue-tracker
cd issue-tracker
npm install
```

`npm install` at the workspace root installs dependencies for **all** apps and libs (Nx hoists them into the root `node_modules/`).

### 2. Configure environment variables

Copy the example files and fill in real values (see [Environment Variables](#environment-variables) below).

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
```

> On Windows PowerShell, use `Copy-Item apps/backend/.env.example apps/backend/.env`.

### 3. Provision a MongoDB database

Either:

- Start a local MongoDB instance and use `mongodb://127.0.0.1:27017/issue-tracker`, **or**
- Create a free MongoDB Atlas cluster and copy its connection string into `MONGO_URI`.

No manual schema setup is needed — Mongoose creates collections on first write.

### 4. Run the development servers

```bash
# Start frontend + backend together
npm run dev

# Or start them individually
npm run dev:backend     # http://localhost:5000
npm run dev:frontend    # http://localhost:5173
```

Open <http://localhost:5173> and register a new account to begin.

### 5. Build for production

```bash
npm run build
# Outputs:
#   apps/frontend/dist  -> static assets
#   apps/backend/dist   -> compiled JS (node apps/backend/dist/main.js)
```

---

## Environment Variables

### `apps/backend/.env`

| Variable         | Required | Example                                                     | Description                      |
| ---------------- | -------- | ----------------------------------------------------------- | -------------------------------- |
| `PORT`           | No       | `5000`                                                      | HTTP port the API listens on     |
| `MONGO_URI`      | **Yes**  | `mongodb+srv://user:pass@cluster.mongodb.net/issue-tracker` | MongoDB connection string        |
| `JWT_SECRET`     | **Yes**  | `change_me_to_a_long_random_string`                         | Secret used to sign JWTs         |
| `JWT_EXPIRES_IN` | No       | `7d`                                                        | Token lifetime (e.g. `1h`, `7d`) |
| `CORS_ORIGIN`    | **Yes**  | `http://localhost:5173`                                     | Allowed origin for the frontend  |
| `NODE_ENV`       | No       | `development`                                               | `development` or `production`    |

### `apps/frontend/.env`

| Variable       | Required | Example                     | Description                 |
| -------------- | -------- | --------------------------- | --------------------------- |
| `VITE_API_URL` | **Yes**  | `http://localhost:5000/api` | Base URL the frontend calls |

> Never commit real secrets. The `.env` files are gitignored by default; only `.env.example` is tracked.

---

## Usage

### Creating an account

1. Visit <http://localhost:5173>.
2. Click **Register**, provide name / email / password (min. 6 chars).
3. You will be redirected to the dashboard and a JWT will be stored locally.

### Working with issues

- **Create** — Use the **New Issue** button. Title, description, status, priority and severity are required.
- **Search** — Type in the search box; results refresh after 400 ms of inactivity.
- **Filter** — Use the status and priority dropdowns, or toggle **Show only mine**.
- **Update / Delete** — Available from each row's action menu. Only the issue's owner can mutate it.
- **Export** — Click **Export CSV** to download the current filtered view.

### Calling the API directly

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"secret123"}'

# Login (capture the token)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}' | jq -r .token)

# Create an issue
curl -X POST http://localhost:5000/api/issues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Bug in login","description":"500 on bad password","status":"Open","priority":"High","severity":"Major"}'

# List issues (paginated)
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/issues?page=1&limit=10"
```

---

## Available Scripts

Run from the workspace root.

| Command                          | Description                                              |
| -------------------------------- | -------------------------------------------------------- |
| `npm run dev`                    | Run frontend + backend in parallel (Nx `run-many`)       |
| `npm run dev:frontend`           | Start Vite dev server on `:5173`                         |
| `npm run dev:backend`            | Start Express with hot-reload (`ts-node-dev`) on `:5000` |
| `npm run build`                  | Build both apps for production                           |
| `npm run build:frontend`         | Build frontend only                                      |
| `npm run build:backend`          | Build backend only                                       |
| `npx nx graph`                   | Open the Nx project dependency graph in the browser      |
| `npx nx serve <project>`         | Serve any project directly via Nx                        |
| `npx nx build <project>`         | Build any project directly via Nx                        |
| `npx nx run-many --target=build` | Build all projects in the workspace                      |

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth Routes

| Method | Endpoint             | Description         | Auth |
| ------ | -------------------- | ------------------- | ---- |
| POST   | `/api/auth/register` | Register a new user | No   |
| POST   | `/api/auth/login`    | Login a user        | No   |
| GET    | `/api/auth/me`       | Get current profile | Yes  |

### Issue Routes (all require `Authorization: Bearer <token>`)

| Method | Endpoint                   | Description                         |
| ------ | -------------------------- | ----------------------------------- |
| POST   | `/api/issues`              | Create a new issue                  |
| GET    | `/api/issues`              | List issues (paginated, filterable) |
| GET    | `/api/issues/:id`          | Get a single issue                  |
| PUT    | `/api/issues/:id`          | Update an issue (owner only)        |
| DELETE | `/api/issues/:id`          | Delete an issue (owner only)        |
| PATCH  | `/api/issues/:id/status`   | Update status only                  |
| GET    | `/api/issues/stats/counts` | Status counts for the dashboard     |

### Query Parameters — `GET /api/issues`

| Param      | Type    | Description                               |
| ---------- | ------- | ----------------------------------------- |
| `search`   | string  | Case-insensitive title search             |
| `status`   | string  | Filter by status                          |
| `priority` | string  | Filter by priority                        |
| `mine`     | boolean | Show only the authenticated user's issues |
| `page`     | number  | Page number (default `1`)                 |
| `limit`    | number  | Items per page (default `10`)             |

---

## Dependencies

### Runtime dependencies

| Package              | Purpose                          |
| -------------------- | -------------------------------- |
| `react`, `react-dom` | UI framework                     |
| `react-router-dom`   | Client-side routing              |
| `zustand`            | Lightweight state management     |
| `axios`              | HTTP client used by the frontend |
| `express`            | Backend web framework            |
| `mongoose`           | MongoDB ODM                      |
| `cors`               | CORS middleware                  |
| `dotenv`             | `.env` loader                    |
| `jsonwebtoken`       | JWT signing / verification       |
| `bcryptjs`           | Password hashing                 |

### Development dependencies

| Package                                | Purpose                       |
| -------------------------------------- | ----------------------------- |
| `nx`, `@nx/js`, `@nx/vite`, `@nx/node` | Monorepo build orchestration  |
| `vite`, `@vitejs/plugin-react`         | Frontend dev server / bundler |
| `tailwindcss`, `@tailwindcss/vite`     | Styling                       |
| `typescript`                           | Type checking + compilation   |
| `ts-node-dev`                          | Backend hot-reload            |
| `@types/*`                             | Type definitions              |

Exact versions are pinned in [`package.json`](./package.json) and locked in `package-lock.json`.

---

## Testing the API (Postman)

A ready-to-import Postman collection ships with the backend:

```
apps/backend/Issue_Tracker_API.postman_collection.json
```

To use it:

1. Open Postman → **Import** → select the JSON file above.
2. Create an environment with a `baseUrl` variable set to `http://localhost:5000/api`.
3. Run the **Login** request first — the returned `token` is automatically stored as a collection variable and attached to subsequent requests.

---
