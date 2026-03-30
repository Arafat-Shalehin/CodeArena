'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    Code2,
    Key,
    Zap,
    Shield,
    Copy,
    Check,
    ChevronDown,
    ChevronRight,
    ArrowRight,
    Terminal,
    Globe,
    Lock,
    Clock,
    BookOpen,
    Braces,
    FileCode2,
    Send,
    Users,
    Trophy,
    Bug,
    Cpu,
    Database,
    Sparkles,
} from 'lucide-react'

// ─── API Endpoint Categories ─────────────────────────────────────────────
const API_CATEGORIES = [
    {
        id: 'auth',
        title: 'Authentication',
        icon: <Lock className="size-5" />,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        hoverBorder: 'hover:border-blue-500/50',
        description: 'Register, login, and manage user sessions.',
        endpoints: [
            {
                method: 'POST',
                path: '/api/auth/register',
                summary: 'Create a new user account',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: `{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secureP@ss123"
}`,
                response: `{
  "success": true,
  "user": {
    "id": "usr_a1b2c3d4",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}`,
            },
            {
                method: 'POST',
                path: '/api/auth/login',
                summary: 'Authenticate a user and receive a session token',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: `{
  "email": "john@example.com",
  "password": "secureP@ss123"
}`,
                response: `{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_a1b2c3d4",
    "username": "john_doe",
    "role": "user"
  }
}`,
            },
            {
                method: 'POST',
                path: '/api/auth/logout',
                summary: 'Invalidate the current session',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: null,
                response: `{
  "success": true,
  "message": "Logged out successfully"
}`,
            },
        ],
    },
    {
        id: 'problems',
        title: 'Problems',
        icon: <Code2 className="size-5" />,
        color: 'text-accent bg-accent/10 border-accent/20',
        hoverBorder: 'hover:border-accent/50',
        description: 'Browse, search, and retrieve coding problems.',
        endpoints: [
            {
                method: 'GET',
                path: '/api/problems',
                summary: 'List all problems with pagination & filters',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "problems": [
    {
      "id": "prob_001",
      "title": "Two Sum",
      "difficulty": "Easy",
      "tags": ["Array", "Hash Table"],
      "acceptance": 48.2
    }
  ],
  "total": 2500,
  "page": 1,
  "limit": 20
}`,
            },
            {
                method: 'GET',
                path: '/api/problems/:id',
                summary: 'Get a specific problem by ID',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "id": "prob_001",
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "Easy",
  "tags": ["Array", "Hash Table"],
  "constraints": "2 ≤ nums.length ≤ 10⁴",
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]"
    }
  ]
}`,
            },
            {
                method: 'GET',
                path: '/api/problems/by-tag',
                summary: 'Filter problems by tag (e.g. DP, Graph)',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "tag": "Dynamic Programming",
  "problems": [...],
  "count": 342
}`,
            },
        ],
    },
    {
        id: 'submissions',
        title: 'Submissions',
        icon: <Send className="size-5" />,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        hoverBorder: 'hover:border-purple-500/50',
        description: 'Submit solutions and view submission history.',
        endpoints: [
            {
                method: 'POST',
                path: '/api/submissions',
                summary: 'Submit a solution to a problem',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: `{
  "problemId": "prob_001",
  "language": "python",
  "code": "class Solution:\\n    def twoSum(self, nums, target):\\n        ..."
}`,
                response: `{
  "submissionId": "sub_x7y8z9",
  "status": "Accepted",
  "runtime": "42ms",
  "memory": "16.2 MB",
  "passedTests": 57,
  "totalTests": 57
}`,
            },
            {
                method: 'GET',
                path: '/api/submissions/:id',
                summary: 'Get details of a specific submission',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "id": "sub_x7y8z9",
  "problemId": "prob_001",
  "status": "Accepted",
  "language": "python",
  "runtime": "42ms",
  "memory": "16.2 MB",
  "createdAt": "2026-03-30T10:00:00Z"
}`,
            },
        ],
    },
    {
        id: 'execute',
        title: 'Code Execution',
        icon: <Cpu className="size-5" />,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        hoverBorder: 'hover:border-amber-500/50',
        description: 'Run code in a sandboxed Docker environment.',
        endpoints: [
            {
                method: 'POST',
                path: '/api/execute',
                summary: 'Execute code against custom or problem test cases',
                methodColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                request: `{
  "language": "cpp",
  "code": "#include <iostream>\\nint main() { ... }",
  "input": "5\\n1 2 3 4 5",
  "timeLimit": 2000,
  "memoryLimit": 256
}`,
                response: `{
  "status": "Success",
  "stdout": "15",
  "stderr": "",
  "executionTime": "12ms",
  "memoryUsed": "3.4 MB"
}`,
            },
        ],
    },
    {
        id: 'contests',
        title: 'Contests',
        icon: <Trophy className="size-5" />,
        color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        hoverBorder: 'hover:border-yellow-500/50',
        description: 'Manage and participate in live coding contests.',
        endpoints: [
            {
                method: 'GET',
                path: '/api/contests',
                summary: 'List all upcoming and past contests',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "contests": [
    {
      "id": "contest_42",
      "title": "Weekly Challenge #42",
      "startTime": "2026-04-01T14:00:00Z",
      "duration": 7200,
      "participants": 1230,
      "status": "upcoming"
    }
  ]
}`,
            },
            {
                method: 'GET',
                path: '/api/contests/:id',
                summary: 'Get contest details, problems, and standings',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "id": "contest_42",
  "title": "Weekly Challenge #42",
  "problems": ["prob_101", "prob_102", "prob_103"],
  "standings": [
    { "rank": 1, "user": "alice", "score": 300 }
  ]
}`,
            },
        ],
    },
    {
        id: 'leaderboard',
        title: 'Leaderboard',
        icon: <Users className="size-5" />,
        color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
        hoverBorder: 'hover:border-cyan-500/50',
        description: 'Global rankings and Elo rating data.',
        endpoints: [
            {
                method: 'GET',
                path: '/api/leaderboard',
                summary: 'Get the global leaderboard with Elo ratings',
                methodColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                request: null,
                response: `{
  "leaderboard": [
    {
      "rank": 1,
      "username": "competitive_king",
      "elo": 2847,
      "solved": 1892,
      "contests": 45
    }
  ],
  "total": 10000,
  "page": 1
}`,
            },
        ],
    },
]

// ─── Quick-Start Steps ───────────────────────────────────────────────────
const QUICK_START_STEPS = [
    {
        step: '01',
        title: 'Get Your API Key',
        description:
            'Register an account and generate your personal API key from the dashboard settings.',
        icon: <Key className="size-5" />,
    },
    {
        step: '02',
        title: 'Make Your First Request',
        description: 'Use your key in the Authorization header to authenticate all API calls.',
        icon: <Terminal className="size-5" />,
    },
    {
        step: '03',
        title: 'Explore Endpoints',
        description:
            'Browse the full reference below to discover all available resources and actions.',
        icon: <BookOpen className="size-5" />,
    },
]

// ─── Rate Limits ─────────────────────────────────────────────────────────
const RATE_LIMITS = [
    { tier: 'Free', requests: '100 / hour', burst: '10 / min', color: 'text-text-muted' },
    { tier: 'Pro', requests: '1,000 / hour', burst: '50 / min', color: 'text-accent' },
    { tier: 'Enterprise', requests: 'Unlimited', burst: 'Custom', color: 'text-amber-500' },
]

// ─── Animation Variants ──────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
}

// ─── Code Block Component ────────────────────────────────────────────────
function CodeBlock({ code, label }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="group relative">
            {label && (
                <div className="text-text-muted bg-bg-muted/60 border-border/50 inline-block rounded-t-lg border border-b-0 px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
                    {label}
                </div>
            )}
            <div
                className={`bg-bg-subtle border-border/50 relative overflow-hidden border ${label ? 'rounded-tr-xl rounded-b-xl' : 'rounded-xl'}`}
            >
                <button
                    onClick={handleCopy}
                    className="hover:bg-bg-muted text-text-muted hover:text-text-primary absolute top-2.5 right-2.5 rounded-lg p-1.5 transition-all"
                    title="Copy to clipboard"
                >
                    {copied ? (
                        <Check className="size-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                </button>
                <pre className="no-scrollbar overflow-x-auto p-4 pr-12 text-[13px] leading-relaxed">
                    <code className="text-text-secondary font-mono">{code}</code>
                </pre>
            </div>
        </div>
    )
}

// ─── Endpoint Accordion ──────────────────────────────────────────────────
function EndpointItem({ endpoint }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-border/30 border-b last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hover:bg-bg-subtle/50 flex w-full items-center gap-3 px-5 py-4 text-left transition-colors"
            >
                <span
                    className={`rounded-md border px-2.5 py-1 font-mono text-[11px] font-bold ${endpoint.methodColor}`}
                >
                    {endpoint.method}
                </span>
                <code className="text-text-primary text-sm font-semibold">{endpoint.path}</code>
                <span className="text-text-muted ml-auto hidden text-xs sm:inline">
                    {endpoint.summary}
                </span>
                <ChevronDown
                    className={`text-text-muted size-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-4 px-5 pb-5">
                            <p className="text-text-muted text-sm sm:hidden">{endpoint.summary}</p>
                            {endpoint.request && (
                                <CodeBlock code={endpoint.request} label="Request Body" />
                            )}
                            <CodeBlock code={endpoint.response} label="Response" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Page Component ──────────────────────────────────────────────────────
export default function ApiDocsPage() {
    const [activeCategory, setActiveCategory] = useState(null)

    return (
        <div className="text-text-primary bg-bg-page site-gradient flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-28 pb-24">
                <div className="mx-auto max-w-6xl px-4">
                    {/* ── Hero ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="mb-20 text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-accent/10 border-accent/20 text-accent mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border"
                        >
                            <Braces className="size-8" />
                        </motion.div>
                        <h1 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
                            API <span className="text-accent italic">Reference</span>
                        </h1>
                        <p className="text-text-muted mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
                            Build powerful integrations with CodeArena. Access problems, submit
                            solutions, run code, and retrieve leaderboard data programmatically.
                        </p>

                        {/* Base URL badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 inline-flex items-center gap-2"
                        >
                            <span className="text-text-muted text-sm font-medium">Base URL</span>
                            <code className="bg-bg-subtle border-border/50 text-accent rounded-lg border px-4 py-2 font-mono text-sm font-semibold">
                                https://api.codearena.com/v1
                            </code>
                        </motion.div>
                    </motion.div>

                    {/* ── Quick Start ── */}
                    <motion.section
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="mb-24"
                    >
                        <motion.div variants={itemVariants} className="mb-10">
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <Zap className="text-accent" /> Quick Start
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </motion.div>

                        <div className="grid gap-5 md:grid-cols-3">
                            {QUICK_START_STEPS.map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{
                                        y: -6,
                                        scale: 1.02,
                                        transition: { duration: 0.25 },
                                    }}
                                    className="glass-card group hover:border-accent/40 hover:shadow-accent/5 cursor-default rounded-2xl border border-transparent p-7 transition-all duration-300 hover:shadow-xl"
                                >
                                    <div className="text-accent/30 group-hover:text-accent/60 mb-4 font-mono text-4xl font-black transition-colors">
                                        {step.step}
                                    </div>
                                    <div className="bg-accent/10 border-accent/20 text-accent mb-4 flex size-10 items-center justify-center rounded-xl border">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-text-primary mb-2 text-lg font-bold">
                                        {step.title}
                                    </h3>
                                    <p className="text-text-muted text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ── Authentication Example ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7 }}
                        className="mb-24"
                    >
                        <div className="glass-card hover:border-accent/30 overflow-hidden rounded-3xl border border-transparent transition-all duration-500">
                            <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
                                <div>
                                    <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-500">
                                        <Shield className="size-6" />
                                    </div>
                                    <h2 className="text-text-primary mb-3 text-2xl font-bold tracking-tight">
                                        Authentication
                                    </h2>
                                    <p className="text-text-muted mb-4 leading-relaxed">
                                        All API requests require a Bearer token in the{' '}
                                        <code className="bg-bg-subtle text-accent rounded px-1.5 py-0.5 text-sm">
                                            Authorization
                                        </code>{' '}
                                        header. Obtain your token by logging in or registering
                                        through the Auth endpoints.
                                    </p>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                icon: (
                                                    <Lock className="text-accent mt-0.5 size-4 shrink-0" />
                                                ),
                                                text: 'Bearer token authentication',
                                            },
                                            {
                                                icon: (
                                                    <Clock className="text-accent mt-0.5 size-4 shrink-0" />
                                                ),
                                                text: 'Tokens expire after 7 days',
                                            },
                                            {
                                                icon: (
                                                    <Shield className="text-accent mt-0.5 size-4 shrink-0" />
                                                ),
                                                text: 'All endpoints use HTTPS',
                                            },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-2.5">
                                                {item.icon}
                                                <span className="text-text-secondary text-sm">
                                                    {item.text}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <CodeBlock
                                        label="Example Request"
                                        code={`curl -X GET https://api.codearena.com/v1/problems \\
  -H "Authorization: Bearer eyJhbGciOiJI..." \\
  -H "Content-Type: application/json"`}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Endpoint Reference ── */}
                    <motion.section
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="mb-24"
                    >
                        <motion.div variants={itemVariants} className="mb-10">
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <FileCode2 className="text-accent" /> Endpoint Reference
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </motion.div>

                        <div className="space-y-6">
                            {API_CATEGORIES.map((category, idx) => (
                                <motion.div
                                    key={category.id}
                                    variants={itemVariants}
                                    className={`glass-card overflow-hidden rounded-2xl border border-transparent transition-all duration-300 ${category.hoverBorder}`}
                                >
                                    {/* Category Header */}
                                    <button
                                        onClick={() =>
                                            setActiveCategory(
                                                activeCategory === category.id ? null : category.id
                                            )
                                        }
                                        className="hover:bg-bg-subtle/30 flex w-full items-center gap-4 p-6 text-left transition-colors"
                                    >
                                        <motion.div
                                            whileHover={{
                                                rotate: [0, -8, 8, 0],
                                                transition: { duration: 0.5 },
                                            }}
                                            className={`flex size-11 items-center justify-center rounded-xl border ${category.color}`}
                                        >
                                            {category.icon}
                                        </motion.div>
                                        <div className="flex-grow">
                                            <h3 className="text-text-primary text-lg font-bold">
                                                {category.title}
                                            </h3>
                                            <p className="text-text-muted text-sm">
                                                {category.description}
                                            </p>
                                        </div>
                                        <span className="bg-bg-subtle text-text-muted rounded-full px-3 py-1 text-xs font-semibold">
                                            {category.endpoints.length}{' '}
                                            {category.endpoints.length === 1
                                                ? 'endpoint'
                                                : 'endpoints'}
                                        </span>
                                        <ChevronRight
                                            className={`text-text-muted size-5 transition-transform duration-200 ${
                                                activeCategory === category.id ? 'rotate-90' : ''
                                            }`}
                                        />
                                    </button>

                                    {/* Endpoints Accordion */}
                                    <AnimatePresence>
                                        {activeCategory === category.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                className="overflow-hidden"
                                            >
                                                <div className="border-border/30 border-t">
                                                    {category.endpoints.map((endpoint, eIdx) => (
                                                        <EndpointItem
                                                            key={eIdx}
                                                            endpoint={endpoint}
                                                        />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ── Rate Limits ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-24"
                    >
                        <div className="mb-10">
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <Clock className="text-accent" /> Rate Limits
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </div>

                        <div className="glass-card hover:border-accent/30 overflow-hidden rounded-2xl border border-transparent transition-all duration-300">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-border/30 border-b">
                                            <th className="text-text-muted px-6 py-4 font-semibold">
                                                Tier
                                            </th>
                                            <th className="text-text-muted px-6 py-4 font-semibold">
                                                Requests
                                            </th>
                                            <th className="text-text-muted px-6 py-4 font-semibold">
                                                Burst Limit
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {RATE_LIMITS.map((limit, idx) => (
                                            <tr
                                                key={idx}
                                                className="border-border/20 hover:bg-bg-subtle/30 border-b transition-colors last:border-b-0"
                                            >
                                                <td
                                                    className={`px-6 py-4 font-bold ${limit.color}`}
                                                >
                                                    {limit.tier}
                                                </td>
                                                <td className="text-text-primary px-6 py-4 font-mono text-sm">
                                                    {limit.requests}
                                                </td>
                                                <td className="text-text-secondary px-6 py-4 font-mono text-sm">
                                                    {limit.burst}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Error Codes ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-24"
                    >
                        <div className="mb-10">
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <Bug className="text-accent" /> Error Codes
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    code: '400',
                                    title: 'Bad Request',
                                    desc: 'Invalid parameters or malformed JSON body.',
                                    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                                },
                                {
                                    code: '401',
                                    title: 'Unauthorized',
                                    desc: 'Missing or invalid authentication token.',
                                    color: 'text-red-500 bg-red-500/10 border-red-500/20',
                                },
                                {
                                    code: '403',
                                    title: 'Forbidden',
                                    desc: 'Insufficient permissions for this action.',
                                    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
                                },
                                {
                                    code: '404',
                                    title: 'Not Found',
                                    desc: 'The requested resource does not exist.',
                                    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
                                },
                                {
                                    code: '429',
                                    title: 'Rate Limited',
                                    desc: 'Too many requests. Slow down and retry.',
                                    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
                                },
                                {
                                    code: '500',
                                    title: 'Server Error',
                                    desc: 'Something went wrong on our end.',
                                    color: 'text-red-600 bg-red-600/10 border-red-600/20',
                                },
                            ].map((error, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className="glass-card cursor-default rounded-xl border border-transparent p-5 transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className="mb-3 flex items-center gap-2.5">
                                        <span
                                            className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-bold ${error.color}`}
                                        >
                                            {error.code}
                                        </span>
                                        <span className="text-text-primary text-sm font-bold">
                                            {error.title}
                                        </span>
                                    </div>
                                    <p className="text-text-muted text-xs leading-relaxed">
                                        {error.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* ── SDKs & Resources ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="glass-card hover:border-accent/30 overflow-hidden rounded-3xl border border-transparent p-10 text-center transition-all duration-500 md:p-14">
                            <motion.div
                                whileHover={{
                                    rotate: [0, -8, 8, 0],
                                    transition: { duration: 0.5 },
                                }}
                                className="bg-accent/10 border-accent/20 text-accent mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border"
                            >
                                <Sparkles className="size-7" />
                            </motion.div>
                            <h2 className="text-text-primary mb-3 text-3xl font-bold tracking-tight">
                                Ready to Build?
                            </h2>
                            <p className="text-text-muted mx-auto mb-8 max-w-xl leading-relaxed">
                                Explore our SDKs, join the developer community, or dive straight
                                into the code. We are here to help you ship faster.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <a
                                    href="https://github.com/rabiulislam5334/CodeArena-TeamProject"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-accent hover:bg-accent-hover shadow-accent/20 hover:shadow-accent/30 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                >
                                    <Globe className="size-4" />
                                    GitHub SDK
                                    <ArrowRight className="size-4" />
                                </a>
                                <a
                                    href="/community"
                                    className="bg-bg-subtle text-text-primary border-border hover:border-accent/40 hover:shadow-accent/5 inline-flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-bold transition-all duration-300 hover:shadow-lg"
                                >
                                    <Users className="size-4" />
                                    Join Community
                                </a>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
