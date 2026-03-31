'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, BarChart3, ArrowRight, Bot, Code, Mic, Play, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroWithPixelBackground from '@/components/hero-with-pixelbackground.jsx'
import { Tiles } from '@/components/ui/tiles'

const sectionVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
}

const FeatureCard = ({ icon: Icon, title, description }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="group border-border bg-bg-subtle/50 hover:bg-bg-subtle hover:border-accent/40 relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-xl"
    >
        <div className="relative z-10 space-y-3">
            <div className="bg-bg-page border-border group-hover:border-accent/30 flex h-10 w-10 items-center justify-center rounded-lg border shadow-inner transition-all duration-300 group-hover:scale-105">
                <Icon className="text-accent h-5 w-5 transition-transform duration-300" />
            </div>
            <h3 className="text-text-primary text-lg font-bold tracking-tight">{title}</h3>
            <p className="text-text-secondary text-xs leading-relaxed font-medium opacity-70">
                {description}
            </p>
        </div>
    </motion.div>
)

const BentoStep = ({ number, title, description }) => (
    <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01, y: -2 }}
        className="group border-border bg-bg-subtle/30 hover:border-accent/20 relative rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl"
    >
        <div className="flex flex-col gap-4">
            <div className="bg-bg-page border-border group-hover:border-accent/30 flex h-11 w-11 items-center justify-center rounded-xl border shadow-lg transition-all duration-300 group-hover:scale-105">
                <span className="text-accent text-xl font-bold">{number}</span>
            </div>
            <div className="space-y-2">
                <h3 className="text-text-primary text-xl font-bold tracking-tight">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed font-medium opacity-70">
                    {description}
                </p>
            </div>
        </div>
    </motion.div>
)

export default function InterviewLandingPage() {
    return (
        <main className="bg-bg-page selection:bg-accent/30 text-rendering-optimize min-h-screen">
            {/* Master Hero: High-density, professional layout */}
            <HeroWithPixelBackground
                badge="Next-Gen AI Interviewing"
                title={
                    <>
                        Interviewing,{' '}
                        <span className="text-accent font-serif tracking-tight italic">
                            Reimagined.
                        </span>
                    </>
                }
                subtitle="Practice DSA and architectural problems in a live environment with Alex—your AI career coach."
                primary={{ label: 'START NEW SESSION', href: '/interview/new' }}
                secondary={{ label: 'VIEW HISTORY', href: '/interview/history' }}
            />

            {/* Performance Bento Section */}
            <section className="relative container mx-auto max-w-7xl px-6 py-16">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={sectionVariants}
                    className="mb-12 space-y-2"
                >
                    <h2 className="text-text-primary text-3xl leading-none font-bold tracking-tighter md:text-5xl">
                        Built for Performance.
                    </h2>
                    <p className="text-text-secondary max-w-xl text-sm font-medium opacity-60">
                        Everything you need to master elite technical interviews in one seamless,
                        static, and performant platform.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
                >
                    <FeatureCard
                        icon={Bot}
                        title="Adaptive AI"
                        description="Alex adjusts difficulty and hints based on your performance, simulating a Lead Engineer."
                    />
                    <FeatureCard
                        icon={Code}
                        title="Isolated Sandbox"
                        description="A secure environment to run code in 15+ languages with real-time test output."
                    />
                    <FeatureCard
                        icon={BarChart3}
                        title="Deep Evaluation"
                        description="Post-session reports covering algorithmic complexity, clean code, and clarity."
                    />
                    <FeatureCard
                        icon={Shield}
                        title="Stress Simulation"
                        description="Experience Big Tech pressure with strict time-limits and live follow-ups."
                    />
                    <FeatureCard
                        icon={Play}
                        title="Session Replays"
                        description="Review every message and code change to see exactly where you can improve."
                    />
                    <FeatureCard
                        icon={Mic}
                        title="Voice Training"
                        description="Low-latency audio interaction for immersive, hands-free practicing."
                    />
                </motion.div>
            </section>

            {/* The Protocol - High-density 2x2 Bento Protocol */}
            <section className="bg-bg-subtle/10 border-border/40 relative overflow-hidden border-y px-6 py-20">
                {/* Subtle Tile Background Overlay */}
                <div className="absolute inset-0 z-0 opacity-[0.05]">
                    <Tiles
                        rows={20}
                        cols={15}
                        tileClassName="border-neutral-300 dark:border-neutral-800/10"
                    />
                </div>

                <div className="relative z-10 container mx-auto max-w-7xl">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={sectionVariants}
                        className="mb-12 space-y-2 text-center"
                    >
                        <span className="text-accent text-[9px] font-bold tracking-[0.4em] uppercase">
                            The Methodology
                        </span>
                        <h2 className="text-text-primary text-center text-4xl leading-none font-bold tracking-tighter md:text-6xl">
                            Elite Training Loop.
                        </h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={containerVariants}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                    >
                        <BentoStep
                            number="01"
                            title="Pick Your Focus"
                            description="Select from curated problems or let Alex surprise you."
                        />
                        <BentoStep
                            number="02"
                            title="Face the AI"
                            description="Alex will introduce the problem and probe architectural decisions."
                        />
                        <BentoStep
                            number="03"
                            title="Code & Communicate"
                            description="Solve in the editor while explaining logic via live chat."
                        />
                        <BentoStep
                            number="04"
                            title="Expert Analysis"
                            description="Receive feedback normally reserved for hiring committees."
                        />
                    </motion.div>
                </div>
            </section>

            {/* Final Balanced CTA - High-Density Side-by-Side */}
            <section className="container mx-auto max-w-7xl px-6 py-24">
                <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center">
                    {/* Insights Preview (40%) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full lg:w-[40%]"
                    >
                        <div className="bg-bg-subtle border-border hover:border-accent/10 relative overflow-hidden rounded-2xl border p-6 shadow-lg transition-colors duration-300 md:p-8">
                            <div className="mb-8 space-y-1">
                                <h4 className="text-text-primary text-xl font-bold tracking-tight italic">
                                    Growth Track
                                </h4>
                                <p className="text-text-muted text-[9px] font-bold tracking-[0.4em] uppercase opacity-50">
                                    Level #12 Analysis
                                </p>
                            </div>

                            <div className="relative space-y-6">
                                {[
                                    { label: 'Technical Communication', score: 88 },
                                    { label: 'Problem Solving Speed', score: 94 },
                                    { label: 'Code Architecture', score: 82 },
                                ].map((stat, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold tracking-tight uppercase opacity-60">
                                            <span>{stat.label}</span>
                                            <span className="text-accent">{stat.score}%</span>
                                        </div>
                                        <div className="bg-bg-page border-border/30 h-1.5 w-full overflow-hidden rounded-full border">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${stat.score}%` }}
                                                transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                                                className="bg-accent h-full rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex justify-start">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-bg-page border-border flex items-center gap-3 rounded-xl border px-4 py-3 shadow-md"
                                >
                                    <Trophy className="text-accent h-5 w-5" />
                                    <div className="text-left">
                                        <p className="text-text-primary text-xs font-bold uppercase">
                                            Top 5% Tier
                                        </p>
                                        <p className="text-text-muted text-[9px] font-bold tracking-widest uppercase opacity-50">
                                            Senior Engineer Status
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content (55%) */}
                    <div className="w-full space-y-8 text-left lg:w-[55%]">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-4"
                        >
                            <h2 className="text-text-primary text-4xl leading-[1.1] font-bold tracking-tighter md:text-6xl">
                                Your Dream Offer is <br />
                                <span className="text-accent font-normal tracking-tight italic">
                                    One Practice Away.
                                </span>
                            </h2>
                            <p className="text-text-secondary max-w-lg text-base leading-relaxed font-medium opacity-60">
                                Stop guessing. Our AI evaluations provide the exact feedback needed
                                to break through the FAANG barrier.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            className="flex flex-col gap-4 sm:flex-row"
                        >
                            <Link href="/interview/new">
                                <Button
                                    size="lg"
                                    className="bg-accent hover:bg-accent-hover shadow-accent/10 h-14 rounded-xl px-10 text-sm text-black shadow-lg transition-all hover:scale-105 active:scale-95"
                                >
                                    Launch Interview
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/interview/history">
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="border-border bg-bg-subtle/40 text-text-primary hover:bg-bg-subtle hover:border-accent/20 h-14 rounded-xl border px-10 text-sm transition-all hover:scale-105"
                                >
                                    View History
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            <footer className="border-border border-t py-10 text-center opacity-30">
                <p className="text-text-muted text-[9px] font-bold tracking-[0.4em] uppercase">
                    CodeArena AI • Next Gen Engineering Protocol
                </p>
            </footer>
        </main>
    )
}
