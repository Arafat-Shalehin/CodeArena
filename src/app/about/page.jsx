'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FeatureCard from '@/components/features/FeatureCard'
import {
    ShieldCheck,
    Cpu,
    Trophy,
    Users,
    Code2,
    Github,
    Linkedin,
    ArrowRight,
    Heart,
    Globe,
    Zap,
    ExternalLink,
    Terminal,
    Layers,
    MoveRight,
} from 'lucide-react'

// ─── Team Data ───────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
    {
        name: 'Rabiul Islam',
        role: 'Lead / Engine',
        image: '/team/rabiul.png',
        github: '#',
        linkedin: '#',
    },
    {
        name: 'Arafat Salehin',
        role: 'Engine / Backend',
        image: '/team/arafat.jpg',
        github: '#',
        linkedin: '#',
    },
    {
        name: 'AH Muzahid',
        role: 'Core Systems',
        image: '/team/muzahid.png',
        github: '#',
        linkedin: '#',
    },
    {
        name: 'Shahnawas Adeel',
        role: 'UI / UX Master',
        image: '/team/adeel.jpeg',
        github: '#',
        linkedin: '#',
        blogSlug: 'ux-design-for-developers',
    },
    {
        name: 'Abdullah Noman',
        role: 'Creative Frontend',
        image: '/team/noman.png',
        github: '#',
        linkedin: '#',
    },
    {
        name: 'Ummey Salma Tamanna',
        role: 'Growth / Content',
        image: '/team/tamanna.jpg',
        github: '#',
        linkedin: '#',
    },
]

const MILESTONES = [
    { value: '2,500+', label: 'Challenges', icon: Code2 },
    { value: '5+', label: 'Languages', icon: Globe },
    { value: '10K+', label: 'Engineers', icon: Users },
    { value: '99.9%', label: 'Uptime', icon: Zap },
]

const CORE_TECH = [
    {
        icon: Terminal,
        title: 'Next.js 16',
        description: 'Server-side rendering & optimized routing for instant interaction.',
        tags: ['Frontend', 'Vercel'],
    },
    {
        icon: Layers,
        title: 'Docker',
        description: 'Isolated, secure container orchestration for untrusted code execution.',
        tags: ['DevOps', 'Sandbox'],
    },
    {
        icon: Zap,
        title: 'Redis',
        description: 'Blazing fast caching & background job management at scale.',
        tags: ['Infra', 'Cache'],
    },
    {
        icon: Cpu,
        title: 'MongoDB',
        description: 'Reliable, document-based data persistence for high-concurrency.',
        tags: ['Database', 'NoSQL'],
    },
]

const VALUES = [
    {
        icon: ShieldCheck,
        title: 'Security First',
        description:
            'Every line of submitted code executes inside isolated Docker sandboxes with strict limits.',
    },
    {
        icon: Zap,
        title: 'Performance',
        description:
            'Sub-millisecond judge accuracy and optimized rendering for a fluid experience.',
    },
    {
        icon: Heart,
        title: 'Community',
        description:
            'Built by competitive programmers, for competitive programmers. User-shaped features.',
    },
    {
        icon: Globe,
        title: 'Accessible',
        description:
            'Core features are free. We believe every aspiring engineer deserves world-class tools.',
    },
]

export default function AboutPage() {
    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            <Navbar />

            <main className="max-w-container mx-auto px-4 pt-16 pb-24 md:px-6">
                {/* ── Hero Section ── */}
                <section className="border-border mb-16 border-b py-8 text-center">
                    {/* Hero — CSS animation replaces framer-motion for a zero-JS fade-in */}
                    <div className="animate-in fade-in duration-500">
                        <h1 className="text-text-primary mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                            Redefining the <span className="text-accent italic">Coding Arena</span>
                        </h1>
                        <p className="text-text-secondary mx-auto max-w-2xl text-lg leading-relaxed">
                            From sub-millisecond judgment to AI-powered coaching, we've built the
                            ultimate ecosystem for engineers to master their craft.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="https://github.com/rabiulislam5334/CodeArena-TeamProject"
                                target="_blank"
                                className="bg-bg-subtle hover:bg-bg-muted text-text-primary border-border duration-normal inline-flex items-center justify-center gap-2 rounded-md border px-6 py-2.5 text-sm font-semibold transition-colors"
                            >
                                <Github className="size-4" />
                                <span>Star on GitHub</span>
                            </Link>
                            <Link
                                href="/contests"
                                className="bg-accent hover:bg-accent-hover duration-normal inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-sm font-semibold text-white transition-colors"
                            >
                                <span>Explore Contests</span>
                                <MoveRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Stats ── */}
                <div className="mb-24 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {MILESTONES.map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-bg-subtle border-border rounded-lg border p-6 text-center shadow-sm"
                        >
                            <div className="text-accent mb-2 flex justify-center">
                                <stat.icon className="size-5" />
                            </div>
                            <div className="text-text-primary text-2xl font-bold">{stat.value}</div>
                            <div className="text-text-muted mt-1 text-xs font-medium tracking-wide uppercase">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Mission & Core Tech ── */}
                <div className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-12">
                    <div className="flex flex-col justify-center lg:col-span-5">
                        <h2 className="text-text-primary mb-6 text-3xl font-semibold">
                            Our Mission
                        </h2>
                        <p className="text-text-secondary mb-8 text-base leading-relaxed">
                            CodeArena democratizes competitive programming by providing a secure,
                            high-performance environment where every developer can master algorithms
                            through real-time feedback and state-of-the-art AI evaluation.
                        </p>
                        <div className="space-y-4">
                            {VALUES.map((val, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="mt-1 flex-shrink-0">
                                        <val.icon className="text-accent size-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-text-primary text-sm font-bold">
                                            {val.title}
                                        </h4>
                                        <p className="text-text-secondary text-sm leading-snug">
                                            {val.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <h2 className="text-text-primary mb-6 text-2xl font-semibold">
                            Built with Excellence
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {CORE_TECH.map((tech, idx) => (
                                <FeatureCard
                                    key={idx}
                                    icon={tech.icon}
                                    title={tech.title}
                                    description={tech.description}
                                    tags={tech.tags}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Meet the Team ── */}
                <section className="border-border border-t py-16">
                    <div className="mb-12 text-center">
                        <h2 className="text-text-primary mb-3 text-3xl font-semibold">
                            Our Engineers
                        </h2>
                        <p className="text-text-secondary text-sm">
                            The artisans behind every line of CodeArena.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {TEAM_MEMBERS.map((member, idx) => (
                            <div
                                key={idx}
                                className="group bg-bg-subtle border-border hover:border-accent/40 duration-normal rounded-lg border p-6 shadow-sm transition-all hover:shadow"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {/* next/image: dimensions prevent CLS; loading=lazy defers off-screen avatars */}
                                    <div className="border-border group-hover:border-accent relative mb-5 size-20 overflow-hidden rounded-full border-2 shadow-sm transition-colors">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            loading="lazy"
                                            className="duration-slow object-cover transition-transform group-hover:scale-110"
                                            sizes="80px"
                                        />
                                    </div>
                                    <h3 className="text-text-primary text-lg leading-tight font-bold">
                                        {member.name}
                                    </h3>
                                    <p className="text-accent mt-1 text-xs font-bold tracking-widest uppercase">
                                        {member.role}
                                    </p>

                                    <div className="border-border/50 mt-6 flex w-full items-center justify-center gap-4 border-t pt-4">
                                        <Link
                                            href={member.github}
                                            className="text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            <Github size={18} />
                                        </Link>
                                        <Link
                                            href={member.linkedin}
                                            className="text-text-muted hover:text-text-primary transition-colors"
                                        >
                                            <Linkedin size={18} />
                                        </Link>
                                        {member.blogSlug && (
                                            <Link
                                                href={`/blog/${member.blogSlug}`}
                                                className="text-accent hover:text-accent-hover flex items-center gap-1 text-xs font-bold transition-colors"
                                            >
                                                <span>Read Blog</span>
                                                <ExternalLink size={12} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
