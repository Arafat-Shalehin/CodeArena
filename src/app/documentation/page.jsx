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

const NAV_SECTIONS = [
    {
        title: 'Overview',
        links: [
            { id: 'intro', label: 'Introduction' },
            { id: 'tech-stack', label: 'Tech Stack' },
            { id: 'status', label: 'Project Status' },
        ],
    },
    {
        title: 'Architecture',
        links: [
            { id: 'architecture', label: 'System Architecture' },
            { id: 'project-structure', label: 'Project Structure' },
            { id: 'data-models', label: 'Data Models' },
        ],
    },
    {
        title: 'Features',
        links: [
            { id: 'auth', label: 'Authentication' },
            { id: 'judge', label: 'Judge Engine' },
            { id: 'contests', label: 'Contests' },
            { id: 'leaderboard', label: 'Leaderboard' },
        ],
    },
    {
        title: 'API Reference',
        links: [
            { id: 'api-auth', label: 'Auth APIs' },
            { id: 'api-problems', label: 'Problems APIs' },
            { id: 'api-evaluation', label: 'Evaluation APIs' },
            { id: 'api-contests', label: 'Contest APIs' },
            { id: 'api-users', label: 'User APIs' },
            { id: 'api-admin', label: 'Admin APIs' },
        ],
    },
    {
        title: 'Deployment',
        links: [
            { id: 'local-dev', label: 'Local Development' },
            { id: 'docker', label: 'Docker Compose' },
            { id: 'env-vars', label: 'Environment Variables' },
            { id: 'scripts', label: 'NPM Scripts' },
        ],
    },
    {
        title: 'Reference',
        links: [
            { id: 'verdicts', label: 'Verdicts' },
            { id: 'routes', label: 'Page Routes' },
            { id: 'team', label: 'Team' },
        ],
    },
]

const TECH_STACK = [
    {
        layer: 'Framework',
        tech: 'Next.js',
        version: '16.1.6',
        purpose: 'Full-stack app with App Router; handles both SSR pages and API routes',
    },
    {
        layer: 'UI Library',
        tech: 'React',
        version: '19.2.3',
        purpose: 'Component-based UI with Server & Client components',
    },
    {
        layer: 'Styling',
        tech: 'Tailwind CSS',
        version: 'v4',
        purpose: 'Utility-first CSS; Shadcn/ui components; Radix UI primitives',
    },
    {
        layer: 'Database',
        tech: 'MongoDB + Mongoose',
        version: '8.13.0',
        purpose: 'Primary data store for users, problems, submissions, contests',
    },
    {
        layer: 'Cache / Queue',
        tech: 'Redis',
        version: '5.11.0',
        purpose: 'Session caching, BullMQ job queues, Socket.IO adapter',
    },
    {
        layer: 'Auth (Client)',
        tech: 'Firebase Auth',
        version: '12.9.0',
        purpose: 'Client-side identity; synced to backend via JWT cookies',
    },
    {
        layer: 'Auth (Server)',
        tech: 'JWT + bcryptjs',
        version: '—',
        purpose: 'Server-side session validation and password hashing',
    },
    {
        layer: 'Code Execution',
        tech: 'Docker + dockerode',
        version: '4.0.9',
        purpose: 'Sandboxed execution of user-submitted code',
    },
    {
        layer: 'Real-time',
        tech: 'Socket.IO',
        version: '4.8.3',
        purpose: 'WebSocket layer (wired with Redis adapter; UI integration in progress)',
    },
    {
        layer: 'Job Queue',
        tech: 'BullMQ',
        version: '5.70.1',
        purpose: 'Async judging job queue backed by Redis',
    },
    {
        layer: 'Code Editor',
        tech: 'Monaco Editor',
        version: '4.7.0',
        purpose: 'VS Code–powered in-browser editor for problem workspace',
    },
    {
        layer: 'AI',
        tech: 'Google Gemini + Groq',
        version: '—',
        purpose: 'AI-powered features (hints, analysis, etc.)',
    },
    {
        layer: 'Animations',
        tech: 'Framer Motion + GSAP',
        version: '—',
        purpose: 'Page transitions, UI animations, scroll effects via Lenis',
    },
    {
        layer: '3D',
        tech: 'Three.js + R3F',
        version: '0.183.2',
        purpose: '3D visual effects (landing page / hero sections)',
    },
    {
        layer: 'Forms',
        tech: 'React Hook Form + Zod',
        version: '—',
        purpose: 'Form management and schema-based validation',
    },
    {
        layer: 'Data Fetching',
        tech: 'SWR',
        version: '2.4.0',
        purpose: 'Client-side data fetching with caching and revalidation',
    },
    {
        layer: 'Metrics',
        tech: 'prom-client',
        version: '15.1.3',
        purpose: 'Prometheus-compatible application metrics',
    },
    {
        layer: 'Testing',
        tech: 'Vitest + Testing Library',
        version: '—',
        purpose: 'Unit and component testing',
    },
]

const FEATURES_DATA = [
    {
        id: 'docker',
        icon: <Terminal className="size-5" />,
        title: 'Docker Sandbox Execution',
        desc: 'Real containerized code runner. Your solutions execute in isolated, secure Docker containers with strict resource limits for fair and safe evaluations.',
        badge: 'Secure Runtime',
    },
    {
        id: 'judge',
        icon: <Activity className="size-5" />,
        title: 'Multi-Verdict Judge',
        desc: 'Beyond pass/fail. Get granular feedback with standard verdicts including ACCEPTED, TLE, MLE, and detailed RUNTIME_ERROR reports.',
        badge: 'Deep Feedback',
    },
    {
        id: 'auth',
        icon: <ShieldCheck className="size-5" />,
        title: 'Firebase + JWT Auth',
        desc: 'Real secure login system. Enterprise-grade security combining Firebase for identity and JWT for stateless session management.',
        badge: 'Trusted Access',
    },
    {
        id: 'browser',
        icon: <Search className="size-5" />,
        title: 'Problem Browser',
        desc: 'Search, filter, and paginate through challenges by difficulty, tags, or title to find the perfect problem for your skill level.',
        badge: 'Smart Discovery',
    },
    {
        id: 'history',
        icon: <History className="size-5" />,
        title: 'Submission History',
        desc: 'Track your attempts per problem. Review previous solutions, analyze performance trends, and learn from every submission.',
        badge: 'Progress Tracking',
    },
    {
        id: 'apis',
        icon: <Cpu className="size-5" />,
        title: 'Contest & Leaderboard APIs',
        desc: 'Robust backend infrastructure powering real-time rankings and contest management, built to scale as the arena expands.',
        badge: 'Real-time Signals',
    },
    {
        id: 'ai-interview',
        icon: <Activity className="size-5" />,
        title: 'AI Interviewer Alex',
        desc: 'Adaptive live interview mode with real-time feedback and scorecards tuned for big-tech loops.',
        badge: 'Interview Ready',
    },
]

const STEPS_DATA = [
    {
        step: 1,
        title: 'Choose a Challenge',
        desc: 'Select from hundreds of algorithm challenges across various difficulty levels.',
        icon: <Blocks className="size-5" />,
    },
    {
        step: 2,
        title: 'Code & Optimize',
        desc: 'Write your solution in our interactive editor and optimize for performance.',
        icon: <Terminal className="size-5" />,
    },
    {
        step: 3,
        title: 'Run & Verify',
        desc: 'Execute your code against hidden test cases to ensure edge-case coverage.',
        icon: <ShieldCheck className="size-5" />,
    },
    {
        step: 4,
        title: 'Compete & Climb',
        desc: 'Earn points, unlock achievements, and see your rank rise on the leaderboard.',
        icon: <Trophy className="size-5" />,
    },
]

const VERDICTS = [
    {
        verdict: 'ACCEPTED',
        cls: 'badge-success',
        meaning: 'All test cases passed within time and memory limits.',
    },
    {
        verdict: 'WRONG_ANSWER',
        cls: 'badge-error',
        meaning: 'Output does not match expected output for one or more test cases.',
    },
    {
        verdict: 'TIME_LIMIT_EXCEEDED',
        cls: 'badge-warning',
        meaning: "Program did not complete within the problem's time limit.",
    },
    {
        verdict: 'MEMORY_LIMIT_EXCEEDED',
        cls: 'badge-warning',
        meaning: 'Program exceeded the allowed memory usage.',
    },
    {
        verdict: 'RUNTIME_ERROR',
        cls: 'badge-error',
        meaning: 'Program crashed or exited with a non-zero exit code.',
    },
    {
        verdict: 'COMPILATION_ERROR',
        cls: 'badge-error',
        meaning: 'Code failed to compile (C++, Java). Includes compiler error output.',
    },
    {
        verdict: 'PENDING',
        cls: 'badge-info',
        meaning: 'Submission is in the queue, awaiting a judge worker.',
    },
    {
        verdict: 'JUDGING',
        cls: 'badge-info',
        meaning: 'Currently being executed by the judge engine.',
    },
    {
        verdict: 'SYSTEM_ERROR',
        cls: 'badge-neutral',
        meaning: "Internal judge failure (e.g., Docker issue). Not the user's fault.",
    },
    {
        verdict: 'SECURITY_ERROR',
        cls: 'badge-neutral',
        meaning: 'Submission triggered a security constraint (e.g., restricted syscall).',
    },
]

const SUPPORTED_LANGUAGES = [
    {
        name: 'C++',
        icon: <Settings className="size-5" />,
        desc: 'Compiled with g++; fastest execution.',
    },
    { name: 'Python', icon: <Bot className="size-5" />, desc: 'Interpreted; python3 runtime.' },
    {
        name: 'Java',
        icon: <Coffee className="size-5" />,
        desc: 'Compiled with javac and run on JVM.',
    },
    {
        name: 'JavaScript',
        icon: <FileCode className="size-5" />,
        desc: 'Run with Node.js runtime.',
    },
]

const TEAM = [
    { role: 'Team Lead', name: 'Rabiul Islam' },
    { role: 'Backend', name: 'Arafat Salehin' },
    { role: 'Backend', name: 'AH Muzahid' },
    { role: 'Frontend', name: 'Shahnawas Adeel' },
    { role: 'Frontend', name: 'Abdullah Noman' },
    { role: 'Frontend', name: 'Ummey Salma Tamanna' },
]

function MethodBadge({ method }) {
    const map = {
        GET: 'badge-success',
        POST: 'badge-info',
        PUT: 'badge-warning',
        DELETE: 'badge-error',
    }
    return (
        <Badge
            variant={map[method] || 'default'}
            className="font-mono text-[10px] font-bold uppercase"
        >
            {method}
        </Badge>
    )
}

function CodeBlock({ children, lang = 'bash' }) {
    return (
        <div className="border-border bg-bg-subtle relative overflow-hidden rounded-lg border">
            <div className="border-border flex items-center justify-between border-b px-4 py-2">
                <span className="text-text-muted font-mono text-xs tracking-wide uppercase">
                    {lang}
                </span>
            </div>
            <pre className="overflow-x-auto p-4">
                <code className="text-text-primary font-mono text-sm">{children}</code>
            </pre>
        </div>
    )
}

function Callout({ type = 'info', label, children }) {
    const styles = {
        info: 'border-l-info bg-info-light',
        warn: 'border-l-warning bg-warning-light',
        tip: 'border-l-accent bg-accent-light',
    }
    const labelStyles = {
        info: 'text-info',
        warn: 'text-warning',
        tip: 'text-accent-text',
    }
    return (
        <div className={`rounded-r-lg border-l-4 p-4 ${styles[type]}`}>
            <p
                className={`mb-1 font-mono text-[10px] font-bold tracking-widest uppercase ${labelStyles[type]}`}
            >
                {label}
            </p>
            <div className="text-text-secondary text-sm">{children}</div>
        </div>
    )
}

function FlowStep({ num, title, desc }) {
    return (
        <div className="border-border flex gap-4 border-b pb-4 last:border-b-0 last:pb-0">
            <div className="border-accent/30 bg-accent-light text-accent flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold">
                {num}
            </div>
            <div>
                <strong className="text-text-primary font-sans text-sm">{title}</strong>
                <p className="text-text-muted mt-0.5 text-xs">{desc}</p>
            </div>
        </div>
    )
}

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

            <div className="mx-auto flex w-full max-w-7xl flex-grow gap-8 px-4 pt-4 pb-24 lg:px-6">
                {/* ── SIDEBAR (desktop) ── */}
                <aside
                    ref={sidebarRef}
                    className="fixed top-0 left-0 hidden h-screen w-64 shrink-0 overflow-y-auto pt-32 pb-8 lg:block"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--ca-border) transparent',
                    }}
                >
                    <nav className="flex flex-col gap-6 px-4 lg:px-6">
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

                {/* Spacer for fixed sidebar */}
                <div className="hidden w-64 shrink-0 lg:block" />

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
                            <nav className="flex flex-col gap-6 overflow-y-auto">
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
                                                        className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
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
                        </div>
                    </div>
                )}

                {/* ── MAIN CONTENT ── */}
                <div className="min-w-0 flex-1">
                    {/* HERO */}
                    <motion.section
                        id="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="border-border mb-16 border-b pb-12"
                    >
                        <h1 className="font-display text-text-primary mb-5 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                            Code<span className="text-accent">Arena</span>
                            <br />
                            Documentation
                        </h1>
                        <p className="text-text-muted mx-auto max-w-2xl text-base leading-relaxed md:text-lg">
                            A full-stack online judge and competitive programming platform — built
                            with Next.js 16, MongoDB, Redis, and Docker-sandboxed code execution.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-2">
                            <Badge
                                variant="success"
                                className="hover:bg-success transition-colors hover:text-white"
                            >
                                Next.js 16
                            </Badge>
                            <Badge
                                variant="info"
                                className="hover:bg-info transition-colors hover:text-white"
                            >
                                React 19
                            </Badge>
                            <Badge
                                variant="success"
                                className="hover:bg-success transition-colors hover:text-white"
                            >
                                MongoDB
                            </Badge>
                            <Badge
                                variant="info"
                                className="hover:bg-info transition-colors hover:text-white"
                            >
                                Redis
                            </Badge>
                            <Badge
                                variant="warning"
                                className="hover:bg-warning transition-colors hover:text-white"
                            >
                                Docker
                            </Badge>
                            <Badge
                                variant="destructive"
                                className="hover:bg-error transition-colors hover:text-white"
                            >
                                Firebase Auth
                            </Badge>
                            <Badge
                                variant="success"
                                className="hover:bg-success transition-colors hover:text-white"
                            >
                                Socket.IO
                            </Badge>
                            <Badge
                                variant="info"
                                className="hover:bg-info transition-colors hover:text-white"
                            >
                                Tailwind CSS v4
                            </Badge>
                        </div>
                    </motion.section>

                    {/* WHAT IS CODEARENA */}
                    <section id="what-is" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">01</span>
                            What is CodeArena?
                        </h2>
                        <p className="text-text-secondary mb-4 text-sm leading-relaxed">
                            CodeArena is an online competitive programming platform that allows
                            users to browse coding problems, write and submit solutions in multiple
                            programming languages, and compete in timed contests — all from a
                            browser-based code editor. The platform judges submitted code
                            automatically by executing it inside isolated Docker containers and
                            comparing its output against predefined test cases.
                        </p>
                        <p className="text-text-secondary mb-8 text-sm leading-relaxed">
                            It is a team-built full-stack application following a monolithic Next.js
                            architecture with a clean separation between frontend features, API
                            controllers, business services, and database models.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {FEATURES_DATA.slice(0, 4).map((f, i) => (
                                <Card
                                    key={f.id}
                                    className="border-l-accent relative overflow-hidden border-l-4"
                                >
                                    <CardHeader className="pb-2">
                                        <div className="text-accent mb-1">
                                            {
                                                [
                                                    <Zap className="size-5" />,
                                                    <Trophy className="size-5" />,
                                                    <BarChart3 className="size-5" />,
                                                    <Brain className="size-5" />,
                                                ][i]
                                            }
                                        </div>
                                        <CardTitle className="text-sm">{f.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-text-muted text-xs leading-relaxed">
                                            {f.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* TECH STACK */}
                    <section id="tech-stack" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">02</span>
                            Tech Stack
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Layer</TableHead>
                                        <TableHead className="py-3">Technology</TableHead>
                                        <TableHead className="py-3">Version</TableHead>
                                        <TableHead className="py-3">Purpose</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {TECH_STACK.map((t, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="text-text-primary py-3 text-sm font-medium">
                                                {t.layer}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                                    {t.tech}
                                                </code>
                                            </TableCell>
                                            <TableCell className="text-text-muted py-3 font-mono text-xs">
                                                {t.version}
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {t.purpose}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                            <FlowStep
                                num="1"
                                title="User submits code"
                                desc="Monaco editor POSTs to POST /api/problems/[id]/submit with language and source code."
                            />
                            <FlowStep
                                num="2"
                                title="Auth middleware validates JWT cookie"
                                desc="The request passes through middleware that verifies the user's JWT before reaching the controller."
                            />
                            <FlowStep
                                num="3"
                                title="Submission record created (PENDING)"
                                desc="The submission controller creates a MongoDB document with status PENDING and enqueues a BullMQ job."
                            />
                            <FlowStep
                                num="4"
                                title="Judge worker picks up the job"
                                desc="A BullMQ worker (backed by Redis) processes the job by calling the judge service."
                            />
                            <FlowStep
                                num="5"
                                title="Docker container spun up via dockerode"
                                desc="The judge calls POST /api/evaluation/execute which uses dockerode → docker-proxy → Docker Engine to create a sandboxed container."
                            />
                            <FlowStep
                                num="6"
                                title="Output compared against test cases"
                                desc="Stdout is compared to expected output. Timing and memory are measured. A verdict is produced."
                            />
                            <FlowStep
                                num="7"
                                title="Submission updated in MongoDB"
                                desc="The submission document is updated with the final verdict (e.g., ACCEPTED, WRONG_ANSWER) and execution stats."
                            />
                            <FlowStep
                                num="8"
                                title="Client polls for result"
                                desc="Frontend polls GET /api/evaluation/status or GET /api/submissions/[id] until the verdict is available."
                            />
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
                                    {[
                                        ['_id', 'ObjectId', 'MongoDB document ID'],
                                        ['uid', 'String', 'Firebase UID (synced from client auth)'],
                                        ['username', 'String', 'Unique display name'],
                                        ['email', 'String', 'User email address (unique)'],
                                        ['passwordHash', 'String', 'bcryptjs-hashed password'],
                                        ['role', 'String', 'Enum: user | admin'],
                                        [
                                            'solvedProblems',
                                            'ObjectId[]',
                                            'References to solved Problem documents',
                                        ],
                                        ['createdAt', 'Date', 'Account creation timestamp'],
                                    ].map(([f, t, d], i) => (
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
                                    {[
                                        ['_id', 'ObjectId', 'Document ID'],
                                        ['title', 'String', 'Problem title'],
                                        ['slug', 'String', 'URL-friendly identifier'],
                                        ['difficulty', 'String', 'Enum: easy | medium | hard'],
                                        [
                                            'tags',
                                            'String[]',
                                            'Algorithm/topic tags (e.g., "dp", "graph")',
                                        ],
                                        [
                                            'description',
                                            'String',
                                            'Markdown problem statement (supports LaTeX via KaTeX)',
                                        ],
                                        ['inputFormat', 'String', 'Input specification'],
                                        ['outputFormat', 'String', 'Output specification'],
                                        [
                                            'testCases',
                                            'Array',
                                            'Array of {input, expectedOutput} objects',
                                        ],
                                        ['timeLimit', 'Number', 'Time limit in milliseconds'],
                                        ['memoryLimit', 'Number', 'Memory limit in MB'],
                                        [
                                            'sampleTestCases',
                                            'Array',
                                            'Publicly visible sample cases',
                                        ],
                                    ].map(([f, t, d], i) => (
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
                                    {[
                                        ['_id', 'ObjectId', 'Document ID'],
                                        ['userId', 'ObjectId', 'Reference to User'],
                                        ['problemId', 'ObjectId', 'Reference to Problem'],
                                        [
                                            'language',
                                            'String',
                                            'Enum: cpp | python | java | javascript',
                                        ],
                                        ['code', 'String', 'Raw source code'],
                                        ['verdict', 'String', 'One of the 9 possible verdicts'],
                                        ['executionTime', 'Number', 'Runtime in ms'],
                                        ['memoryUsed', 'Number', 'Memory consumption in KB'],
                                        [
                                            'testCaseResults',
                                            'Array',
                                            'Per-test-case result details',
                                        ],
                                        ['createdAt', 'Date', 'Submission timestamp'],
                                    ].map(([f, t, d], i) => (
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
                                    {[
                                        ['_id', 'ObjectId', 'Document ID'],
                                        ['title', 'String', 'Contest name'],
                                        ['description', 'String', 'Contest description'],
                                        ['startTime', 'Date', 'Contest start datetime'],
                                        ['endTime', 'Date', 'Contest end datetime'],
                                        ['problems', 'ObjectId[]', 'List of Problem references'],
                                        [
                                            'participants',
                                            'ObjectId[]',
                                            'Registered user references',
                                        ],
                                        ['createdBy', 'ObjectId', 'Admin user reference'],
                                    ].map(([f, t, d], i) => (
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
                            <FlowStep
                                num="A"
                                title="Register / Login (Native)"
                                desc="POST /api/auth/register or POST /api/auth/login — password hashed with bcryptjs, user stored in MongoDB, JWT issued as an HttpOnly cookie."
                            />
                            <FlowStep
                                num="B"
                                title="Firebase Sync"
                                desc="POST /api/auth/sync — client sends Firebase ID token; server verifies it via Firebase Admin SDK, then upserts the user in MongoDB and issues its own JWT cookie."
                            />
                            <FlowStep
                                num="C"
                                title="Authenticated Requests"
                                desc="All protected API routes run through authMiddleware.js which reads and verifies the token HttpOnly cookie using jsonwebtoken."
                            />
                            <FlowStep
                                num="D"
                                title="Logout"
                                desc="POST /api/auth/logout — clears the JWT cookie on the server side."
                            />
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
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <Card key={lang.name} className="border-l-accent border-l-4">
                                    <CardHeader className="pb-2">
                                        <div className="mb-1 text-lg">{lang.icon}</div>
                                        <CardTitle className="text-sm">{lang.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-text-muted text-xs leading-relaxed">
                                            {lang.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <h3 className="text-text-primary mb-3 text-lg font-semibold">
                            Execution Pipeline
                        </h3>
                        <ul className="text-text-secondary mb-6 list-inside list-disc space-y-1.5 text-sm">
                            <li>
                                The judge service calls{' '}
                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                    dockerode
                                </code>{' '}
                                through the restricted Docker socket proxy.
                            </li>
                            <li>
                                Source code is injected into the container via a tarball stream (
                                <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                    tar-stream
                                </code>
                                ).
                            </li>
                            <li>
                                The container compiles (if needed) then runs the code with stdin
                                piped from the test case input.
                            </li>
                            <li>Stdout is captured and compared to expected output.</li>
                            <li>
                                Wall-clock time and memory usage are measured against the problem's
                                limits.
                            </li>
                            <li>The container is destroyed after execution completes.</li>
                        </ul>

                        <h3 className="text-text-primary mb-3 text-lg font-semibold">Security</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            The application talks to Docker through{' '}
                            <code className="bg-bg-muted text-accent-text rounded px-1.5 py-0.5 font-mono text-xs">
                                tecnativa/docker-socket-proxy
                            </code>
                            , a security-hardened proxy that only exposes the CONTAINERS, IMAGES,
                            EXEC, and POST APIs — explicitly disabling DELETE and BUILD. The proxy
                            is only reachable from within the Docker network.
                        </p>
                    </section>

                    {/* VERDICTS */}
                    <section id="verdicts" className="mb-16 scroll-mt-32">
                        <h2 className="text-text-primary mb-5 flex items-center gap-3 text-2xl font-bold tracking-tight">
                            <span className="text-accent font-mono text-sm font-medium">09</span>
                            Submission Verdicts
                        </h2>
                        <div className="border-border overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="py-3">Verdict</TableHead>
                                        <TableHead className="py-3">Meaning</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {VERDICTS.map((v) => (
                                        <TableRow key={v.verdict}>
                                            <TableCell className="py-3">
                                                <Badge className={v.cls}>{v.verdict}</Badge>
                                            </TableCell>
                                            <TableCell className="text-text-secondary py-3 text-xs">
                                                {v.meaning}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                                    {[
                                        [
                                            'POST',
                                            '/api/auth/register',
                                            'None',
                                            'Create a new account. Body: {username, email, password}. Sets JWT cookie.',
                                        ],
                                        [
                                            'POST',
                                            '/api/auth/login',
                                            'None',
                                            'Authenticate with email/password. Sets JWT cookie on success.',
                                        ],
                                        [
                                            'POST',
                                            '/api/auth/logout',
                                            'JWT',
                                            'Clears the JWT cookie. Logs out the session.',
                                        ],
                                        [
                                            'POST',
                                            '/api/auth/sync',
                                            'Firebase Token',
                                            'Syncs a Firebase-authenticated user to MongoDB. Issues JWT cookie.',
                                        ],
                                    ].map(([m, e, a, d], i) => (
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
                                    {[
                                        [
                                            'GET',
                                            '/api/problems',
                                            'Optional',
                                            'List problems with search (?q=), tag filter, difficulty filter, and pagination (?page=&limit=). Returns solved status if authenticated.',
                                        ],
                                        [
                                            'GET',
                                            '/api/problems/[id]',
                                            'Optional',
                                            'Get a single problem by ID, including description, sample test cases, time/memory limits.',
                                        ],
                                        [
                                            'POST',
                                            '/api/problems/[id]/submit',
                                            'JWT Required',
                                            'Submit code for a problem. Body: {language, code}. Returns submission ID immediately; judging is async.',
                                        ],
                                    ].map(([m, e, a, d], i) => (
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
                                    {[
                                        [
                                            'POST',
                                            '/api/evaluation/execute',
                                            'Internal',
                                            'Run code in a Docker container. Body: {language, code, stdin}. Returns stdout, stderr, exitCode.',
                                        ],
                                        [
                                            'POST',
                                            '/api/evaluation/judge',
                                            'Internal',
                                            'Full judge run: execute against all test cases and compute verdict.',
                                        ],
                                        [
                                            'POST',
                                            '/api/evaluation/test',
                                            'JWT Required',
                                            'Run code against a single custom test input (for the "Run" button). Not recorded as a submission.',
                                        ],
                                        [
                                            'GET',
                                            '/api/evaluation/status',
                                            'JWT Required',
                                            'Poll for the current verdict of a pending/judging submission. Query: ?id=submissionId.',
                                        ],
                                    ].map(([m, e, a, d], i) => (
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
                                    {[
                                        [
                                            'GET',
                                            '/api/contests',
                                            'None',
                                            'List all contests (upcoming, active, ended).',
                                        ],
                                        [
                                            'POST',
                                            '/api/contests',
                                            'Admin JWT',
                                            'Create a new contest.',
                                        ],
                                        [
                                            'GET',
                                            '/api/contests/[id]',
                                            'None',
                                            'Get contest details including problems list.',
                                        ],
                                        [
                                            'POST',
                                            '/api/contests/[id]/register',
                                            'JWT Required',
                                            'Register the authenticated user for the contest.',
                                        ],
                                        [
                                            'GET',
                                            '/api/contests/[id]/participants',
                                            'None',
                                            'List all registered participants for the contest.',
                                        ],
                                        [
                                            'GET',
                                            '/api/contests/[id]/leaderboard',
                                            'None',
                                            'Fetch the contest leaderboard, ranked by accepted problems and penalty.',
                                        ],
                                    ].map(([m, e, a, d], i) => (
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
                                    {[
                                        ['GET', '/api/users', 'JWT', 'List all users (admin use).'],
                                        [
                                            'GET',
                                            '/api/users/[id]',
                                            'None',
                                            'Get public profile data for a user by ID.',
                                        ],
                                        [
                                            'GET',
                                            '/api/user/problems-status',
                                            'JWT Required',
                                            "Returns the authenticated user's solved/attempted problem list.",
                                        ],
                                        [
                                            'GET',
                                            '/api/submissions',
                                            'JWT Required',
                                            'List submissions for the authenticated user (or all, for admins).',
                                        ],
                                        [
                                            'GET',
                                            '/api/submissions/[id]',
                                            'JWT Required',
                                            'Get full details of a specific submission including per-test-case results.',
                                        ],
                                        [
                                            'GET',
                                            '/api/health',
                                            'None',
                                            'Health check endpoint. Returns server/DB/Redis status.',
                                        ],
                                    ].map(([m, e, a, d], i) => (
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
                                    {[
                                        [
                                            'GET',
                                            '/api/admin/logs',
                                            'Admin JWT',
                                            'Retrieve all admin action logs with pagination.',
                                        ],
                                        [
                                            'GET',
                                            '/api/admin/logs/[id]',
                                            'Admin JWT',
                                            'Get a specific admin log entry by ID.',
                                        ],
                                    ].map(([m, e, a, d], i) => (
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
                                    {[
                                        [
                                            '/',
                                            'None',
                                            'Landing page with 3D hero, animations (Three.js, GSAP, Framer Motion)',
                                        ],
                                        ['/login', 'None', 'Email/password + Firebase login form'],
                                        [
                                            '/signup',
                                            'None',
                                            'Registration form with validation (Zod + React Hook Form)',
                                        ],
                                        [
                                            '/problems',
                                            'None',
                                            'Paginated problem browser with search and tag/difficulty filters',
                                        ],
                                        [
                                            '/problems/[id]',
                                            'JWT for Submit',
                                            'Problem detail + Monaco editor + Run + Submit',
                                        ],
                                        ['/leaderboard', 'None', 'Global user leaderboard'],
                                        [
                                            '/profile',
                                            'JWT',
                                            'Own profile page with activity calendar and stats',
                                        ],
                                        [
                                            '/profile/[id]',
                                            'None',
                                            'Public profile view for any user',
                                        ],
                                        [
                                            '/profile/settings',
                                            'JWT',
                                            'Account settings (avatar, username, etc.)',
                                        ],
                                        [
                                            '/userdashboard',
                                            'JWT',
                                            'Personal dashboard: recent submissions, stats, activity',
                                        ],
                                        ['/practice', 'None', 'Placeholder — "Coming Soon"'],
                                        [
                                            '/test-docker',
                                            'None (dev)',
                                            'Debug interface to test Docker execution pipeline',
                                        ],
                                    ].map(([r, a, d], i) => (
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
                                <CodeBlock lang="bash">{`git clone https://github.com/rabiulislam5334/CodeArena-TeamProject.git
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
                                    {[
                                        [
                                            'mongodb',
                                            'mongo:latest',
                                            '27017',
                                            'Primary database with health check and persistent volume',
                                        ],
                                        [
                                            'redis',
                                            'redis:7',
                                            '6379',
                                            'Cache, BullMQ queue, Socket.IO adapter; AOF persistence enabled, 256 MB limit',
                                        ],
                                        [
                                            'app',
                                            'Local build',
                                            '3001→3000',
                                            'Next.js production app; waits for MongoDB and docker-proxy',
                                        ],
                                        [
                                            'docker-proxy',
                                            'tecnativa/docker-socket-proxy',
                                            '2376 (host)',
                                            'Restricted Docker socket proxy; only exposes CONTAINERS, IMAGES, EXEC, POST',
                                        ],
                                    ].map(([s, img, p, d], i) => (
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
                                    {[
                                        [
                                            'MONGODB_URI',
                                            'Yes',
                                            'Full MongoDB connection string (with auth if applicable)',
                                        ],
                                        [
                                            'JWT_SECRET',
                                            'Yes',
                                            'Secret key used to sign/verify JWT tokens — keep this private',
                                        ],
                                        [
                                            'REDIS_HOST',
                                            'Yes',
                                            'Redis server hostname (e.g., localhost or redis in Docker)',
                                        ],
                                        ['REDIS_PORT', 'Yes', 'Redis port (default 6379)'],
                                        ['REDIS_PASSWORD', 'Yes', 'Redis auth password'],
                                        [
                                            'REDIS_URL',
                                            'Optional',
                                            'Full Redis URL (alternative to HOST/PORT/PASSWORD)',
                                        ],
                                        [
                                            'DOCKER_HOST',
                                            'Auto (compose)',
                                            'Docker API host. Set to http://docker-proxy:2375 in Docker Compose',
                                        ],
                                        ['NODE_ENV', 'Optional', 'development | production'],
                                        [
                                            'NEXT_PUBLIC_FIREBASE_API_KEY',
                                            'Yes',
                                            'Firebase project API key (client-side)',
                                        ],
                                        [
                                            'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
                                            'Yes',
                                            'Firebase auth domain',
                                        ],
                                        [
                                            'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
                                            'Yes',
                                            'Firebase project ID',
                                        ],
                                        [
                                            'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
                                            'Yes',
                                            'Firebase storage bucket',
                                        ],
                                        [
                                            'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
                                            'Yes',
                                            'Firebase messaging sender',
                                        ],
                                        ['NEXT_PUBLIC_FIREBASE_APP_ID', 'Yes', 'Firebase app ID'],
                                        [
                                            'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
                                            'Optional',
                                            'Firebase Analytics measurement ID',
                                        ],
                                    ].map(([v, r, d], i) => (
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
                                    {[
                                        [
                                            'npm run dev',
                                            'next dev',
                                            'Start Next.js development server with hot reload on port 3000',
                                        ],
                                        [
                                            'npm run build',
                                            'next build',
                                            'Create an optimized production build',
                                        ],
                                        [
                                            'npm run start',
                                            'next start',
                                            'Run the production build (requires npm run build first)',
                                        ],
                                        [
                                            'npm run lint',
                                            'eslint',
                                            'Run ESLint across the codebase',
                                        ],
                                        [
                                            'npm run docker:build',
                                            'bash docker/scripts/build-images.sh',
                                            'Build all language executor Docker images for the judge',
                                        ],
                                        [
                                            'npm run prepare',
                                            'husky install',
                                            'Set up Husky Git hooks (auto-runs on npm install)',
                                        ],
                                    ].map(([s, c, d], i) => (
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
                            <FlowStep
                                num="1"
                                title="Stage: deps (node:20-alpine)"
                                desc="Installs only npm dependencies. Husky is disabled in CI/Docker via ENV HUSKY=0."
                            />
                            <FlowStep
                                num="2"
                                title="Stage: builder (node:20-alpine)"
                                desc="Copies deps and source, accepts Firebase env vars as build-time ARGs, and runs next build with telemetry disabled."
                            />
                            <FlowStep
                                num="3"
                                title="Stage: runner (node:20-alpine)"
                                desc="Copies only the Next.js standalone output and static assets. Runs as a non-root nextjs user (UID 1001) on port 3000."
                            />
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
                        <Card className="mt-6">
                            <CardContent className="pt-5">
                                <h4 className="text-text-primary mb-3 text-sm font-semibold">
                                    Links
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <p className="text-text-secondary flex items-center gap-2">
                                        <Globe className="text-accent size-4" />
                                        Live Demo:{' '}
                                        <Link
                                            href="https://code-arena-team-project.vercel.app"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-accent-text inline-flex items-center gap-1 font-mono text-xs hover:underline"
                                        >
                                            https://code-arena-team-project.vercel.app
                                            <ExternalLink className="size-3" />
                                        </Link>
                                    </p>
                                    <p className="text-text-secondary flex items-center gap-2">
                                        <Code2 className="text-accent size-4" />
                                        Repository:{' '}
                                        <Link
                                            href="https://github.com/rabiulislam5334/CodeArena-TeamProject"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-accent-text inline-flex items-center gap-1 font-mono text-xs hover:underline"
                                        >
                                            https://github.com/rabiulislam5334/CodeArena-TeamProject
                                            <ExternalLink className="size-3" />
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
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
