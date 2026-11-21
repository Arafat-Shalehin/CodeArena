'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    ShieldCheck,
    Heart,
    MessageSquare,
    AlertTriangle,
    Ban,
    ThumbsUp,
    Users,
    BookOpen,
    Scale,
    CheckCircle2,
    XCircle,
} from 'lucide-react'

const CORE_RULES = [
    {
        icon: <Heart className="size-6" />,
        title: 'Be Respectful',
        description:
            'Treat every member with courtesy. Harassment, hate speech, and personal attacks are strictly prohibited regardless of the context.',
        color: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    },
    {
        icon: <MessageSquare className="size-6" />,
        title: 'Stay On Topic',
        description:
            'Keep discussions relevant to competitive programming, algorithms, data structures, and software engineering. Off-topic content may be removed.',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
        icon: <BookOpen className="size-6" />,
        title: 'Share Knowledge',
        description:
            'Help others learn by sharing well-explained solutions. When answering questions, provide reasoning and context — not just code.',
        color: 'text-accent bg-accent/10 border-accent/20',
    },
    {
        icon: <Scale className="size-6" />,
        title: 'Play Fair',
        description:
            'Do not share solutions to active contest problems. Plagiarism, cheating, and multi-accounting will result in a permanent ban.',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
        icon: <ShieldCheck className="size-6" />,
        title: 'Protect Privacy',
        description:
            'Never share personal information about yourself or others. Do not post private conversations without explicit consent.',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
        icon: <Users className="size-6" />,
        title: 'Welcome Newcomers',
        description:
            'Everyone starts somewhere. Be patient with beginners and guide them constructively instead of dismissing their questions.',
        color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    },
]

const DO_LIST = [
    'Write clear, well-formatted posts with proper code blocks',
    'Search for existing threads before creating a new one',
    'Use tags to categorize your discussions accurately',
    'Upvote helpful answers to surface the best content',
    'Report content that violates these guidelines',
    "Give credit when referencing others' solutions or ideas",
]

const DONT_LIST = [
    'Share solutions to ongoing contest problems',
    'Spam, self-promote, or post irrelevant content',
    'Use offensive language, slurs, or discriminatory terms',
    'Create multiple accounts to manipulate votes or evade bans',
    'Post malicious code or links to harmful resources',
    'Engage in targeted harassment or doxxing',
]

const CONSEQUENCES = [
    {
        level: 'Warning',
        description: 'First-time or minor violations receive a written warning from moderators.',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
        level: 'Temporary Mute',
        description: 'Repeated violations result in a 7-day posting restriction across all forums.',
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    },
    {
        level: 'Temporary Ban',
        description:
            'Serious offenses lead to a 30-day account suspension with full access revocation.',
        color: 'text-red-400 bg-red-400/10 border-red-400/20',
    },
    {
        level: 'Permanent Ban',
        description:
            'Extreme or repeated violations result in permanent removal from the platform.',
        color: 'text-red-600 bg-red-600/10 border-red-600/20',
    },
]

export default function GuidelinesPage() {
    return (
        <div className="text-text-primary bg-bg-page site-gradient flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-28 pb-24">
                <div className="mx-auto max-w-5xl px-4">
                    {/* Hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-20 text-center"
                    >
                        <h1 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
                            Community <span className="text-accent italic">Guidelines</span>
                        </h1>
                        <p className="text-text-muted mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
                            CodeArena thrives when every member contributes positively. These
                            guidelines help us maintain a welcoming, fair, and productive
                            environment for all engineers.
                        </p>
                    </motion.div>

                    {/* Core Rules Grid */}
                    <section className="mb-24">
                        <div className="mb-10">
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <ShieldCheck className="text-accent" /> Core Principles
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {CORE_RULES.map((rule, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.08 }}
                                    className="glass-card hover:border-accent/30 rounded-2xl p-7 transition-all"
                                >
                                    <div
                                        className={`mb-5 flex size-12 items-center justify-center rounded-xl border ${rule.color}`}
                                    >
                                        {rule.icon}
                                    </div>
                                    <h3 className="text-text-primary mb-2 text-lg font-bold">
                                        {rule.title}
                                    </h3>
                                    <p className="text-text-muted text-sm leading-relaxed">
                                        {rule.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Do's and Don'ts */}
                    <section className="mb-24">
                        <div className="mb-10 text-center">
                            <h2 className="text-text-primary text-2xl font-bold tracking-tight">
                                Do's &amp; Don'ts
                            </h2>
                            <p className="text-text-muted mt-3">
                                A quick reference for acceptable and unacceptable behaviour.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Do's */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="glass-card rounded-2xl p-8"
                            >
                                <h3 className="text-accent mb-6 flex items-center gap-2 text-lg font-bold">
                                    <ThumbsUp className="size-5" /> Do
                                </h3>
                                <ul className="space-y-4">
                                    {DO_LIST.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm">
                                            <CheckCircle2 className="text-accent mt-0.5 size-4 shrink-0" />
                                            <span className="text-text-secondary">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Don'ts */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="glass-card rounded-2xl p-8"
                            >
                                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-red-500">
                                    <Ban className="size-5" /> Don't
                                </h3>
                                <ul className="space-y-4">
                                    {DONT_LIST.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm">
                                            <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                                            <span className="text-text-secondary">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>
                    </section>

                    {/* Enforcement */}
                    <section>
                        <div className="mb-10">
                            <h2 className="text-text-primary flex items-center gap-3 text-2xl font-bold tracking-tight">
                                <AlertTriangle className="text-accent" /> Enforcement
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                            <p className="text-text-muted mt-4 max-w-2xl text-sm leading-relaxed">
                                Violations are reviewed by our moderation team. The severity of
                                consequences depends on the nature and frequency of the offense.
                            </p>
                        </div>

                        <div className="glass-card overflow-hidden rounded-2xl">
                            {CONSEQUENCES.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="border-border/30 flex items-center gap-5 border-b p-6 last:border-b-0"
                                >
                                    <div
                                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${item.color}`}
                                    >
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-text-primary font-bold">
                                            {item.level}
                                        </h4>
                                        <p className="text-text-muted mt-0.5 text-sm">
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
