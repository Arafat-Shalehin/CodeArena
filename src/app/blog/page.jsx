'use client'

import React from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BlogCard from '@/components/features/BlogCard'
import { Search, Cpu, Sparkles, TrendingUp, Zap, Tag } from 'lucide-react'

// ─── Blog Data ───────────────────────────────────────────────────────────
const BLOG_POSTS = [
    {
        id: 4,
        slug: 'ux-design-for-developers',
        title: 'UX Design for Developers: Why Aesthetics Matter in Code Platforms',
        excerpt:
            'Exploring the "CodeArena" design philosophy: making complex engineering tools feel premium, fast, and accessible.',
        date: 'Sep 15, 2025',
        readTime: '7 min read',
        category: 'Design',
        author: 'Shahnawas Adeel',
        image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200',
        icon: <Zap size={14} />,
        featured: true,
    },
    {
        id: 1,
        slug: 'scaling-codearena-docker-judge',
        title: 'Scaling CodeArena: Behind the Scenes of our Docker-Based Judge',
        excerpt:
            'How we built a sub-millisecond judging engine that handles thousands of concurrent submissions in isolated, secure environments.',
        date: 'Oct 12, 2025',
        readTime: '8 min read',
        category: 'Engineering',
        author: 'Rabiul Islam',
        image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=800',
        icon: <Cpu size={14} />,
    },
    {
        id: 2,
        slug: 'ai-coaching-alex-predicts-career',
        title: "AI Coaching: How 'Alex' Predicts Your Competitive Career Path",
        excerpt:
            'Discover the machine learning models behind Alex, our virtual coach that analyzes your coding patterns to suggest your ideal role.',
        date: 'Oct 08, 2025',
        readTime: '6 min read',
        category: 'AI Insights',
        author: 'Arafat Salehin',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
        icon: <Sparkles size={14} />,
    },
    {
        id: 3,
        slug: 'road-to-2500-problems-curation',
        title: 'The Road to 2500+ Problems: Curating the Ultimate Challenge List',
        excerpt:
            'Quality over quantity. Learn about our rigorous curation process for ensuring every problem on CodeArena is unique and balanced.',
        date: 'Sep 28, 2025',
        readTime: '5 min read',
        category: 'Contest',
        author: 'AH Muzahid',
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=800',
        icon: <TrendingUp size={14} />,
    },
]

const CATEGORIES = ['All', 'Engineering', 'AI Insights', 'Contest', 'Design']

export default function BlogListingPage() {
    const [activeCategory, setActiveCategory] = React.useState('All')
    const [searchQuery, setSearchQuery] = React.useState('')

    const featuredPost = BLOG_POSTS.find((p) => p.featured)
    const filteredPosts = BLOG_POSTS.filter((p) => {
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory
        const matchesSearch =
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const otherPosts = filteredPosts.filter(
        (p) => !p.featured || activeCategory !== 'All' || searchQuery !== ''
    )

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            <Navbar />

            <main className="max-w-container mx-auto px-4 pt-16 pb-24 md:px-6">
                {/* ── Header ── */}
                <header className="border-border mb-12 border-b text-center">
                    <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                        <h1 className="text-text-primary mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                            The <span className="text-accent italic">Arena</span> Journal
                        </h1>
                        <p className="text-text-secondary text-sm font-medium tracking-widest uppercase">
                            Insights. Engineering. Future.
                        </p>
                    </div>
                </header>

                {/* ── Featured Post ── */}
                {activeCategory === 'All' && searchQuery === '' && featuredPost && (
                    <div className="mb-20">
                        <BlogCard post={featuredPost} featured={true} />
                    </div>
                )}

                {/* ── Filters & Search ── */}
                <div className="border-border mb-12 flex flex-col items-center justify-between gap-6 border-b py-6 md:flex-row">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`duration-normal rounded-md border px-4 py-1.5 text-sm font-semibold transition-all ${
                                    activeCategory === cat
                                        ? 'bg-accent border-accent text-white'
                                        : 'bg-bg-subtle text-text-secondary border-border hover:bg-bg-muted hover:text-text-primary'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full max-w-sm">
                        <Search className="text-text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-bg-subtle border-border text-text-primary placeholder:text-text-muted focus:ring-accent w-full rounded-md border py-2 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:outline-none"
                        />
                    </div>
                </div>

                {/* ── Articles Grid ── */}
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {/* If we're searching or filtering, we show everything in the grid */}
                        {activeCategory !== 'All' || searchQuery !== ''
                            ? filteredPosts.map((post) => <BlogCard key={post.id} post={post} />)
                            : otherPosts.map((post) => <BlogCard key={post.id} post={post} />)}
                    </div>
                ) : (
                    <div className="py-24 text-center">
                        <div className="bg-bg-subtle mb-4 inline-flex size-16 items-center justify-center rounded-full">
                            <Tag className="text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-text-primary text-xl font-semibold">
                            No articles found
                        </h3>
                        <p className="text-text-secondary mt-1">
                            Try adjusting your filters or search terms.
                        </p>
                    </div>
                )}

                {/* ── Newsletter CTA ── */}
                <section className="bg-bg-subtle border-border mt-32 rounded-lg border p-10 text-center shadow-sm">
                    <h2 className="text-text-primary mb-2 text-2xl font-bold">
                        Stay Ahead of the Curve
                    </h2>
                    <p className="text-text-secondary mx-auto mb-8 max-w-lg text-sm">
                        Receive CodeArena's latest engineering insights and contest alerts directly
                        in your inbox. No spam, only excellence.
                    </p>
                    <div className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row">
                        <input
                            type="email"
                            placeholder="engineer@example.com"
                            className="bg-bg-page border-border focus:ring-accent flex-grow rounded-md border px-4 py-2.5 text-sm transition-all outline-none focus:ring-2"
                        />
                        <button className="bg-accent hover:bg-accent-hover duration-normal rounded-md px-8 py-2.5 text-sm font-semibold text-white transition-colors">
                            Subscribe
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
