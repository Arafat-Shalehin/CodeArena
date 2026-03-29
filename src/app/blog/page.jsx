'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    Search,
    Clock,
    ArrowRight,
    BookOpen,
    Flame,
    Tag,
    Eye,
    Heart,
    User,
    Calendar,
    ChevronRight,
} from 'lucide-react'

// ─── Blog Posts ──────────────────────────────────────────────────────────
const BLOG_POSTS = [
    {
        id: 1,
        title: 'How We Built a Sub-Millisecond Code Judge with Docker',
        excerpt:
            "A deep dive into the architecture behind CodeArena's isolated execution engine — from dockerode container spawning to real-time verdict streaming.",
        author: 'Arafat Salehin',
        date: 'Mar 25, 2026',
        readTime: '8 min read',
        tag: 'Engineering',
        tagColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        views: 2340,
        likes: 187,
        featured: true,
    },
    {
        id: 2,
        title: 'Introducing AI Coach Alex — Your Personal Interview Prep Partner',
        excerpt:
            'Meet Alex, our AI-powered coaching system that adapts to your skill level and guides you through mock technical interviews with real-time feedback.',
        author: 'Rabiul Islam',
        date: 'Mar 20, 2026',
        readTime: '6 min read',
        tag: 'Product',
        tagColor: 'text-accent bg-accent/10 border-accent/20',
        views: 3120,
        likes: 245,
        featured: true,
    },
    {
        id: 3,
        title: '5 Dynamic Programming Patterns Every Competitive Programmer Must Know',
        excerpt:
            'From sliding window to bitmask DP — master the five most frequently tested patterns across Codeforces, LeetCode, and CodeArena contests.',
        author: 'AH Muzahid',
        date: 'Mar 15, 2026',
        readTime: '12 min read',
        tag: 'Tutorials',
        tagColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        views: 5670,
        likes: 412,
        featured: false,
    },
    {
        id: 4,
        title: 'Designing a Premium Dark Mode with CSS Custom Properties',
        excerpt:
            'How we implemented a flicker-free, system-aware dark mode in CodeArena using CSS variables, Tailwind v4, and next-themes.',
        author: 'Shahnawas Adeel',
        date: 'Mar 10, 2026',
        readTime: '7 min read',
        tag: 'Design',
        tagColor: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
        views: 1890,
        likes: 156,
        featured: false,
    },
    {
        id: 5,
        title: 'Real-Time Leaderboards at Scale with Socket.io and Redis',
        excerpt:
            'Building leaderboards that update live for thousands of concurrent users during contests — our journey from polling to WebSockets.',
        author: 'Arafat Salehin',
        date: 'Mar 5, 2026',
        readTime: '10 min read',
        tag: 'Engineering',
        tagColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        views: 2780,
        likes: 198,
        featured: false,
    },
    {
        id: 6,
        title: 'Graph Theory Cheat Sheet for Contest Day',
        excerpt:
            'BFS, DFS, Dijkstra, Bellman-Ford, Kruskal, Prim — a concise reference with complexity tables and common pitfalls to avoid under time pressure.',
        author: 'AH Muzahid',
        date: 'Feb 28, 2026',
        readTime: '9 min read',
        tag: 'Tutorials',
        tagColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        views: 4230,
        likes: 327,
        featured: false,
    },
    {
        id: 7,
        title: "From Zero to First Contest — A Beginner's Roadmap",
        excerpt:
            'A step-by-step guide for newcomers: setting up your environment, choosing a language, practicing smart, and competing in your first CodeArena contest.',
        author: 'Ummey Salma Tamanna',
        date: 'Feb 20, 2026',
        readTime: '5 min read',
        tag: 'Getting Started',
        tagColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
        views: 6100,
        likes: 489,
        featured: false,
    },
    {
        id: 8,
        title: 'Framer Motion Tricks for Silky-Smooth Page Transitions',
        excerpt:
            'Practical animation patterns we use across CodeArena — stagger reveals, layout animations, and performant scroll-triggered effects.',
        author: 'Abdullah Noman',
        date: 'Feb 14, 2026',
        readTime: '6 min read',
        tag: 'Design',
        tagColor: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
        views: 1560,
        likes: 134,
        featured: false,
    },
]

const TAGS = ['All', 'Engineering', 'Product', 'Tutorials', 'Design', 'Getting Started']

// ─── Animation Variants ──────────────────────────────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
}

// ─── Page Component ──────────────────────────────────────────────────────
export default function BlogPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTag, setActiveTag] = useState('All')

    const filtered = BLOG_POSTS.filter((post) => {
        const matchesSearch =
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.author.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesTag = activeTag === 'All' || post.tag === activeTag
        return matchesSearch && matchesTag
    })

    const featuredPosts = BLOG_POSTS.filter((p) => p.featured)
    const showFeatured = activeTag === 'All' && searchTerm === ''

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
                        className="mb-10 text-center"
                    >
                        <h1 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
                            CodeArena <span className="text-accent italic">Blog</span>
                        </h1>
                        <p className="text-text-muted mx-auto max-w-2xl text-lg md:text-xl">
                            Engineering deep-dives, competitive programming tutorials, and product
                            updates from the CodeArena team.
                        </p>
                    </motion.div>

                    {/* ── Search ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto mb-12 max-w-2xl"
                    >
                        <div className="group relative">
                            <Search className="text-text-muted group-focus-within:text-accent absolute top-1/2 left-5 size-5 -translate-y-1/2 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search articles, topics, or authors…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-bg-subtle border-border focus:bg-bg-page focus:border-accent/20 focus:ring-accent/5 placeholder:text-text-muted w-full rounded-2xl border py-4 pr-6 pl-14 text-lg shadow-xl transition-all focus:ring-8 focus:outline-none"
                            />
                        </div>
                    </motion.div>

                    {/* ── Tag Filters ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-12 flex flex-wrap justify-center gap-2"
                    >
                        {TAGS.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                                    activeTag === tag
                                        ? 'bg-accent shadow-accent/20 text-white shadow-lg'
                                        : 'bg-bg-subtle text-text-muted hover:bg-bg-muted hover:text-text-primary'
                                }`}
                            >
                                {tag === 'All' && (
                                    <Flame className="-mt-0.5 mr-1.5 inline size-4" />
                                )}
                                {tag}
                            </button>
                        ))}
                    </motion.div>

                    {/* ── Featured Posts ── */}
                    {showFeatured && (
                        <section className="mb-16">
                            <h2 className="text-text-primary mb-6 flex items-center gap-2 text-lg font-bold">
                                <Flame className="text-accent size-5" /> Featured
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {featuredPosts.map((post, idx) => (
                                    <motion.article
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + idx * 0.15 }}
                                        whileHover={{
                                            y: -6,
                                            transition: { duration: 0.25 },
                                        }}
                                        className="glass-card group hover:border-accent/40 hover:shadow-accent/5 relative cursor-pointer overflow-hidden rounded-2xl border border-transparent p-8 transition-all duration-300 hover:shadow-2xl"
                                    >
                                        {/* Shimmer */}
                                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                                        <div className="relative">
                                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${post.tagColor}`}
                                                >
                                                    {post.tag}
                                                </span>
                                                <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-500 uppercase">
                                                    Featured
                                                </span>
                                            </div>

                                            <h3 className="text-text-primary group-hover:text-accent mb-3 text-xl font-bold transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-text-muted mb-5 line-clamp-2 text-sm leading-relaxed">
                                                {post.excerpt}
                                            </p>

                                            <div className="text-text-muted flex flex-wrap items-center gap-4 text-xs">
                                                <span className="flex items-center gap-1 font-medium">
                                                    <User className="size-3" />
                                                    {post.author}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {post.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {post.readTime}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── All Posts ── */}
                    <section>
                        {!showFeatured && (
                            <h2 className="text-text-primary mb-6 text-lg font-bold">
                                {activeTag === 'All' ? 'Search Results' : activeTag}
                                <span className="text-text-muted ml-2 text-sm font-normal">
                                    ({filtered.length} article{filtered.length !== 1 ? 's' : ''})
                                </span>
                            </h2>
                        )}
                        {showFeatured && (
                            <h2 className="text-text-primary mb-6 flex items-center gap-2 text-lg font-bold">
                                <BookOpen className="text-accent size-5" /> All Articles
                            </h2>
                        )}

                        {filtered.length > 0 ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="space-y-4"
                            >
                                {filtered.map((post) => (
                                    <motion.article
                                        key={post.id}
                                        variants={cardVariants}
                                        whileHover={{
                                            x: 4,
                                            transition: { duration: 0.2 },
                                        }}
                                        className="glass-card group hover:border-accent/30 cursor-pointer rounded-2xl border border-transparent p-6 transition-all duration-300 hover:shadow-lg"
                                    >
                                        <div className="flex items-start gap-5">
                                            {/* Date block */}
                                            <div className="bg-bg-subtle hidden size-16 shrink-0 flex-col items-center justify-center rounded-xl border border-white/5 text-center md:flex">
                                                <span className="text-accent text-lg leading-none font-black">
                                                    {post.date.split(' ')[1]?.replace(',', '')}
                                                </span>
                                                <span className="text-text-muted text-[10px] font-semibold uppercase">
                                                    {post.date.split(' ')[0]}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${post.tagColor}`}
                                                    >
                                                        {post.tag}
                                                    </span>
                                                    <span className="text-text-muted flex items-center gap-1 text-xs">
                                                        <Clock className="size-3" />
                                                        {post.readTime}
                                                    </span>
                                                </div>

                                                <h3 className="text-text-primary group-hover:text-accent mb-2 text-base font-bold transition-colors md:text-lg">
                                                    {post.title}
                                                </h3>
                                                <p className="text-text-muted mb-3 line-clamp-1 text-sm">
                                                    {post.excerpt}
                                                </p>

                                                <div className="text-text-muted flex flex-wrap items-center gap-4 text-xs">
                                                    <span className="font-medium">
                                                        {post.author}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="size-3" />
                                                        {post.views.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="size-3" />
                                                        {post.likes}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <ChevronRight className="text-text-muted group-hover:text-accent mt-2 hidden shrink-0 transition-colors md:block" />
                                        </div>
                                    </motion.article>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="py-20 text-center">
                                <div className="bg-bg-subtle mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl border border-white/5 shadow-inner">
                                    <BookOpen className="text-text-muted size-9" />
                                </div>
                                <h3 className="text-text-primary text-xl font-bold">
                                    No articles found
                                </h3>
                                <p className="text-text-muted mt-2 text-sm">
                                    Try adjusting your search or filter.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
