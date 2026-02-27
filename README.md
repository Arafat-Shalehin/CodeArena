# CodeArena

CodeArena is a full-stack online judge and competitive programming platform built with Next.js. It includes authentication, problem management, submissions, contest APIs, leaderboards, and Docker-based code execution.

## Current Status

Implemented:
- User authentication (register, login, logout, Firebase sync + JWT cookie flow)
- Problems list with search/filter/pagination and solved-status lookup
- Problem submission and verdict evaluation
- Docker sandbox execution pipeline for multiple languages
- Contest, participant, and leaderboard API surfaces
- Admin log APIs

In progress / partial:
- Some frontend sections still use static/mock data
- Practice page is currently a placeholder ("Coming Soon")
- Real-time websocket updates are not wired in this repository yet

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- MongoDB (Mongoose)
- Redis
- Docker + `dockerode` for sandboxed execution
- Firebase Auth (client) + JWT (server auth)

## Supported Languages (Judge)

- C++
- Python
- Java
- JavaScript

## Verdicts

- `ACCEPTED`
- `WRONG_ANSWER`
- `TIME_LIMIT_EXCEEDED`
- `MEMORY_LIMIT_EXCEEDED`
- `RUNTIME_ERROR`
- `COMPILATION_ERROR`
- `PENDING`
- `JUDGING`
- `SYSTEM_ERROR`
- `SECURITY_ERROR`

## Main Routes

- `/` - Landing page
- `/login`, `/signup` - Authentication pages
- `/problems` - Problem browser
- `/problems/[id]` - Problem detail and solve workspace
- `/leaderboard` - Leaderboard UI
- `/profile`, `/profile/[id]`, `/profile/settings` - Profile pages
- `/userdashboard` - User dashboard
- `/practice` - Placeholder page
- `/test-docker` - Docker execution test interface

## API Overview

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/sync`
- Health: `/api/health`
- Problems: `/api/problems`, `/api/problems/[id]`, `/api/problems/[id]/submit`
- Submissions: `/api/submissions`, `/api/submissions/[id]`
- Evaluation: `/api/evaluation/execute`, `/api/evaluation/judge`, `/api/evaluation/test`, `/api/evaluation/status`
- User: `/api/user/problems-status`, `/api/users`, `/api/users/[id]`
- Contests: `/api/contests`, `/api/contests/[id]`, participant + registration + leaderboard subroutes
- Admin: `/api/admin/logs`, `/api/admin/logs/[id]`

## Project Structure

```txt
src/
  app/            # Next.js pages + API routes
  components/     # Shared UI/layout components
  features/       # Feature-based frontend modules
  controllers/    # API controllers
  services/       # Business/data service layer
  models/         # Mongoose models
  middlewares/    # Auth/role middleware
  lib/            # Docker execution, judge logic, db/auth utilities
```

## Local Development

Prerequisites:
- Node.js (20+ recommended)
- npm
- Docker Desktop (required for code execution features)
- MongoDB and Redis (local services or Docker)

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` with required variables:
```env
MONGODB_URI=
JWT_SECRET=
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

3. Build executor images:
```bash
npm run docker:build
```

4. Start dev server:
```bash
npm run dev
```

App URL: `http://localhost:3000`

## Docker Compose (Optional)

The repository includes `docker-compose.yml` with:
- `mongodb`
- `redis`
- `app`
- `docker-proxy` (restricted Docker socket proxy for safer container control)

When started via compose, the app is exposed on port `3001`.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production app
- `npm run start` - Run production server
- `npm run lint` - Run ESLint
- `npm run docker:build` - Build judge executor images

## Team

- Team Lead: Rabiul Islam
- Backend: Arafat Salehin, AH Muzahid
- Frontend: Shahnawas Adeel, Abdullah Noman, Ummey Salma Tamanna
