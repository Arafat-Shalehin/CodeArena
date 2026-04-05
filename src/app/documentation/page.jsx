'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import {
    Zap,
    ShieldCheck,
    Code2,
    Globe,
    Server,
    Database,
    Lock,
    Terminal,
    Activity,
    Search,
    History,
    Cpu,
    Blocks,
    Trophy,
    ChevronRight,
    BookOpen,
    Rocket,
    Users,
    ExternalLink,
    Menu,
    X,
    Settings,
    Bot,
    Coffee,
    FileCode,
    BarChart3,
    Brain,
} from 'lucide-react'

const ICON_MAP = {
    Terminal,
    Activity,
    ShieldCheck,
    Search,
    History,
    Cpu,
    Blocks,
    Trophy,
    Bot,
    Coffee,
    FileCode,
    Zap,
    BarChart3,
    Brain,
    Lock,
    Code2,
    Globe,
    Server,
    Database,
    ChevronRight,
    BookOpen,
    Rocket,
    Users,
    ExternalLink,
    Menu,
    X,
    Settings,
}

import CodeBlock from '@/app/documentation/components/CodeBlock'
import Callout from '@/app/documentation/components/Callout'
import FlowStep from '@/app/documentation/components/FlowStep'
import MethodBadge from '@/app/documentation/components/MethodBadge'

import {
    NAV_SECTIONS,
    TECH_STACK,
    FEATURES_DATA,
    VERDICTS,
    SUPPORTED_LANGUAGES,
    TEAM,
    API_AUTH,
    API_PROBLEMS,
    API_EVALUATION,
    API_CONTESTS,
    API_USERS,
    API_ADMIN,
    PAGE_ROUTES,
    DOCKER_SERVICES,
    ENV_VARS,
    NPM_SCRIPTS,
    USER_MODEL,
    PROBLEM_MODEL,
    SUBMISSION_MODEL,
    CONTEST_MODEL,
    FLOW_SUBMISSION,
    FLOW_AUTH,
    FLOW_DOCKERFILE,
} from '@/app/documentation/data/docData'

export default function DocumentationPage() {
    const [activeSection, setActiveSection] = useState('intro')
    const [mobileNavOpen, setMobileNavOpen] = useState(false)
    const sidebarRef = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            { rootMargin: '-20% 0px -70% 0px' }
        )

        const sections = document.querySelectorAll('section[id]')
        sections.forEach((s) => observer.observe(s))

        return () => observer.disconnect()
    }, [])

    const scrollTo = (id) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            setMobileNavOpen(false)
        }
    }

    return (
        <div className="bg-bg-page text-text-primary flex min-h-screen flex-col font-sans">
            <Navbar />

            <div className="flex w-full flex-grow lg:px-6">
                {/* ── SIDEBAR (desktop) ── */}
                <aside
                    ref={sidebarRef}
                    className="sticky top-24 hidden h-[calc(100vh-8rem)] w-64 shrink-0 overflow-y-auto lg:block"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--ca-border) transparent',
                    }}
                >
                    <nav className="flex flex-col gap-6 px-4">
                        {NAV_SECTIONS.map((section) => (
                            <div key={section.title}>
                                <p className="text-text-muted mb-2 pl-3 font-mono text-[10px] font-medium tracking-widest uppercase">
                                    {section.title}
                                </p>
                                <ul className="flex flex-col gap-0.5">
                                    {section.links.map((link) => (
                                        <li key={link.id}>
                                            <button
                                                onClick={() => scrollTo(link.id)}
                                                className={`block w-full rounded-md px-3 py-1.5 text-left text-[13px] transition-colors ${
                                                    activeSection === link.id
                                                        ? 'bg-accent-light text-accent-text font-medium'
                                                        : 'text-text-muted hover:bg-bg-subtle hover:text-text-primary'
                                                }`}
                                            >
                                                {link.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* ── MOBILE NAV TOGGLE ── */}
                <div className="fixed right-4 bottom-6 z-50 lg:hidden">
                    <Button
                        size="icon"
                        variant="default"
                        className="size-12 rounded-full shadow-lg"
                        onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    >
                        {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>
                </div>

                {/* ── MOBILE SIDEBAR OVERLAY ── */}
                {mobileNavOpen && (
                    <div className="bg-bg-page/95 fixed inset-0 z-40 backdrop-blur-md lg:hidden">
                        <div className="flex h-full flex-col p-6 pt-20">
                            <div className="overflow-y-auto">
                                <nav className="flex flex-col gap-6">
                                    {NAV_SECTIONS.map((section) => (
                                        <div key={section.title}>
                                            <p className="text-text-muted mb-2 pl-3 font-mono text-[10px] font-medium tracking-widest uppercase">
                                                {section.title}
                                            </p>
                                            <ul className="flex flex-col gap-0.5">
                                                {section.links.map((link) => (
                                                    <li key={link.id}>
                                                        <button
                                                            onClick={() => scrollTo(link.id)}
                                                            className="block w-full rounded-md px-3 py-2 text-left text-sm transition-colors"
                                                        >
                                                            {link.label}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── MAIN CONTENT ── */}
                <div className="border-border min-w-0 flex-1 px-4 pt-4 pb-24 lg:border-l lg:pl-8">
                    {/* HERO */}
                    <motion.section
                        id="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-16"
                    >
                        <div className="bg-bg-subtle border-border relative overflow-hidden rounded-2xl border p-8 md:p-12">
                            <div className="bg-accent/5 absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl" />
                            <div className="bg-accent/5 absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl" />
                            <div className="relative text-center">
                                <div className="mb-4 inline-flex items-center gap-2">
                                    <span className="bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase">
                                        Official Docs
                                    </span>
                                </div>
                                <h1 className="font-display text-text-primary mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                                    Code<span className="text-accent">Arena</span>
                                </h1>
                                <p className="text-text-muted mx-auto max-w-2xl text-base leading-relaxed md:text-lg">
                                    A full-stack online judge and competitive programming platform —
                                    built with Next.js 16, MongoDB, Redis, and Docker-sandboxed code
                                    execution.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {[
                                        { label: 'Next.js 16', variant: 'success' },
                                        { label: 'React 19', variant: 'info' },
                                        { label: 'MongoDB', variant: 'success' },
                                        { label: 'Redis', variant: 'info' },
                                        { label: 'Docker', variant: 'warning' },
                                        { label: 'Firebase Auth', variant: 'destructive' },
                                        { label: 'Socket.IO', variant: 'success' },
                                        { label: 'Tailwind v4', variant: 'info' },
                                    ].map((badge) => (
                                        <Badge
                                            key={badge.label}
                                            variant={badge.variant}
                                            className="hover:bg-opacity-100 transition-colors hover:text-white"
                                        >
                                            {badge.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* WHAT IS CODEARENA */}
                    <section id="what-is" className="mb-16 scroll-mt-32">
                        <div className="mb-8">
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <span className="bg-accent/10 text-accent flex size-8 items-center justify-center rounded-lg font-mono text-sm font-bold">
                                    01
                                </span>
                                What is CodeArena?
                            </h2>
                        </div>
                        <div className="flex flex-col gap-8">
                            <div>
                                <p className="text-text-secondary mb-4 text-sm leading-relaxed">
                                    CodeArena is an online competitive programming platform that
                                    allows users to browse coding problems, write and submit
                                    solutions in multiple programming languages, and compete in
                                    timed contests — all from a browser-based code editor. The
                                    platform judges submitted code automatically by executing it
                                    inside isolated Docker containers and comparing its output
                                    against predefined test cases.
                                </p>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    It is a team-built full-stack application following a monolithic
                                    Next.js architecture with a clean separation between frontend
                                    features, API controllers, business services, and database
                                    models.
                                </p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {FEATURES_DATA.slice(0, 4).map((f) => {
                                    const IconComponent = ICON_MAP[f.icon] || Zap
                                    return (
                                        <div
                                            key={f.id}
                                            className="border-border hover:border-accent/30 bg-bg-subtle rounded-xl border p-5 transition-colors"
                                        >
                                            <div className="text-accent mb-3">
                                                <IconComponent className="size-5" />
                                            </div>
                                            <h3 className="text-text-primary mb-1 text-sm font-bold">
                                                {f.title}
                                            </h3>
                                            <p className="text-text-muted text-xs leading-relaxed">
                                                {f.desc}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </section>

                    {/* PROJECT STATUS */}
                    <section id="status" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">03</span>
                            Project Status
                        </h2>
                        <h3 className="text-text-primary mb-3 text-lg font-semibold">
                            ✅ Implemented & Working
                        </h3>
                        <ul className="text-text-secondary mb-6 list-inside list-disc space-y-1.5 text-sm">
                            <li>
                                User authentication — register, login, logout, Firebase sync, JWT
                                cookie session
                            </li>
                            <li>Problem list with search, filter, and pagination</li>
                            <li>Per-user solved-status lookup on problem browser</li>
                            <li>Problem detail page and in-browser Monaco code editor</li>
                            <li>Code submission and verdict evaluation pipeline</li>
                            <li>
                                Docker sandboxed execution for C++, Python, Java, and JavaScript
                            </li>
                            <li>Contest, participant, and leaderboard API surfaces</li>
                            <li>Admin log APIs</li>
                            <li>User profile pages with activity calendar</li>
                            <li>Docker Compose stack (MongoDB, Redis, app, docker-proxy)</li>
                            <li>Prometheus metrics endpoint</li>
                        </ul>
                        <h3 className="text-text-primary mb-3 text-lg font-semibold">
                            🚧 In Progress / Partial
                        </h3>
                        <Callout type="warn" label="Note">
                            Some sections still use static/mock data on the frontend. The Practice
                            page is a placeholder ("Coming Soon"). Real-time WebSocket UI updates
                            are not fully wired yet, though the Socket.IO + Redis adapter server
                            layer is present.
                        </Callout>
                    </section>

                    <Separator className="my-12" />

                    {/* ARCHITECTURE */}
                    <section id="architecture" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">04</span>
                            System Architecture
                        </h2>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            CodeArena is a{' '}
                            <strong className="text-text-primary">
                                monolithic Next.js application
                            </strong>{' '}
                            where both the frontend and backend live in the same codebase. The App
                            Router handles page-level rendering while{' '}
                            <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                /api/*
                            </code>{' '}
                            routes act as a REST API. The architecture separates concerns into
                            Controllers → Services → Models layers within that monolith.
                        </p>

                        <div className="border-border bg-bg-subtle text-text-secondary mb-8 overflow-hidden rounded-lg border p-6 font-mono text-xs leading-relaxed">
                            <div className="text-info font-bold">
                                ┌─────────────────────────────────────────────────────────┐
                            </div>
                            <div className="text-info font-bold">│ BROWSER / CLIENT │</div>
                            <div className="text-info">
                                │ React 19 · Monaco Editor · Framer Motion · Socket.IO │
                            </div>
                            <div className="text-info font-bold">
                                └────────────────────────┬────────────────────────────────┘
                            </div>
                            <div className="text-text-muted pl-24">│ HTTPS + WSS</div>
                            <div className="text-info font-bold">
                                ┌────────────────────────▼────────────────────────────────┐
                            </div>
                            <div className="text-info font-bold">│ NEXT.JS 16 APP SERVER │</div>
                            <div className="text-accent">
                                │ Pages (App Router) │ API Routes (/api/*) │
                            </div>
                            <div className="text-accent">
                                │ Server Components │ Controllers → Services │
                            </div>
                            <div className="text-accent">
                                │ Middleware (JWT auth) │ Mongoose Models │
                            </div>
                            <div className="text-info font-bold">
                                └──────────┬──────────────────────────────┬───────────────┘
                            </div>
                            <div className="text-text-muted pl-12">│ │</div>
                            <div className="text-info font-bold">
                                ┌──────────▼──────────┐ ┌────────────▼──────────────────┐
                            </div>
                            <div className="text-info font-bold">
                                │ MongoDB (Mongoose)│ │ Redis (Cache + BullMQ Queue) │
                            </div>
                            <div className="text-accent">
                                │ Users · Problems │ │ Sessions · Job Queue │
                            </div>
                            <div className="text-accent">│ Submissions │ │ Socket.IO Adapter │</div>
                            <div className="text-accent">
                                │ Contests · Logs │ └────────────────────────────────┘
                            </div>
                            <div className="text-info font-bold">└─────────────────────┘</div>
                            <div className="text-text-muted pl-20">│ Judge Jobs</div>
                            <div className="text-info font-bold">
                                ┌──────────▼──────────────────────────────────────────────┐
                            </div>
                            <div className="text-info font-bold">│ DOCKER EXECUTION SANDBOX │</div>
                            <div className="text-accent">
                                │ dockerode → docker-socket-proxy → Docker Engine │
                            </div>
                            <div className="text-accent">
                                │ Per-submission isolated containers │
                            </div>
                            <div className="text-accent">
                                │ C++ · Python · Java · JavaScript images │
                            </div>
                            <div className="text-info font-bold">
                                └─────────────────────────────────────────────────────────┘
                            </div>
                        </div>

                        <h3 className="text-text-primary mb-4 text-lg font-semibold">
                            Request Lifecycle (Code Submission)
                        </h3>
                        <div className="flex flex-col gap-0">
                            {FLOW_SUBMISSION.map((step) => (
                                <FlowStep
                                    key={step.num}
                                    num={step.num}
                                    title={step.title}
                                    desc={step.desc}
                                />
                            ))}
                        </div>
                    </section>

                    {/* PROJECT STRUCTURE */}
                    <section id="project-structure" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">05</span>
                            Project Structure
                        </h2>
                        <CodeBlock lang="tree">{`codearena/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (pages)/            # Frontend page routes
│   │   │   ├── page.jsx        # Landing page (/)
│   │   │   ├── login/          # /login
│   │   │   ├── signup/         # /signup
│   │   │   ├── problems/       # /problems + /problems/[id]
│   │   │   ├── leaderboard/    # /leaderboard
│   │   │   ├── profile/        # /profile, /profile/[id]
│   │   │   ├── practice/       # /practice (placeholder)
│   │   │   └── test-docker/    # /test-docker (dev tool)
│   │   └── api/                # REST API routes
│   │       ├── auth/           # Auth endpoints
│   │       ├── problems/       # Problem CRUD + submit
│   │       ├── submissions/    # Submission read
│   │       ├── evaluation/     # Judge execution endpoints
│   │       ├── contests/       # Contest management
│   │       ├── user/           # Per-user queries
│   │       ├── users/          # User listing/lookup
│   │       ├── admin/          # Admin log management
│   │       └── health/         # Health check
│   │
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # Shadcn/Radix base components
│   │   ├── layout/             # Header, Footer, Sidebar, Nav
│   │   └── shared/             # Cards, Badges, Loaders, etc.
│   │
│   ├── features/               # Feature-scoped frontend modules
│   │   ├── auth/               # Login/signup forms & logic
│   │   ├── problems/           # Problem list, filters, workspace
│   │   ├── contests/           # Contest UI
│   │   ├── leaderboard/        # Leaderboard UI
│   │   └── profile/            # Profile page sections
│   │
│   ├── controllers/            # API route handlers (thin layer)
│   ├── services/               # Business logic / data layer
│   ├── models/                 # Mongoose schemas
│   ├── middlewares/            # Request middleware
│   └── lib/                    # Utilities & infrastructure
│
├── docker/                     # Docker build scripts
├── redis/                      # Redis config files
├── public/                     # Static assets
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Production stack
└── package.json`}</CodeBlock>
                    </section>

                    {/* DATA MODELS */}
                    <section id="data-models" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">06</span>
                            Data Models
                        </h2>

                        <h3 className="text-text-primary mb-3 text-lg font-semibold">User</h3>
                        <div className="border-border mb-6 overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Field</TableHead>
                                        <TableHead className="py-3">Type</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {USER_MODEL.map(([f, t, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-2.5">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {f}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-2.5 font-mono text-xs">
                                                {t}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-2.5 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <h3 className="text-text-primary mb-3 text-lg font-semibold">Problem</h3>
                        <div className="border-border mb-6 overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Field</TableHead>
                                        <TableHead className="py-3">Type</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {PROBLEM_MODEL.map(([f, t, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-2.5">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {f}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-2.5 font-mono text-xs">
                                                {t}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-2.5 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <h3 className="text-text-primary mb-3 text-lg font-semibold">Submission</h3>
                        <div className="border-border mb-6 overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Field</TableHead>
                                        <TableHead className="py-3">Type</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {SUBMISSION_MODEL.map(([f, t, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-2.5">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {f}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-2.5 font-mono text-xs">
                                                {t}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-2.5 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <h3 className="text-text-primary mb-3 text-lg font-semibold">Contest</h3>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Field</TableHead>
                                        <TableHead className="py-3">Type</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {CONTEST_MODEL.map(([f, t, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-2.5">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {f}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-2.5 font-mono text-xs">
                                                {t}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-2.5 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    <Separator className="my-12" />

                    {/* AUTH */}
                    <section id="auth" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">07</span>
                            Authentication System
                        </h2>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            CodeArena implements a dual-layer authentication strategy combining{' '}
                            <strong className="text-text-primary">Firebase Auth</strong> on the
                            client side with{' '}
                            <strong className="text-text-primary">JWT cookies</strong> on the server
                            side.
                        </p>
                        <div className="mb-6 flex flex-col gap-3">
                            {FLOW_AUTH.map((step) => (
                                <FlowStep
                                    key={step.num}
                                    num={step.num}
                                    title={step.title}
                                    desc={step.desc}
                                />
                            ))}
                        </div>
                        <Callout type="tip" label="Security Note">
                            JWT tokens are stored as HttpOnly cookies (not localStorage), protecting
                            them from XSS attacks. The Docker socket is also proxied through
                            tecnativa/docker-socket-proxy to restrict container API access.
                        </Callout>
                    </section>

                    {/* JUDGE ENGINE */}
                    <section id="judge" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">08</span>
                            Judge Engine
                        </h2>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            The judge is the most technically complex subsystem of CodeArena. It
                            compiles and executes user-submitted code inside ephemeral Docker
                            containers, measuring execution time and memory, and comparing output
                            against expected test results.
                        </p>

                        <h3 className="text-text-primary mb-4 text-lg font-semibold">
                            Supported Languages
                        </h3>
                        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {SUPPORTED_LANGUAGES.map((lang) => {
                                const IconComponent = ICON_MAP[lang.icon] || Zap
                                return (
                                    <Card key={lang.name} className="border-l-accent border-l-4">
                                        <CardHeader className="pb-2">
                                            <div className="text-accent mb-1">
                                                <IconComponent className="size-5" />
                                            </div>
                                            <CardTitle className="text-sm">{lang.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-text-muted text-xs leading-relaxed">
                                                {lang.desc}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </section>

                    {/* CONTESTS */}
                    <section id="contests" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">10</span>
                            Contests
                        </h2>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            CodeArena supports timed competitive contests. Each contest has a
                            defined start time, end time, and a set of problems. Users can register
                            for a contest and make submissions during the contest window. A
                            leaderboard is computed per-contest based on accepted problems and
                            penalty time.
                        </p>
                        <h3 className="text-text-primary mb-3 text-base font-semibold">
                            Contest States
                        </h3>
                        <ul className="text-text-secondary mb-6 list-inside list-disc space-y-1.5 text-sm">
                            <li>
                                <strong className="text-text-primary">Upcoming</strong> — Before
                                startTime; registration is open.
                            </li>
                            <li>
                                <strong className="text-text-primary">Active</strong> — Between
                                startTime and endTime; submissions accepted.
                            </li>
                            <li>
                                <strong className="text-text-primary">Ended</strong> — After
                                endTime; read-only, final leaderboard visible.
                            </li>
                        </ul>
                    </section>

                    {/* LEADERBOARD */}
                    <section id="leaderboard" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">11</span>
                            Leaderboard
                        </h2>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            The platform maintains both a global leaderboard and per-contest
                            leaderboards. Rankings are computed by the leaderboard service from
                            submission data stored in MongoDB. The global leaderboard is accessible
                            at{' '}
                            <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                /leaderboard
                            </code>{' '}
                            and via{' '}
                            <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                GET /api/contests/[id]/leaderboard
                            </code>{' '}
                            for contest-specific rankings.
                        </p>
                    </section>

                    <Separator className="my-12" />

                    {/* API — AUTH */}
                    <section id="api-auth" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">12</span>
                            API Reference — Auth
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Method</TableHead>
                                        <TableHead className="py-3">Endpoint</TableHead>
                                        <TableHead className="py-3">Auth</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {API_AUTH.map(([m, e, a, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <MethodBadge method={m} />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {e}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {a}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* API — PROBLEMS */}
                    <section id="api-problems" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">13</span>
                            API Reference — Problems
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Method</TableHead>
                                        <TableHead className="py-3">Endpoint</TableHead>
                                        <TableHead className="py-3">Auth</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {API_PROBLEMS.map(([m, e, a, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <MethodBadge method={m} />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {e}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {a}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* API — EVALUATION */}
                    <section id="api-evaluation" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">14</span>
                            API Reference — Evaluation
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Method</TableHead>
                                        <TableHead className="py-3">Endpoint</TableHead>
                                        <TableHead className="py-3">Auth</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {API_EVALUATION.map(([m, e, a, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <MethodBadge method={m} />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {e}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {a}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* API — CONTESTS */}
                    <section id="api-contests" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">15</span>
                            API Reference — Contests
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Method</TableHead>
                                        <TableHead className="py-3">Endpoint</TableHead>
                                        <TableHead className="py-3">Auth</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {API_CONTESTS.map(([m, e, a, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <MethodBadge method={m} />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {e}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {a}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* API — USERS */}
                    <section id="api-users" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">16</span>
                            API Reference — Users
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Method</TableHead>
                                        <TableHead className="py-3">Endpoint</TableHead>
                                        <TableHead className="py-3">Auth</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {API_USERS.map(([m, e, a, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <MethodBadge method={m} />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {e}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {a}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* API — ADMIN */}
                    <section id="api-admin" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">17</span>
                            API Reference — Admin
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Method</TableHead>
                                        <TableHead className="py-3">Endpoint</TableHead>
                                        <TableHead className="py-3">Auth</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {API_ADMIN.map(([m, e, a, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <MethodBadge method={m} />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {e}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {a}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    <Separator className="my-12" />

                    {/* PAGE ROUTES */}
                    <section id="routes" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">18</span>
                            Page Routes
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Route</TableHead>
                                        <TableHead className="py-3">Auth</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {PAGE_ROUTES.map(([r, a, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {r}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {a}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* LOCAL DEV */}
                    <section id="local-dev" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">19</span>
                            Local Development Setup
                        </h2>
                        <Callout type="info" label="Prerequisites">
                            Node.js 20+, npm, Docker Desktop (required for code execution), and
                            either local MongoDB + Redis services or Docker.
                        </Callout>

                        <div className="mt-6 space-y-6">
                            <div>
                                <h3 className="text-text-primary mb-2 text-base font-semibold">
                                    Step 1 — Clone & Install
                                </h3>
                                <CodeBlock lang="bash">{`git clone <repository-url>
cd CodeArena-TeamProject
git checkout development
npm install`}</CodeBlock>
                            </div>
                            <div>
                                <h3 className="text-text-primary mb-2 text-base font-semibold">
                                    Step 2 — Create Environment File
                                </h3>
                                <CodeBlock lang=".env.local">{`MONGODB_URI=mongodb://localhost:27017/codearena
JWT_SECRET=your_super_secret_jwt_key

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Firebase (from Firebase Console → Project Settings → General)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=`}</CodeBlock>
                            </div>
                            <div>
                                <h3 className="text-text-primary mb-2 text-base font-semibold">
                                    Step 3 — Build Judge Executor Images
                                </h3>
                                <CodeBlock lang="bash">{`npm run docker:build
# Runs docker/scripts/build-images.sh
# Builds: judge-cpp, judge-python, judge-java, judge-js Docker images`}</CodeBlock>
                            </div>
                            <div>
                                <h3 className="text-text-primary mb-2 text-base font-semibold">
                                    Step 4 — Start Dev Server
                                </h3>
                                <CodeBlock lang="bash">{`npm run dev
# App available at http://localhost:3000`}</CodeBlock>
                            </div>
                        </div>
                    </section>

                    {/* DOCKER COMPOSE */}
                    <section id="docker" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">20</span>
                            Docker Compose
                        </h2>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            The repository includes a production-ready{' '}
                            <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                docker-compose.yml
                            </code>{' '}
                            that wires together all services. It runs the app on port{' '}
                            <strong className="text-text-primary">3001</strong> (mapped from
                            internal 3000).
                        </p>

                        <h3 className="text-text-primary mb-3 text-base font-semibold">Services</h3>
                        <div className="border-border mb-6 overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Service</TableHead>
                                        <TableHead className="py-3">Image</TableHead>
                                        <TableHead className="py-3">Port</TableHead>
                                        <TableHead className="py-3">Purpose</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {DOCKER_SERVICES.map(([s, img, p, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {s}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {img}
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {p}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="space-y-3">
                            <CodeBlock lang="bash">{`docker compose up -d --build`}</CodeBlock>
                            <CodeBlock lang="bash">{`docker compose -f docker-compose.yml -f docker-compose.dev.yml up`}</CodeBlock>
                        </div>
                    </section>

                    {/* ENV VARS */}
                    <section id="env-vars" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">21</span>
                            Environment Variables
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Variable</TableHead>
                                        <TableHead className="py-3">Required</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ENV_VARS.map(([v, r, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {v}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 text-xs">
                                                {r === 'Yes' ? '✅' : '—'}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </section>

                    {/* NPM SCRIPTS */}
                    <section id="scripts" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">22</span>
                            NPM Scripts
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Script</TableHead>
                                        <TableHead className="py-3">Command</TableHead>
                                        <TableHead className="py-3">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {NPM_SCRIPTS.map(([s, c, d], i) => (
                                        <TableRow key={i}>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {s}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {c}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {d}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Callout type="tip" label="Git Hooks">
                            Husky + lint-staged is configured to run Prettier on all staged{' '}
                            <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                .js, .jsx, .ts, .tsx, .json, .css, .md, .mjs
                            </code>{' '}
                            files before each commit, ensuring consistent code formatting.
                        </Callout>
                    </section>

                    {/* DOCKERFILE */}
                    <section id="dockerfile" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">23</span>
                            Dockerfile (Multi-Stage)
                        </h2>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            The production Dockerfile uses a 3-stage build to keep the final image
                            lean and secure:
                        </p>
                        <div className="flex flex-col gap-3">
                            {FLOW_DOCKERFILE.map((step) => (
                                <FlowStep
                                    key={step.num}
                                    num={step.num}
                                    title={step.title}
                                    desc={step.desc}
                                />
                            ))}
                        </div>
                    </section>

                    {/* TEAM */}
                    <section id="team" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">24</span>
                            Team
                        </h2>
                        <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                            CodeArena was built by a six-person team with specialized
                            responsibilities across backend, frontend, and project leadership.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {TEAM.map((member) => (
                                <Card
                                    key={member.name}
                                    className="border-l-accent hover:border-accent/50 border-l-4 transition-all hover:shadow-md"
                                >
                                    <CardContent className="pt-5">
                                        <p className="text-accent mb-1 font-mono text-[10px] font-medium tracking-widest uppercase">
                                            {member.role}
                                        </p>
                                        <p className="text-text-primary font-semibold">
                                            {member.name}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* FOOTER */}
                    <div className="border-border mt-16 border-t pt-8">
                        <p className="text-text-muted font-mono text-[11px]">
                            CodeArena · Team Project · Next.js 16 · MongoDB · Docker · docs
                            generated April 2026
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
