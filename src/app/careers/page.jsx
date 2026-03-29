'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    Briefcase,
    MapPin,
    Clock,
    ArrowRight,
    Search,
    Zap,
    Heart,
    Rocket,
    Globe,
    Code2,
    Shield,
    Users,
    ChevronDown,
    Star,
} from 'lucide-react'

// ─── Perks ───────────────────────────────────────────────────────────────
const PERKS = [
    {
        icon: <Rocket className="size-6" />,
        title: 'Cutting-Edge Stack',
        desc: 'Work with Next.js 16, React 19, Docker sandbox engines, and AI-powered coaching systems.',
        color: 'text-accent bg-accent/10 border-accent/20',
    },
    {
        icon: <Globe className="size-6" />,
        title: 'Remote First',
        desc: 'Work from anywhere in the world. We care about output, not office hours.',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
        icon: <Heart className="size-6" />,
        title: 'Health & Wellness',
        desc: 'Comprehensive health insurance, mental health support, and generous paid time off.',
        color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    },
    {
        icon: <Zap className="size-6" />,
        title: 'Growth Budget',
        desc: 'Annual learning stipend for courses, conferences, books, and certifications.',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
        icon: <Users className="size-6" />,
        title: 'Small, Elite Team',
        desc: 'No bureaucracy. Ship fast with a team of passionate engineers who love what they build.',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
        icon: <Star className="size-6" />,
        title: 'Equity & Impact',
        desc: 'Meaningful equity packages and direct impact on a platform used by thousands of engineers.',
        color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    },
]

// ─── Open Positions ──────────────────────────────────────────────────────
const POSITIONS = [
    {
        id: 1,
        title: 'Senior Full-Stack Engineer',
        team: 'Engineering',
        location: 'Remote',
        type: 'Full-time',
        description:
            'Build and scale our core platform — from the judge execution engine to real-time contest infrastructure. You will own critical systems used by thousands of competitive programmers daily.',
        requirements: [
            'Strong proficiency in Next.js, React, and Node.js',
            'Experience with Docker, Redis, and MongoDB at scale',
            'Passion for competitive programming or developer tools',
            '3+ years of professional full-stack experience',
        ],
    },
    {
        id: 2,
        title: 'AI/ML Engineer',
        team: 'AI & Coaching',
        location: 'Remote',
        type: 'Full-time',
        description:
            'Design and improve our AI coaching system "Alex" — including adaptive interview prep, real-time hint generation, and intelligent code evaluation pipelines.',
        requirements: [
            'Experience with LLM integration (Groq, OpenAI, or similar)',
            'Strong Python and prompt engineering skills',
            'Understanding of code analysis and AST manipulation',
            'Background in NLP or educational AI systems is a plus',
        ],
    },
    {
        id: 3,
        title: 'Frontend Engineer',
        team: 'Product',
        location: 'Remote',
        type: 'Full-time',
        description:
            'Craft pixel-perfect, highly interactive UI components for our code editor, contest pages, and leaderboard systems. Performance and accessibility are your obsession.',
        requirements: [
            'Expert-level React and Tailwind CSS knowledge',
            'Experience with Framer Motion and complex animations',
            'Familiarity with Monaco Editor or similar code editors',
            'Eye for premium, modern web design',
        ],
    },
    {
        id: 4,
        title: 'DevOps / Infrastructure Engineer',
        team: 'Platform',
        location: 'Remote',
        type: 'Full-time',
        description:
            'Own and evolve our Docker-based sandboxed code execution pipeline, CI/CD workflows, and cloud infrastructure to ensure 99.9% uptime and sub-second judge responses.',
        requirements: [
            'Deep Docker and container orchestration expertise',
            'Experience with Railway, Vercel, or AWS deployments',
            'Strong Linux, networking, and security fundamentals',
            'Monitoring and observability experience (Prometheus, Grafana)',
        ],
    },
    {
        id: 5,
        title: 'Content & Community Lead',
        team: 'Growth',
        location: 'Remote',
        type: 'Part-time',
        description:
            'Grow the CodeArena community through problem curation, blog content, social media presence, and community engagement programs for competitive programmers.',
        requirements: [
            'Strong writing and content strategy skills',
            'Active in competitive programming communities',
            'Experience managing developer communities or forums',
            'Social media marketing skills are a plus',
        ],
    },
]

const TEAMS = ['All', 'Engineering', 'AI & Coaching', 'Product', 'Platform', 'Growth']

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

// ─── Page Component ──────────────────────────────────────────────────────
export default function CareersPage() {
    const [activeTeam, setActiveTeam] = useState('All')
    const [expandedJob, setExpandedJob] = useState(null)

    const filteredPositions =
        activeTeam === 'All' ? POSITIONS : POSITIONS.filter((p) => p.team === activeTeam)

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
                        className="mb-8 text-center"
                    >
                        <h1 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
                            Join <span className="text-accent italic">CodeArena</span>
                        </h1>
                        <p className="text-text-muted mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
                            Help us build the future of competitive programming. We are looking for
                            exceptional engineers who are passionate about developer tools,
                            algorithms, and great software.
                        </p>
                    </motion.div>

                    {/* ── Open Positions Count Badge ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-20 text-center"
                    >
                        <span className="bg-accent/10 text-accent border-accent/20 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-bold">
                            <Briefcase className="size-4" />
                            {POSITIONS.length} Open Positions
                        </span>
                    </motion.div>

                    {/* ── Why Join Us / Perks ── */}
                    <section className="mb-28">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-10"
                        >
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <Zap className="text-accent" /> Why Join Us
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {PERKS.map((perk, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{
                                        y: -6,
                                        scale: 1.02,
                                        transition: { duration: 0.25 },
                                    }}
                                    className="glass-card hover:border-accent/30 hover:shadow-accent/5 cursor-default rounded-2xl border border-transparent p-7 transition-all duration-300 hover:shadow-xl"
                                >
                                    <motion.div
                                        whileHover={{
                                            rotate: [0, -8, 8, 0],
                                            transition: { duration: 0.5 },
                                        }}
                                        className={`mb-5 flex size-12 items-center justify-center rounded-xl border ${perk.color}`}
                                    >
                                        {perk.icon}
                                    </motion.div>
                                    <h3 className="text-text-primary mb-2 text-lg font-bold">
                                        {perk.title}
                                    </h3>
                                    <p className="text-text-muted text-sm leading-relaxed">
                                        {perk.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>

                    {/* ── Open Positions ── */}
                    <section>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-10"
                        >
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <Briefcase className="text-accent" /> Open Positions
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </motion.div>

                        {/* Team Filter */}
                        <div className="mb-8 flex flex-wrap gap-2">
                            {TEAMS.map((team) => (
                                <button
                                    key={team}
                                    onClick={() => setActiveTeam(team)}
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                                        activeTeam === team
                                            ? 'bg-accent shadow-accent/20 text-white shadow-lg'
                                            : 'bg-bg-subtle text-text-muted hover:bg-bg-muted hover:text-text-primary'
                                    }`}
                                >
                                    {team}
                                </button>
                            ))}
                        </div>

                        {/* Job Listings */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            {filteredPositions.length > 0 ? (
                                filteredPositions.map((job) => {
                                    const isOpen = expandedJob === job.id
                                    return (
                                        <motion.div
                                            key={job.id}
                                            variants={itemVariants}
                                            layout
                                            className={`glass-card group overflow-hidden rounded-2xl border transition-all duration-300 ${
                                                isOpen
                                                    ? 'border-accent/30 shadow-accent/5 shadow-xl'
                                                    : 'hover:border-accent/20 border-transparent'
                                            }`}
                                        >
                                            {/* Header row */}
                                            <button
                                                onClick={() =>
                                                    setExpandedJob(isOpen ? null : job.id)
                                                }
                                                className="flex w-full items-center justify-between p-6 text-left"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-text-primary group-hover:text-accent mb-2 text-lg font-bold transition-colors">
                                                        {job.title}
                                                    </h3>
                                                    <div className="text-text-muted flex flex-wrap items-center gap-4 text-xs">
                                                        <span className="bg-accent/10 text-accent rounded-md px-2 py-0.5 text-[11px] font-semibold">
                                                            {job.team}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="size-3" />
                                                            {job.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            {job.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronDown
                                                    className={`text-text-muted ml-4 shrink-0 transition-transform duration-300 ${
                                                        isOpen ? 'text-accent rotate-180' : ''
                                                    }`}
                                                    size={20}
                                                />
                                            </button>

                                            {/* Expanded Details */}
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    transition={{ duration: 0.35 }}
                                                    className="border-border/30 border-t"
                                                >
                                                    <div className="space-y-5 p-6 pt-5">
                                                        <p className="text-text-muted text-sm leading-relaxed">
                                                            {job.description}
                                                        </p>

                                                        <div>
                                                            <h4 className="text-text-primary mb-3 text-sm font-bold">
                                                                Requirements
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {job.requirements.map(
                                                                    (req, idx) => (
                                                                        <li
                                                                            key={idx}
                                                                            className="text-text-muted flex items-start gap-2 text-sm"
                                                                        >
                                                                            <Code2 className="text-accent mt-0.5 size-3.5 shrink-0" />
                                                                            {req}
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>

                                                        <a
                                                            href={`mailto:careers@codearena.com?subject=Application: ${job.title}`}
                                                            className="bg-accent hover:bg-accent-hover shadow-accent/20 hover:shadow-accent/30 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                                        >
                                                            Apply Now
                                                            <ArrowRight className="size-4" />
                                                        </a>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )
                                })
                            ) : (
                                <div className="py-16 text-center">
                                    <div className="bg-bg-subtle mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-white/5">
                                        <Search className="text-text-muted size-7" />
                                    </div>
                                    <h3 className="text-text-primary text-lg font-bold">
                                        No positions in this team
                                    </h3>
                                    <p className="text-text-muted mt-1 text-sm">
                                        Try selecting a different team or check back later.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
