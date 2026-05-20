# Issue Tracker

A full-stack issue tracking application built with a modern Nx monorepo architecture, featuring React frontend with Zustand state management and an Express.js REST API with MongoDB.

## Architecture

```
issue-tracker/
├── apps/
│   ├── frontend/       React 18 + Vite + TypeScript + Tailwind CSS
│   └── backend/        Express.js + TypeScript + MongoDB (Mongoose)
├── libs/
│   └── shared-types/   Shared TypeScript interfaces (Issue, User, Auth)
└── infra/              AWS deployment scripts (S3, CloudFront, Elastic Beanstalk)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 6, TypeScript, Tailwind CSS 4, Zustand, React Router 6 |
| Backend | Express.js, TypeScript, Mongoose ODM |
| Database | MongoDB (Atlas) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Monorepo | Nx Workspace |
| Deployment | AWS S3 + CloudFront (frontend), Elastic Beanstalk (backend) |

## Features

- User registration and login with JWT authentication
- Dashboard with issue status counts (Open, In Progress, Resolved, Closed)
- Full CRUD operations for issues with ownership-based authorization
- Search with debounce optimization (400ms)
- Filter by status and priority with custom dropdown components
- Server-side pagination
- Status/priority/severity indicators with color-coded badges
- CSV export for issue data
- Confirmation modals for destructive actions (resolve, close, delete)
- Responsive design with sidebar navigation (desktop) and card layout (mobile)
- Protected routes with automatic 401 redirect
- Shared TypeScript types between frontend and backend

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (or local MongoDB instance)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

**Backend** (`apps/backend/.env`):
```bash
cp apps/backend/.env.example apps/backend/.env
```

Edit with your values:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/issue-tracker
JWT_SECRET=your_strong_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

**Frontend** (`apps/frontend/.env`):
```bash
cp apps/frontend/.env.example apps/frontend/.env
```

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

```bash
# Start both frontend and backend in parallel
npm run dev

# Or individually:
npm run dev:frontend    # http://localhost:5173
npm run dev:backend     # http://localhost:5000
```

### 4. Build for Production

```bash
npm run build
```

## Nx Commands

| Command | Description |
|---------|------------|
| `npx nx serve frontend` | Start Vite dev server |
| `npx nx serve backend` | Start Express with hot-reload |
| `npx nx build frontend` | Production build (outputs to apps/frontend/dist) |
| `npx nx build backend` | TypeScript compile (outputs to apps/backend/dist) |
| `npx nx run-many --target=build` | Build all projects |
| `npx nx graph` | Visualize project dependency graph |

## API Endpoints

### Auth Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get user profile | Yes |

### Issue Routes (All require authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/issues` | Create a new issue |
| GET | `/api/issues` | Get all issues (paginated, filterable) |
| GET | `/api/issues/:id` | Get single issue |
| PUT | `/api/issues/:id` | Update issue (owner only) |
| DELETE | `/api/issues/:id` | Delete issue (owner only) |
| PATCH | `/api/issues/:id/status` | Update status only |
| GET | `/api/issues/stats/counts` | Get status counts for dashboard |

### Query Parameters (GET /api/issues)

| Param | Type | Description |
|-------|------|-------------|
| search | string | Search by title (case-insensitive) |
| status | string | Filter by status |
| priority | string | Filter by priority |
| mine | boolean | Show only user's issues |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

## Deployment

See [infra/DEPLOYMENT.md](infra/DEPLOYMENT.md) for full AWS deployment instructions.

**Quick deploy:**
```bash
# Frontend → S3 + CloudFront
./infra/deploy-frontend.sh issue-tracker-frontend

# Backend → Elastic Beanstalk
./infra/deploy-backend.sh
```

## Project Structure Details

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

## License

ISC
