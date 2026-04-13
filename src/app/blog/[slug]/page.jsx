'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import {
    Calendar,
    Clock,
    ArrowLeft,
    Share2,
    ThumbsUp,
    ChevronRight,
    Github,
    Twitter,
    Linkedin,
    ExternalLink,
} from 'lucide-react'

// ─── Blog Content ────────────────────────────────────────────────────────
const BLOG_CONTENT = {
    'scaling-codearena-docker-judge': {
        title: 'Scaling CodeArena: Behind the Scenes of our Docker-Based Judge',
        author: 'Rabiul Islam',
        role: 'Lead / Engine',
        date: 'Oct 12, 2025',
        readTime: '8 min read',
        category: 'Engineering',
        image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&q=80&w=1200',
        content: `
            <p>At CodeArena, we pride ourselves on a sub-millisecond judging engine. But a fast judge is useless if it isn't secure. When we first designed the platform, the primary challenge was executing untrusted code from thousands of users simultaneously without compromising our host infrastructure.</p>
            
            <h3 class="text-xl font-semibold text-text-primary mt-8 mb-4">The Sandbox Architecture</h3>
            <p>We settled on <strong>Docker</strong> as our primary isolation layer. Every submission spawns a lightweight, ephemeral container with strictly limited resources:</p>
            <ul class="list-disc pl-5 space-y-2 mt-4 mb-6 text-text-secondary">
                <li><strong>CPU Pinning:</strong> Each container is limited to a fraction of a core to prevent CPU exhaustion attacks.</li>
                <li><strong>Memory Limits:</strong> We enforce strict 256MB/512MB limits depending on the problem difficulty.</li>
                <li><strong>No Network:</strong> Containers are completely isolated from the internet and local network.</li>
            </ul>

            <h3 class="text-xl font-semibold text-text-primary mt-8 mb-4">Handling Concurrency with Redis</h3>
            <p>To handle thousands of submissions during live contests, we use a <strong>Redis-backed queue</strong> system. When you hit "Submit", your code is serialized and pushed to a Priority Queue. Our worker nodes (scaling horizontally on demand) pull these tasks, run them through the Docker sandbox, and push the results back to the frontend in real-time.</p>

            <blockquote class="border-l-4 border-accent bg-bg-subtle p-6 rounded-r-lg italic my-8 text-text-secondary">
                "The goal was never just to run code; it was to build a bulletproof environment where performance and security live in harmony."
            </blockquote>

            <h3 class="text-xl font-semibold text-text-primary mt-8 mb-4">The Future: WebAssembly?</h3>
            <p>While Docker serves us well today, we are actively exploring <strong>Wasm (WebAssembly)</strong> for even lighter isolation. Preliminary tests show a 40% reduction in cold-start times for judging tasks.</p>
        `,
    },
    'ai-coaching-alex-predicts-career': {
        title: "AI Coaching: How 'Alex' Predicts Your Competitive Career Path",
        author: 'Arafat Salehin',
        role: 'Engine / Backend',
        date: 'Oct 08, 2025',
        readTime: '6 min read',
        category: 'AI Insights',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
        content: `
            <p>Competitive programming isn't just about solving puzzles; it's a window into how an engineer thinks. At CodeArena, we've moved beyond simple leaderboards with <strong>Alex</strong>, our virtual AI coach.</p>
            
            <h3 class="text-xl font-semibold text-text-primary mt-8 mb-4">Beyond Code Correction</h3>
            <p>Unlike standard AI assistants that just point out syntax errors, Alex looks at your <strong>behavioral patterns</strong> over hundreds of submissions. It asks:</p>
            <ul class="list-disc pl-5 space-y-2 mt-4 mb-6 text-text-secondary">
                <li>Are you faster at Dynamic Programming or Graph Theory?</li>
                <li>Do you optimize for memory or time?</li>
                <li>How do you handle edge cases after a "Wrong Answer" verdict?</li>
            </ul>

            <h3 class="text-xl font-semibold text-text-primary mt-8 mb-4">Predictive Career Modeling</h3>
            <p>Alex uses these insights to build a "Competency Map". If you show high efficiency in low-level C++ optimizations but struggle with abstract system design, Alex might suggest focusing your interview prep on <strong>Systems Engineering</strong> or <strong>HFT roles</strong>.</p>

            <p>We've partnered with top tech firms to align Alex's coaching with real-world hiring needs, ensuring that your time in the Arena translates directly to career growth.</p>
        `,
    },
    'road-to-2500-problems-curation': {
        title: 'The Road to 2500+ Problems: Curating the Ultimate Challenge List',
        author: 'AH Muzahid',
        role: 'Core Systems',
        date: 'Sep 28, 2025',
        readTime: '5 min read',
        category: 'Contest',
        image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=1200',
        content: `
            <p>Quantity is a tempting metric, but it's the enemy of quality. When we hit the 2,500-problem milestone on CodeArena, we didn't celebrate the number—we celebrated the curation.</p>
            
            <h3 class="text-xl font-semibold text-text-primary mt-8 mb-4">The 3-Tier Peer Review</h3>
            <p>Every problem goes through three layers of checking before entering the Arena:</p>
            <ol class="list-decimal pl-5 space-y-2 mt-4 mb-6 text-text-secondary">
                <li><strong>Logic Validation:</strong> Is the problem solvable within the platform's time limits?</li>
                <li><strong>Pedagogical Accuracy:</strong> Does it teach a core algorithmic concept, or is it just "trick" math?</li>
                <li><strong>Edge-Case Resilience:</strong> Our custom testcase generator creates hundreds of inputs to ensure no "lazy" solutions pass.</li>
            </ol>

            <p>Our goal is to ensure that when you solve a "Hard" problem on CodeArena, you haven't just memorized a pattern—you've mastered a concept that will stick with you for your entire career.</p>
        `,
    },
    'ux-design-for-developers': {
        title: 'UX Design for Developers: Why Aesthetics Matter in Code Platforms',
        author: 'Shahnawas Adeel',
        role: 'UI / UX Master',
        date: 'Sep 15, 2025',
        readTime: '7 min read',
        category: 'Design',
        image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1200',
        content: `
            <p>For a long time, platforms designed for engineers have prioritized function over form. The prevailing mindset was: "If the code runs fast and the system is stable, the UI doesn't matter." At CodeArena, we fundamentally disagree.</p>
            
            <p>We believe that <strong>complexity shouldn't mean clutter</strong>. The cognitive load required to solve hard algorithmic problems is already high; the tool you use shouldn't add to it.</p>

            <h3 class="text-xl font-semibold text-text-primary mt-8 mb-4">The "Terminal" Aesthetic</h3>
            <p>Our design philosophy draws inspiration from what developers use every day: their IDEs and terminals. We established a strict <strong>Design Token System</strong> that enforces:</p>
            <ul class="list-disc pl-5 space-y-2 mt-4 mb-6 text-text-secondary">
                <li><strong>Monochrome Foundation:</strong> A spectrum of grays creates a neutral canvas. Colors are used exclusively for semantics (e.g., success, error, warnings).</li>
                <li><strong>The Single Accent:</strong> We use "HackerRank Green" (<code>--color-accent</code>) as our solitary brand and action color. This makes every call-to-action instantly recognizable.</li>
                <li><strong>Information Density:</strong> We optimize for a high density of information without feeling cramped, leveraging a strict 4px grid scale.</li>
            </ul>

            <h3 class="text-xl font-semibold text-text-primary mt-8 mb-4">Focus and Flow</h3>
            <p>When you're in the middle of a contest, every millisecond counts. Every pixel on the CodeArena "Problem Solve" view is optimized for <strong>Flow State</strong>.</p>
            
            <blockquote class="border-l-4 border-accent bg-bg-subtle p-6 rounded-r-lg italic my-8 text-text-secondary">
                "Good design is invisible. Great design for developers feels like an extension of their own thought process."
            </blockquote>

            <p>We removed all flashy neon gradients, dropping decorative blur elements to instead focus on crisp typography, high-contrast borders, and clear spatial hierarchy. The result is a platform that feels fast, predictable, and undeniably premium.</p>

            <h3 class="text-xl font-semibold text-text-primary mt-8 mb-4">Accessibility as a Default</h3>
            <p>An often-overlooked aspect of "developer UI" is accessibility. Our monochrome base isn't just an aesthetic choice; it ensures optimal contrast ratios. Whether you're coding at 3 PM or 3 AM, the interface remains legible and comfortable.</p>
        `,
    },
}

export default function BlogDetailPage() {
    const { slug } = useParams()
    const router = useRouter()
    const post = BLOG_CONTENT[slug]

    if (!post) {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col items-center justify-center p-4 text-center">
                <h1 className="text-text-primary text-4xl font-bold">Post not found</h1>
                <Link href="/blog" className="text-accent mt-6 font-semibold hover:underline">
                    Return to Arena Journal
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-bg-page text-text-primary min-h-screen font-sans">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 pt-1 pb-24 md:px-6">
                {/* ── Header ── */}
                <div className="py-8">
                    <button
                        onClick={() => router.back()}
                        className="text-text-muted hover:text-accent mb-8 flex items-center gap-2 text-sm font-semibold transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Journal
                    </button>

                    <div className="text-accent mb-4 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                        <span>{post.category}</span>
                    </div>
                    <h1 className="text-text-primary mb-8 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl">
                        {post.title}
                    </h1>

                    <div className="border-border flex flex-wrap items-center gap-6 border-y py-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-bg-muted text-text-primary flex size-10 items-center justify-center rounded-full font-bold">
                                {post.author[0]}
                            </div>
                            <div>
                                <div className="text-text-primary text-sm font-bold tracking-wider uppercase">
                                    {post.author}
                                </div>
                                <div className="text-text-secondary text-xs">{post.role}</div>
                            </div>
                        </div>
                        <div className="text-text-secondary flex items-center gap-6 text-sm">
                            <span className="flex items-center gap-2">
                                <Calendar size={14} className="text-accent" /> {post.date}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={14} className="text-accent" /> {post.readTime}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hero image — explicit dimensions prevent CLS; priority triggers preload for LCP */}
                <div className="border-border relative mt-8 aspect-[5/2] overflow-hidden rounded-lg border shadow-sm">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 896px, 896px"
                    />
                </div>

                {/* ── Content ── */}
                <article className="text-text-secondary mt-12 space-y-6 text-lg leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </article>

                {/* ── Footer / Share ── */}
                <div className="border-border mt-20 flex flex-wrap items-center justify-between gap-8 border-t pt-8">
                    <div className="flex items-center gap-6">
                        <button className="text-text-muted hover:text-accent flex items-center gap-2 text-sm font-semibold transition-colors">
                            <ThumbsUp size={18} /> Helpful?
                        </button>
                        <button className="text-text-muted hover:text-accent flex items-center gap-2 text-sm font-semibold transition-colors">
                            <Share2 size={18} /> Share
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Twitter className="text-text-muted hover:text-accent size-5 cursor-pointer transition-colors" />
                        <Linkedin className="text-text-muted hover:text-accent size-5 cursor-pointer transition-colors" />
                        <Github className="text-text-muted hover:text-accent size-5 cursor-pointer transition-colors" />
                        <ExternalLink className="text-text-muted hover:text-accent size-5 cursor-pointer transition-colors" />
                    </div>
                </div>

                {/* ── Up Next ── */}
                <div className="bg-bg-subtle border-border group hover:border-accent/40 mt-20 rounded-lg border p-8 transition-colors">
                    <div className="text-accent mb-3 text-xs font-bold tracking-widest uppercase">
                        Up Next
                    </div>
                    <h4 className="text-text-primary group-hover:text-accent mb-6 text-xl font-bold transition-colors">
                        AI Coaching: How 'Alex' Predicts Your Competitive Career Path
                    </h4>
                    <Link
                        href="/blog/ai-coaching-alex-predicts-career"
                        className="text-text-primary group-hover:text-accent inline-flex items-center gap-2 text-sm font-bold transition-colors"
                    >
                        Read Article{' '}
                        <ChevronRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </Link>
                </div>
            </main>

            <Footer />
        </div>
    )
}
