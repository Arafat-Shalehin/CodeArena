'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { featuresData } from '@/features/home/data/features.data'
import { stepsData } from '@/features/home/data/steps.data'
import { Zap, ShieldCheck, Code2, Globe, Server, Database, Lock } from 'lucide-react'

export default function DocumentationPage() {
    const techStack = [
        { name: 'Frontend', tech: 'Next.js 16, React 19, Tailwind CSS v4', icon: <Code2 /> },
        { name: 'Backend', tech: 'Node.js, Express, Socket.io', icon: <Server /> },
        { name: 'Database', tech: 'MongoDB (Mongoose), Redis', icon: <Database /> },
        { name: 'Execution', tech: 'Docker, dockerode (Sandboxed)', icon: <Lock /> },
        { name: 'Authentication', tech: 'Firebase Auth, JWT', icon: <ShieldCheck /> },
        { name: 'Deployment', tech: 'Docker Compose, Railway/Vercel', icon: <Globe /> },
    ]

    return (
        <div className="text-text-primary bg-bg-page site-gradient flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="mx-auto max-w-7xl px-4">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-20 text-center"
                    >
                        <h1 className="font-display text-text-primary mb-6 text-5xl font-extrabold tracking-tight md:text-7xl">
                            CodeArena <span className="text-accent italic">Documentation</span>
                        </h1>
                        <p className="text-text-muted mx-auto max-w-3xl text-lg leading-relaxed md:text-xl">
                            The premier platform for competitive programming. Built by engineers,
                            for engineers, CodeArena provides a secure and high-performance
                            environment to master algorithms and dominate global coding contests.
                        </p>
                    </motion.div>

                    {/* Features Section */}
                    <section className="mb-32">
                        <div className="mb-12">
                            <h2 className="text-text-primary flex items-center gap-3 text-3xl font-bold tracking-tight">
                                <Zap className="text-accent" /> Key Features
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {featuresData.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card hover:border-accent/30 rounded-3xl p-8 transition-all hover:shadow-lg"
                                >
                                    <div className="text-accent mb-6 [&_svg]:size-8">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-text-primary mb-3 text-xl font-bold">
                                        {feature.title}
                                    </h3>
                                    <p className="text-text-muted text-sm leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* How It Works (Flow) */}
                    <section className="mb-32">
                        <div className="mb-12 text-center">
                            <h2 className="text-text-primary text-3xl font-bold tracking-tight">
                                How the Platform Works
                            </h2>
                            <p className="text-text-muted mt-4">
                                A seamless journey from challenge selection to global ranking.
                            </p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {stepsData.map((step, idx) => (
                                <div key={idx} className="relative text-center">
                                    <div className="bg-bg-subtle mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-white/5 font-mono text-2xl font-black text-white shadow-xl">
                                        0{step.step}
                                    </div>
                                    <h3 className="text-text-primary mb-2 font-bold">
                                        {step.title}
                                    </h3>
                                    <p className="text-text-muted text-sm">{step.desc}</p>
                                    {idx < stepsData.length - 1 && (
                                        <div className="text-accent/20 absolute top-8 left-[calc(50%+4rem)] hidden w-full lg:block">
                                            <div className="h-[2px] w-1/2 bg-current" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tech Stack */}
                    <section>
                        <div className="mb-12">
                            <h2 className="text-text-primary flex items-center gap-3 text-3xl font-bold tracking-tight">
                                <Code2 className="text-accent" /> Technology Stack
                            </h2>
                            <div className="bg-accent mt-4 h-1 w-20 rounded-full" />
                        </div>
                        <div className="glass-card overflow-hidden rounded-[2.5rem]">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3">
                                {techStack.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="border-border/50 flex items-start gap-5 border-b p-8 last:border-b-0 md:p-10 lg:border-r lg:last:border-r-0"
                                    >
                                        <div className="bg-accent/10 border-accent/20 text-accent flex size-12 items-center justify-center rounded-xl border">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-text-primary font-bold">
                                                {item.name}
                                            </h4>
                                            <p className="text-text-muted mt-1 text-sm">
                                                {item.tech}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
