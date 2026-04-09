'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    Zap,
    Shield,
    ArrowRight,
    Globe,
    Braces,
    ChevronRight,
    Lock,
    Clock,
    FileCode2,
    Bug,
    Sparkles,
    Users,
} from 'lucide-react'
import CodeBlock from '@/app/api-docs/components/CodeBlock'
import EndpointItem from '@/app/api-docs/components/EndpointItem'
import {
    API_CATEGORIES,
    QUICK_START_STEPS,
    RATE_LIMITS,
    ERROR_CODES,
    containerVariants,
    itemVariants,
} from '@/app/api-docs/data/apiData'

const AUTH_ICONS = {
    lock: <Lock className="text-accent mt-0.5 size-4 shrink-0" />,
    clock: <Clock className="text-accent mt-0.5 size-4 shrink-0" />,
    shield: <Shield className="text-accent mt-0.5 size-4 shrink-0" />,
}

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
                                        {AUTH_ICONS &&
                                            Object.entries(AUTH_ICONS).map(([key, icon], idx) => (
                                                <div key={idx} className="flex items-start gap-2.5">
                                                    {icon}
                                                    <span className="text-text-secondary text-sm">
                                                        {
                                                            [
                                                                'Bearer token authentication',
                                                                'Tokens expire after 7 days',
                                                                'All endpoints use HTTPS',
                                                            ][idx]
                                                        }
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
                            {API_CATEGORIES.map((category) => (
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
                            {ERROR_CODES.map((error, idx) => (
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
                                    href="/leaderboard"
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
