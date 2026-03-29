'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    Target,
    Sparkles,
    ShieldCheck,
    Cpu,
    Trophy,
    Users,
    Code2,
    Rocket,
    Github,
    Linkedin,
    ArrowRight,
    Heart,
    Globe,
    Zap,
} from 'lucide-react'

// ─── Marquee Items ───────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
    '🏆 Live Contests',
    '⚡ Sub-ms Judge',
    '🐳 Docker Sandbox',
    '🤖 AI Coach Alex',
    '📊 Elo Ratings',
    '🔒 Secure Execution',
    '🌍 5+ Languages',
    '🧠 Smart Hints',
    '📈 Real-time Leaderboard',
    '🎯 2,500+ Problems',
]

// ─── Team Data ───────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
    {
        name: 'Rabiul Islam',
        role: 'Architect / Lead',
        emoji: '👑',
        color: 'from-amber-500/20 to-amber-600/5',
        borderColor: 'border-amber-500/20 hover:border-amber-500/60',
        accentColor: 'text-amber-500',
        glowColor: 'hover:shadow-amber-500/10',
    },
    {
        name: 'Arafat Salehin',
        role: 'Engine / Backend',
        emoji: '🛡️',
        color: 'from-blue-500/20 to-blue-600/5',
        borderColor: 'border-blue-500/20 hover:border-blue-500/60',
        accentColor: 'text-blue-500',
        glowColor: 'hover:shadow-blue-500/10',
    },
    {
        name: 'AH Muzahid',
        role: 'Core Systems',
        emoji: '⚡',
        color: 'from-yellow-500/20 to-yellow-600/5',
        borderColor: 'border-yellow-500/20 hover:border-yellow-500/60',
        accentColor: 'text-yellow-500',
        glowColor: 'hover:shadow-yellow-500/10',
    },
    {
        name: 'Shahnawas Adeel',
        role: 'UI / UX Master',
        emoji: '🎨',
        color: 'from-pink-500/20 to-pink-600/5',
        borderColor: 'border-pink-500/20 hover:border-pink-500/60',
        accentColor: 'text-pink-500',
        glowColor: 'hover:shadow-pink-500/10',
    },
    {
        name: 'Abdullah Noman',
        role: 'Creative Frontend',
        emoji: '✨',
        color: 'from-purple-500/20 to-purple-600/5',
        borderColor: 'border-purple-500/20 hover:border-purple-500/60',
        accentColor: 'text-purple-500',
        glowColor: 'hover:shadow-purple-500/10',
    },
    {
        name: 'Ummey Salma Tamanna',
        role: 'Growth / Content',
        emoji: '🚀',
        color: 'from-accent/20 to-accent/5',
        borderColor: 'border-accent/20 hover:border-accent/60',
        accentColor: 'text-accent',
        glowColor: 'hover:shadow-accent/10',
    },
]

const MILESTONES = [
    { value: '2,500+', label: 'Coding Challenges', icon: <Code2 className="size-5" /> },
    { value: '5+', label: 'Languages Supported', icon: <Globe className="size-5" /> },
    { value: '10K+', label: 'Engineers Competing', icon: <Users className="size-5" /> },
    { value: '99.9%', label: 'Uptime', icon: <Zap className="size-5" /> },
]

const VALUES = [
    {
        icon: <ShieldCheck className="size-6" />,
        title: 'Security First',
        description:
            'Every line of submitted code executes inside isolated Docker sandboxes with strict memory and time limits — zero risk to our infrastructure.',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        hoverBorder: 'hover:border-blue-500/50',
    },
    {
        icon: <Zap className="size-6" />,
        title: 'Performance Obsessed',
        description:
            'Sub-millisecond judge accuracy, optimized rendering with React 19, and Redis-backed caching ensure a blazing-fast experience across the board.',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        hoverBorder: 'hover:border-amber-500/50',
    },
    {
        icon: <Heart className="size-6" />,
        title: 'Community Driven',
        description:
            'Built by competitive programmers, for competitive programmers. Every feature is shaped by real user feedback and competitive coding needs.',
        color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
        hoverBorder: 'hover:border-pink-500/50',
    },
    {
        icon: <Globe className="size-6" />,
        title: 'Open & Accessible',
        description:
            'Core features are free to use. We believe every aspiring engineer deserves access to world-class practice tools regardless of background.',
        color: 'text-accent bg-accent/10 border-accent/20',
        hoverBorder: 'hover:border-accent/50',
    },
]

// ─── Animation Variants ──────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12 },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
}

const scaleVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
}

// ─── Marquee Component ───────────────────────────────────────────────────
function Marquee() {
    // Double the items for seamless loop
    const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

    return (
        <div className="relative mb-24 overflow-hidden py-6">
            {/* Gradient faders on edges */}
            <div className="from-bg-page pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-24 bg-gradient-to-r to-transparent" />
            <div className="from-bg-page pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-24 bg-gradient-to-l to-transparent" />

            <div className="animate-marquee flex w-max gap-6">
                {doubled.map((item, idx) => (
                    <div
                        key={idx}
                        className="glass-card border-border/50 hover:border-accent/40 flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors"
                    >
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Page Component ──────────────────────────────────────────────────────
export default function AboutPage() {
    return (
        <div className="text-text-primary bg-bg-page site-gradient flex min-h-screen flex-col font-sans">
            <Navbar />

            {/* Marquee keyframes injected via style tag */}
            <style jsx>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>

            <main className="flex-grow pt-28 pb-24">
                <div className="mx-auto max-w-6xl px-4">
                    {/* ── Hero ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="mb-16 text-center"
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-6xl"
                        >
                            About <span className="text-accent italic">CodeArena</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.25 }}
                            className="text-text-muted mx-auto max-w-3xl text-lg leading-relaxed md:text-xl"
                        >
                            The ultimate production-grade competitive programming &amp; AI coaching
                            ecosystem. Built to elevate your engineering soul.
                        </motion.p>
                    </motion.div>

                    {/* ── Marquee ── */}
                    <Marquee />

                    {/* ── Stats Row ── */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-50px' }}
                        className="mb-28 grid grid-cols-2 gap-4 md:grid-cols-4"
                    >
                        {MILESTONES.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                                className="glass-card group hover:border-accent/40 hover:shadow-accent/5 cursor-default rounded-2xl border border-transparent p-6 text-center transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="text-accent mx-auto mb-2 flex justify-center opacity-60 transition-opacity group-hover:opacity-100">
                                    {stat.icon}
                                </div>
                                <div className="text-accent text-3xl font-black md:text-4xl">
                                    {stat.value}
                                </div>
                                <div className="text-text-muted mt-1 text-sm font-medium">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* ── Mission ── */}
                    <motion.section
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.7 }}
                        className="mb-28"
                    >
                        <div className="glass-card hover:border-accent/30 hover:shadow-accent/5 overflow-hidden rounded-3xl border border-transparent transition-all duration-500 hover:shadow-2xl">
                            <div className="grid items-center gap-10 p-10 md:grid-cols-2 md:p-14">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.15 }}
                                >
                                    <div className="bg-accent/10 border-accent/20 text-accent mb-6 flex size-14 items-center justify-center rounded-2xl border">
                                        <Target className="size-7" />
                                    </div>
                                    <h2 className="text-text-primary mb-4 text-3xl font-bold tracking-tight">
                                        Our Mission
                                    </h2>
                                    <p className="text-text-muted leading-relaxed">
                                        CodeArena exists to democratize competitive programming. We
                                        provide a secure, high-performance environment where
                                        engineers of all skill levels can practice algorithms,
                                        compete in live contests, and get real-time AI coaching —
                                        all within a single, beautifully crafted platform.
                                    </p>
                                </motion.div>

                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="space-y-4"
                                >
                                    {[
                                        {
                                            icon: (
                                                <Cpu className="text-accent mt-0.5 size-5 shrink-0" />
                                            ),
                                            title: 'Isolated Execution',
                                            desc: 'Docker-based sandboxed judge for C++, Python, Java, JavaScript, and Go.',
                                        },
                                        {
                                            icon: (
                                                <Sparkles className="text-accent mt-0.5 size-5 shrink-0" />
                                            ),
                                            title: 'AI Coach "Alex"',
                                            desc: 'Adaptive AI interview prep with real-time feedback, hints, and evaluation powered by Groq.',
                                        },
                                        {
                                            icon: (
                                                <Trophy className="text-accent mt-0.5 size-5 shrink-0" />
                                            ),
                                            title: 'Live Contests',
                                            desc: 'Real-time leaderboards, Elo ratings, and timed competitive rounds with plagiarism detection.',
                                        },
                                    ].map((feature, idx) => (
                                        <motion.div
                                            key={idx}
                                            variants={itemVariants}
                                            whileHover={{ x: 6, transition: { duration: 0.2 } }}
                                            className="bg-bg-subtle hover:border-accent/30 flex cursor-default items-start gap-4 rounded-2xl border border-transparent p-5 transition-all duration-300 hover:shadow-md"
                                        >
                                            {feature.icon}
                                            <div>
                                                <h4 className="text-text-primary font-bold">
                                                    {feature.title}
                                                </h4>
                                                <p className="text-text-muted mt-1 text-sm">
                                                    {feature.desc}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </motion.section>

                    {/* ── Values ── */}
                    <section className="mb-28">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-10"
                        >
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <Rocket className="text-accent" /> What We Stand For
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            className="grid gap-6 md:grid-cols-2"
                        >
                            {VALUES.map((value, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={scaleVariants}
                                    whileHover={{
                                        y: -5,
                                        scale: 1.01,
                                        transition: { duration: 0.25 },
                                    }}
                                    className={`glass-card cursor-default rounded-2xl border border-transparent p-8 transition-all duration-300 hover:shadow-xl ${value.hoverBorder}`}
                                >
                                    <motion.div
                                        whileHover={{
                                            rotate: [0, -8, 8, 0],
                                            transition: { duration: 0.5 },
                                        }}
                                        className={`mb-5 flex size-12 items-center justify-center rounded-xl border ${value.color}`}
                                    >
                                        {value.icon}
                                    </motion.div>
                                    <h3 className="text-text-primary mb-2 text-lg font-bold">
                                        {value.title}
                                    </h3>
                                    <p className="text-text-muted text-sm leading-relaxed">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </section>

                    {/* ── Meet the Team ── */}
                    <section>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-10 text-center"
                        >
                            <h2 className="text-text-primary text-3xl font-bold tracking-tight">
                                Meet the Team
                            </h2>
                            <p className="text-text-muted mt-3">
                                The engineers behind CodeArena — united by a passion for clean code
                                and competitive excellence.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {TEAM_MEMBERS.map((member, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={scaleVariants}
                                    whileHover={{
                                        y: -8,
                                        scale: 1.03,
                                        transition: { duration: 0.3, ease: 'easeOut' },
                                    }}
                                    className={`group relative cursor-default overflow-hidden rounded-2xl border bg-gradient-to-br p-7 transition-all duration-300 hover:shadow-2xl ${member.color} ${member.borderColor} ${member.glowColor}`}
                                >
                                    {/* Animated shimmer on hover */}
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                                    <div className="relative">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.2,
                                                rotate: [0, -10, 10, 0],
                                                transition: { duration: 0.4 },
                                            }}
                                            className="mb-4 inline-block text-4xl"
                                        >
                                            {member.emoji}
                                        </motion.div>
                                        <h3 className="text-text-primary text-lg font-bold">
                                            {member.name}
                                        </h3>
                                        <p
                                            className={`mt-1 text-sm font-semibold ${member.accentColor}`}
                                        >
                                            {member.role}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* GitHub CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="mt-16 text-center"
                        >
                            <Link
                                href="https://github.com/rabiulislam5334/CodeArena-TeamProject"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-accent hover:bg-accent-hover shadow-accent/20 hover:shadow-accent/30 inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            >
                                <Github className="size-5" />
                                Star us on GitHub
                                <ArrowRight className="size-4" />
                            </Link>
                        </motion.div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
