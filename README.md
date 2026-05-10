<div align="center">

<pre>
 ██████╗  ██████╗ ██████╗ ███████╗██████╗ ███████╗███╗   ██╗ █████╗
██╔════╝ ██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝████╗  ██║██╔══██╗
██║      ██║   ██║██║  ██║█████╗  ██████╔╝█████╗  ██╔██╗ ██║███████║
██║      ██║   ██║██║  ██║██╔══╝  ██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║
╚██████╗ ╚██████╔╝██████╔╝███████╗██║  ██║███████╗██║ ╚████║██║  ██║
 ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝
</pre>

<h3 align="center">
A competitive programming platform focused on secure execution, real-time systems, and AI-assisted workflows.
</h3>

</div>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-24.x-2496ED)](https://www.docker.com/)

</div>

![Landing Page](public/screenshots/landingPage.png)

**Video Overview of the Platform:** Coming Soon...

## Table of Contents

- [🏗️ Overview](#overview)
- [✨ Why CodeArena?](#why-codearena)
- [⚡ Capabilities](#capabilities)
- [🔧 Technical Deep Dive](#technical-deep-dive)
- [🛠️ Technology Stack](#stack)
- [🚀 Quick Start](#quick-start)
- [⚙️ How It Works](#how-it-works)
- [💻 Development](#development)
- [📦 Deployment](#deployment)
- [📡 API](#api)
- [🔒 Security](#security)
- [📊 Monitoring](#monitoring)
- [👥 Team](#team)
- [🤝 Contributing](#contributing)

## Overview

CodeArena separates concerns across **stateless API servers**, **background workers**, and **real-time socket clusters** — all coordinated through Redis.

```mermaid
flowchart TB
    Client[Next.js Client] -->|HTTP| API[Next.js API Routes]
    Client -->|WebSocket| Socket[Socket.IO Server]

    API -->|Enqueue| Redis[(Redis)]
    Socket -->|Pub/Sub| Redis

    Redis -->|Process| Workers[BullMQ Workers]
    Workers -->|Execute| Docker[Docker Sandbox]
    Workers -->|Fallback| Judge0[Judge0 API]
    Workers -->|Analyze| Groq[Groq AI]

    API -->|Query| MongoDB[(MongoDB)]
    Workers -->|Read/Write| MongoDB

    style Docker fill:#2496ED,stroke:#fff,stroke-width:2px
    style Redis fill:#DC382D,stroke:#fff,stroke-width:2px
    style MongoDB fill:#47A248,stroke:#fff,stroke-width:2px
```

The design prioritizes **security** (sandboxed execution), **scalability** (horizontal socket scaling via Redis adapter), and **resilience** (graceful fallbacks when Docker is unavailable).

---

## Why CodeArena?

Most platforms in the competitive programming ecosystem specialize in only one part of the workflow — coding challenges, contests, interview preparation, or AI feedback.

CodeArena was built to explore how these systems could coexist within a unified architecture while maintaining secure execution, scalable real-time infrastructure, and low-latency developer interactions.

---

## Capabilities

| Feature                     | Description                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Competitive Programming** | Multi-language judge (JS, Python, Java, C/C++, Go) with Docker sandboxing. Verdicts: `ACCEPTED` • `WRONG_ANSWER` • `TLE` • `MLE` • `RUNTIME_ERROR` • `COMPILATION_ERROR` |
| **AI Interviews (Alex)**    | 4-phase mock interviews with streaming AI feedback via Socket.IO. Evaluates algorithms, code quality, and communication                                                  |
| **Contests**                | Real-time ICPC-style leaderboards with plagiarism detection                                                                                                              |
| **Community**               | Developer feed, solution sharing, tag-based recommendations                                                                                                              |

### Problem Browser

![Problem Browser](public/screenshots/problems.png)

### Problem Solving

![Problem Editor](public/screenshots/editor.png)

### Contests & Leaderboards (75% Zoom-Out)

![Leaderboard](public/screenshots/leaderboardPage.png)

### AI Interview System

![AI Interview](public/screenshots/interview.png)

### User Profile

![Profile](public/screenshots/profile.png)

---

## Technical Deep Dive

### Execution Engine

**Dual-mode architecture:**

1. **Docker Sandbox** (primary): Seccomp-filtered containers, no network, read-only rootfs, cgroup limits. Handles compiled (C++, Java) and interpreted (Python, JS) languages.

2. **Judge0 API** (fallback): Cloud fallback for Railway, Render, and other environments without Docker socket access.

Security: Pattern-based code validation, execution timeouts, auto-removal.

### Worker Orchestration

Seven BullMQ workers with idempotency guards:

| Worker                         | Purpose                                       |
| ------------------------------ | --------------------------------------------- |
| `submission.worker.js`         | Code execution & verdicts                     |
| `ai.worker.js`                 | Post-submission analysis (Groq Llama 3.3 70B) |
| `interviewAI.worker.js`        | Real-time AI streaming                        |
| `interviewExecution.worker.js` | Interview code validation                     |
| `interviewSummarize.worker.js` | Session summarization                         |
| `plagiarism.worker.js`         | Similarity detection                          |
| `stats.worker.js`              | Performance aggregation                       |

### Real-time Infrastructure

Socket.IO with **Redis adapter** enables horizontal scaling. Multiple server instances share state via Redis pub/sub. JWT tokens secure WebSocket connections; tiered rate limiting protects endpoints.

---

## Stack

| Layer         | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| **Frontend**  | Next.js 16, React 19, TailwindCSS 4, shadcn/ui, Monaco Editor |
| **Backend**   | Next.js API Routes, Socket.IO 4, BullMQ 5, JWT, Zod           |
| **Data**      | MongoDB 8 (Mongoose), Redis 7                                 |
| **Execution** | Docker 24 + seccomp, Judge0 fallback                          |
| **AI**        | Groq SDK (Llama 3.3 70B)                                      |
| **Deploy**    | Docker Compose, Railway, Render                               |

---

## Quick Start

**Docker (recommended):**

```bash
git clone https://github.com/yourusername/codearena.git
cd codearena
chmod +x setup.sh && ./setup.sh
# Or: docker-compose up -d
```

**Environment:**

```env
MONGODB_URI=mongodb://admin:password@localhost:27017/codearena?authSource=admin
REDIS_URL=redis://:password@localhost:6379
JWT_SECRET=your-secret-key-min-32-characters
```

**Local dev:**

```bash
npm install && npm run docker:build
npm run dev
node scripts/worker-boot.js  # Separate terminal
```

---

## How It Works

**Code Submission Flow**

```mermaid
sequenceDiagram
    Client->>API: POST /api/submissions
    API->>Redis: Enqueue
    API->>Client: Job ID
    Worker->>Redis: Pick up
    Worker->>MongoDB: Fetch tests
    Worker->>Docker: Execute
    Docker->>Worker: Verdict
    Worker->>Redis: Publish
    Worker->>MongoDB: Save
```

**Real-time Updates**

```mermaid
sequenceDiagram
    Worker->>Redis: Publish score
    Redis->>Socket: Broadcast
    Socket->>Client: Push
```

---

## Development

**Scripts**
| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run docker:build` | Build executors |
| `node scripts/worker-boot.js` | Start workers |
| `node scripts/dev-all.js` | Concurrent mode |

**Project Structure**

```
src/
├── app/         # Next.js App Router
├── features/    # Problem-solve, interview, contests
├── services/    # BullMQ workers
├── lib/         # Docker, AI, Socket.IO
├── models/      # Mongoose schemas
└── socket/      # Namespaces
```

---

## Deployment

| Platform    | Command                                                                               |
| ----------- | ------------------------------------------------------------------------------------- |
| **Railway** | `railway login && railway link && railway up`                                         |
| **Render**  | Use `render.yaml` blueprint                                                           |
| **Docker**  | `docker build -t codearena . && docker run -p 3000:3000 -e MONGODB_URI=... codearena` |

---

## API

**REST**: Auth, Problems, Submissions, Contests, Interview, Feed, Admin

**WebSocket**: `submission_update`, `contest_update`, `notification`, `interview_ai_stream`

**Health**: `GET /api/health`

---

## Security

| Layer       | Measures                                                                  |
| ----------- | ------------------------------------------------------------------------- |
| **Sandbox** | Seccomp, no network, read-only rootfs, resource limits, pattern detection |
| **API**     | Tiered rate limiting, JWT (httpOnly + Bearer), CORS, Zod validation       |
| **Data**    | bcryptjs, strong secrets, MongoDB authSource, Redis password auth         |

---

## Monitoring

Structured logging (auth, database, contest, system), query performance, cache hit rates, worker metrics. Health: `GET /api/health`

---

## Team

| Role                      | Member              |
| ------------------------- | ------------------- |
| 🏛️ Architecture / Backend | Arafat Salehin      |
| ⚙️ Core Systems           | AH Muzahid          |
| 🎨 UI / UX                | Shahnawas Adeel     |
| 💻 Frontend / Dashboard   | Rabiul Islam        |
| 💻 Frontend               | Abdullah Noman      |
| ✍️ Content                | Ummey Salma Tamanna |

---

## Contributing

Fork → branch (`feature/name`) → commit → PR. Standards: ESLint, Prettier, Husky.

---

Built with Next.js, React, MongoDB, Redis, Docker, BullMQ, Socket.IO, Groq
