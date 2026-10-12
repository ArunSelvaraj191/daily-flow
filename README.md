# DailyFlow — Daily Activity & Productivity Tracker

**DailyFlow** is a modern, full-stack personal productivity SaaS platform engineered to plan activities, track focused time, build consistent habits, set ambitious goals, and analyze productivity metrics.

Built with **React (JavaScript, Vite, Material UI)** on the frontend and **Python 3.12+ (FastAPI, Motor, Pydantic v2)** on the backend, backed by **MongoDB**.

---

## 🌟 Key Features

1. **Daily Activity Management (CRUD)**:
   - Full lifecycle tracking: Pending, In Progress, Completed, Cancelled.
   - Categorized by Work, Learning, Fitness, Personal, Health, Teaching, Content Creation, and Other.
   - Dynamic search, multi-criteria filtering (date, status, category, priority), and server-side pagination.
2. **Persistent Time Tracking**:
   - Backend-persisted timer sessions with UTC timestamp delta calculation.
   - Live glowing pill header widget with real-time countdown, play/pause, and stop controls.
   - Single active timer per user enforcement with automatic session migration and duration synchronization into activities.
   - State survives browser refreshes seamlessly.
3. **Productivity Dashboard**:
   - Live metrics derived via MongoDB aggregation pipelines (no hardcoded data).
   - Interactive Apache ECharts: Activity Completion Trends, Category Donut Distribution, and Planned vs. Actual Time comparison.
   - Preset time filters: Today, Yesterday, This Week, This Month.
4. **Habit Tracker & Streak Engine**:
   - Recurring habits with daily, weekdays, or weekly frequency.
   - Separate completion logs with unique compound indexing.
   - Consecutive day streak engine computing active and all-time record streaks.
   - 7-day consistency indicators.
5. **Goal Management**:
   - Quantified goals with targets measured against actual source activity and habit records.
   - Dynamic percentage completion and overdue indicators.
6. **Calendar Scheduling**:
   - Month, Week, and Day views with activity count badges.
   - Interactive date clicks to quickly schedule new activities.
7. **Analytics, Grounded AI Insights & CSV Export**:
   - Daily, weekly, and monthly productivity summaries.
   - Contextual AI recommendations grounded entirely in real user metrics.
   - One-click CSV export with formula injection sanitization (`=, +, -, @` protection).
8. **Security & Data Isolation**:
   - Argon2 password hashing via `pwdlib`.
   - PyJWT token authentication and authorization.
   - Complete tenant isolation ensuring users can only read and mutate their own data.
   - Dark / Light mode toggle with persistent theme state.

---

## 🏗️ Architecture

```
daily-flow/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point & lifespan
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic Settings configuration
│   │   │   ├── security.py          # Argon2 hashing & PyJWT tokens
│   │   │   ├── exceptions.py        # Centralized HTTP exception classes
│   │   │   └── logging.py           # Structured logger
│   │   ├── db/
│   │   │   ├── mongodb.py           # Async Motor connection manager
│   │   │   └── indexes.py           # MongoDB index initializer
│   │   ├── dependencies/
│   │   │   └── auth.py              # JWT verification dependency
│   │   ├── models/                  # Database data models
│   │   ├── schemas/                 # Pydantic v2 validation schemas
│   │   ├── repositories/            # MongoDB data access layer & aggregations
│   │   ├── services/                # Core business logic & CSV formula sanitization
│   │   └── api/                     # REST API routers (v1)
│   ├── tests/                       # Pytest test suite (9 tests)
│   ├── scripts/                     # Seed script for rich demo data
│   ├── requirements.txt
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/                     # Redux store & React Router v6/v7
│   │   ├── api/                     # Centralized Axios client & services
│   │   ├── components/              # Reusable UI, Charts, Forms, and Layout
│   │   ├── features/                # Auth, Dashboard, Activities, Habits, Goals, Reports
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── theme/                   # Material UI theme & Dark/Light mode provider
│   │   ├── utils/                   # Constants and Day.js formatters
│   │   ├── App.jsx                  # App root
│   │   └── main.jsx                 # Vite entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **Python** (3.12 or 3.13)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas URI

---

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# (Optional) Seed demo data
python scripts/seed_demo_data.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

---

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` (or `http://localhost:5174`) in your browser.

#### Demo Account
- **Email**: `alex@dailyflow.app`
- **Password**: `FlowPassword123`
*(Or click the "Fill Demo Credentials" button on the login screen).*

---

## 🧪 Running Automated Tests

### Backend Tests (Pytest)
```bash
cd backend
pytest -v
```
All 9 test suites verify authentication, user data isolation, activity CRUD, timer lifecycle, habit streaks, goals, CSV injection defense, and reports.

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```
All 9 test suites verify login and register forms, components, formatters, and timer synchronization.

### Linter (Ruff)
```bash
cd backend
ruff check app tests
```

---

## 🚢 Deployment Guide

### Backend on Render
1. Create a new **Web Service** on Render and link your GitHub repository.
2. Root Directory: `backend`.
3. Runtime: **Python 3**.
4. Build Command: `pip install -r requirements.txt`.
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add Environment Variables:
   - `MONGODB_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/dailyflow?retryWrites=true&w=majority`
   - `MONGODB_DATABASE`: `dailyflow`
   - `JWT_SECRET_KEY`: `<generate-a-strong-secret>`
   - `FRONTEND_ORIGINS`: `https://your-dailyflow-frontend.vercel.app`

### Frontend on Vercel
1. Import your GitHub repository into Vercel.
2. Root Directory: `frontend`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-dailyflow-backend.onrender.com/api/v1`
7. Deploy!
