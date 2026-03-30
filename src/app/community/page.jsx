'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    MessageSquare,
    ThumbsUp,
    Eye,
    Clock,
    Search,
    TrendingUp,
    Flame,
    Star,
    Users,
    Award,
    ArrowRight,
    Hash,
    ChevronRight,
} from 'lucide-react'

// ─── Mock Discussion Data ────────────────────────────────────────────────
const DISCUSSIONS = [
    {
        id: 1,
        title: 'Tips for optimizing dynamic programming solutions?',
        author: 'AlgoMaster',
        avatar: 'AM',
        tag: 'Algorithms',
        tagColor: 'text-accent bg-accent/10 border-accent/20',
        replies: 24,
        views: 312,
        likes: 47,
        time: '2 hours ago',
        pinned: true,
    },
    {
        id: 2,
        title: 'How to approach graph problems in contests?',
        author: 'GraphWizard',
        avatar: 'GW',
        tag: 'Contests',
        tagColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        replies: 18,
        views: 256,
        likes: 35,
        time: '5 hours ago',
        pinned: false,
    },
    {
        id: 3,
        title: 'Best resources for learning competitive programming',
        author: 'CodeNewbie',
        avatar: 'CN',
        tag: 'Resources',
        tagColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        replies: 42,
        views: 891,
        likes: 128,
        time: '1 day ago',
        pinned: false,
    },
    {
        id: 4,
        title: 'Understanding time complexity — a visual guide',
        author: 'BigOExpert',
        avatar: 'BO',
        tag: 'Tutorials',
        tagColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        replies: 31,
        views: 567,
        likes: 89,
        time: '2 days ago',
        pinned: false,
    },
    {
        id: 5,
        title: 'What language do you prefer for competitive programming?',
        author: 'PolyglotDev',
        avatar: 'PD',
        tag: 'General',
        tagColor: 'text-text-muted bg-bg-muted border-border',
        replies: 56,
        views: 723,
        likes: 64,
        time: '3 days ago',
        pinned: false,
    },
    {
        id: 6,
        title: 'Docker sandbox security — how CodeArena protects your code',
        author: 'SecureCode',
        avatar: 'SC',
        tag: 'Platform',
        tagColor: 'text-accent bg-accent/10 border-accent/20',
        replies: 12,
        views: 198,
        likes: 41,
        time: '4 days ago',
        pinned: false,
    },
]

const POPULAR_TAGS = [
    { name: 'Algorithms', count: 234 },
    { name: 'Contests', count: 189 },
    { name: 'Data Structures', count: 156 },
    { name: 'Tutorials', count: 112 },
    { name: 'General', count: 98 },
    { name: 'Platform', count: 67 },
    { name: 'Resources', count: 54 },
]

const TOP_CONTRIBUTORS = [
    { name: 'AlgoMaster', posts: 142, rank: 1 },
    { name: 'GraphWizard', posts: 98, rank: 2 },
    { name: 'BigOExpert', posts: 87, rank: 3 },
    { name: 'CodeNewbie', posts: 76, rank: 4 },
    { name: 'PolyglotDev', posts: 65, rank: 5 },
]

const STATS = [
    { label: 'Members', value: '12,400+', icon: <Users className="size-5" /> },
    { label: 'Discussions', value: '3,200+', icon: <MessageSquare className="size-5" /> },
    { label: 'Solutions Shared', value: '8,500+', icon: <Star className="size-5" /> },
    { label: 'Active Today', value: '340+', icon: <TrendingUp className="size-5" /> },
]

const FILTER_TABS = ['Trending', 'Latest', 'Most Liked', 'Unanswered']

// ─── Page Component ──────────────────────────────────────────────────────
export default function CommunityPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeFilter, setActiveFilter] = useState('Trending')

    const filteredDiscussions = DISCUSSIONS.filter(
        (d) =>
            d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.author.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="text-text-primary bg-bg-page site-gradient flex min-h-screen flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-24 pb-20">
                {/* ── Hero ── */}
                <section className="relative mb-16 overflow-hidden py-16 text-center">
                    <div className="bg-accent/5 absolute inset-0 -z-10 blur-3xl" />
                    <div className="mx-auto max-w-4xl px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="font-display text-text-primary mb-6 text-4xl font-extrabold tracking-tight md:text-6xl">
                                CodeArena <span className="text-accent italic">Community</span>
                            </h1>
                            <p className="text-text-muted mx-auto mb-10 max-w-2xl text-lg md:text-xl">
                                Connect with fellow engineers, share solutions, discuss algorithms,
                                and learn from the best in competitive programming.
                            </p>

                            {/* Stats Row */}
                            <div className="mx-auto mb-10 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
                                {STATS.map((stat, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        className="glass-card rounded-2xl p-4 text-center"
                                    >
                                        <div className="text-accent mx-auto mb-2 flex justify-center">
                                            {stat.icon}
                                        </div>
                                        <div className="text-text-primary text-xl font-black">
                                            {stat.value}
                                        </div>
                                        <div className="text-text-muted text-xs font-medium">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Search */}
                            <div className="group relative mx-auto max-w-2xl">
                                <Search className="text-text-muted group-focus-within:text-accent absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search discussions, tags, or authors…"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-bg-subtle border-border focus:bg-bg-page focus:border-accent/20 focus:ring-accent/5 placeholder:text-text-muted w-full rounded-2xl border py-4 pr-6 pl-14 text-lg shadow-2xl transition-all focus:ring-8 focus:outline-none"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl px-4">
                    <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
                        {/* ── Main Column: Discussions ── */}
                        <div className="lg:col-span-2">
                            {/* Filter Tabs */}
                            <div className="mb-8 flex flex-wrap items-center gap-2">
                                {FILTER_TABS.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveFilter(tab)}
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                                            activeFilter === tab
                                                ? 'bg-accent shadow-accent/20 text-white shadow-lg'
                                                : 'bg-bg-subtle text-text-muted hover:text-text-primary hover:bg-bg-muted'
                                        }`}
                                    >
                                        {tab === 'Trending' && (
                                            <Flame className="-mt-0.5 mr-1.5 inline size-4" />
                                        )}
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Discussion List */}
                            <div className="space-y-4">
                                {filteredDiscussions.length > 0 ? (
                                    filteredDiscussions.map((discussion, idx) => (
                                        <motion.div
                                            key={discussion.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="glass-card group hover:border-accent/30 cursor-pointer rounded-2xl p-6 transition-all duration-300"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Avatar */}
                                                <div className="bg-accent/10 text-accent flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-black">
                                                    {discussion.avatar}
                                                </div>

                                                {/* Content */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                                        {discussion.pinned && (
                                                            <span className="bg-accent/10 text-accent border-accent/20 rounded-md border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                                                Pinned
                                                            </span>
                                                        )}
                                                        <span
                                                            className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${discussion.tagColor}`}
                                                        >
                                                            {discussion.tag}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-text-primary group-hover:text-accent mb-2 text-base font-bold transition-colors md:text-lg">
                                                        {discussion.title}
                                                    </h3>

                                                    <div className="text-text-muted flex flex-wrap items-center gap-4 text-xs">
                                                        <span className="font-medium">
                                                            {discussion.author}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            {discussion.time}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="size-3" />
                                                            {discussion.replies}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="size-3" />
                                                            {discussion.views}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ThumbsUp className="size-3" />
                                                            {discussion.likes}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Arrow */}
                                                <ChevronRight className="text-text-muted group-hover:text-accent hidden shrink-0 transition-colors md:block" />
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="bg-bg-subtle mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl border border-white/5 shadow-inner">
                                            <MessageSquare className="text-text-muted h-10 w-10" />
                                        </div>
                                        <h3 className="text-text-primary text-xl font-bold">
                                            No discussions found
                                        </h3>
                                        <p className="text-text-muted mt-2">
                                            Try a different search term.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Sidebar ── */}
                        <aside className="space-y-8">
                            {/* Popular Tags */}
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-text-primary mb-5 flex items-center gap-2 font-bold">
                                    <Hash className="text-accent size-5" />
                                    Popular Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {POPULAR_TAGS.map((tag) => (
                                        <span
                                            key={tag.name}
                                            className="bg-bg-subtle hover:bg-bg-muted text-text-secondary hover:text-text-primary cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                                        >
                                            {tag.name}{' '}
                                            <span className="text-text-muted ml-0.5">
                                                ({tag.count})
                                            </span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Top Contributors */}
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-text-primary mb-5 flex items-center gap-2 font-bold">
                                    <Award className="text-accent size-5" />
                                    Top Contributors
                                </h3>
                                <ul className="space-y-3">
                                    {TOP_CONTRIBUTORS.map((user) => (
                                        <li
                                            key={user.name}
                                            className="hover:bg-bg-subtle flex items-center gap-3 rounded-xl px-2 py-2 transition-colors"
                                        >
                                            <div
                                                className={`flex size-8 items-center justify-center rounded-lg text-xs font-black ${
                                                    user.rank === 1
                                                        ? 'bg-amber-500/10 text-amber-500'
                                                        : user.rank === 2
                                                          ? 'bg-gray-400/10 text-gray-400'
                                                          : user.rank === 3
                                                            ? 'bg-orange-600/10 text-orange-600'
                                                            : 'bg-bg-muted text-text-muted'
                                                }`}
                                            >
                                                #{user.rank}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-text-primary text-sm font-semibold">
                                                    {user.name}
                                                </div>
                                                <div className="text-text-muted text-[11px]">
                                                    {user.posts} posts
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Community Guidelines CTA */}
                            <div className="glass-card group hover:border-accent/30 rounded-2xl p-6 transition-all">
                                <h3 className="text-text-primary mb-3 font-bold">
                                    Community Guidelines
                                </h3>
                                <p className="text-text-muted mb-4 text-sm leading-relaxed">
                                    Please be respectful, stay on topic, and share knowledge
                                    constructively. Read our full guidelines before posting.
                                </p>
                                <span className="text-accent group-hover:text-accent-hover inline-flex items-center gap-1 text-sm font-semibold transition-colors">
                                    Read Guidelines
                                    <ArrowRight className="size-4" />
                                </span>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
