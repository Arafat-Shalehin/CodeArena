'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * BlogCard Component
 * A consistent card for blog posts following the CodeArena Design Token System.
 * Supports two modes: featured (editorial hero) and standard (grid card).
 */
export default function BlogCard({ post, featured = false, className }) {
    if (featured) {
        return (
            <article
                className={cn(
                    'group border-border bg-bg-subtle hover:border-accent/40 animate-in fade-in slide-in-from-bottom-6 relative overflow-hidden rounded-xl border shadow-sm transition-all duration-300 duration-700 hover:shadow-md',
                    className
                )}
            >
                <Link href={`/blog/${post.slug}`} className="flex h-full flex-col lg:flex-row">
                    {/* ── Image Panel ── */}
                    <div className="bg-bg-muted border-border/60 relative min-h-[280px] w-full flex-shrink-0 overflow-hidden border-b sm:min-h-[320px] lg:min-h-[460px] lg:w-1/2 lg:border-r lg:border-b-0">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover transition-transform duration-[800ms] group-hover:scale-110"
                        />
                        {/* Gradient overlay */}
                        <div className="from-bg-subtle/80 lg:to-bg-subtle/30 absolute inset-0 bg-gradient-to-t via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent" />

                        {/* Featured badge */}
                        <div className="bg-accent absolute top-5 left-5 flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-[0.15em] text-white uppercase shadow-md">
                            <BookOpen size={12} />
                            <span>Featured</span>
                        </div>
                    </div>

                    {/* ── Content Panel ── */}
                    <div className="relative flex w-full flex-col justify-between overflow-hidden p-7 sm:p-9 lg:w-1/2 lg:p-12">
                        {/* Ambient background glow */}
                        <div className="bg-accent/5 group-hover:bg-accent/10 pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full blur-[80px] transition-colors duration-[1000ms]"></div>

                        {/* Top Section */}
                        <div className="relative z-10 flex flex-grow flex-col justify-center">
                            <div className="text-accent mb-5 flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
                                {post.icon}
                                <span>{post.category}</span>
                            </div>

                            <h2 className="text-text-primary group-hover:text-accent mb-6 text-3xl leading-[1.1] font-bold transition-colors duration-300 sm:text-4xl lg:text-[2.75rem]">
                                {post.title}
                            </h2>

                            <p className="text-text-secondary mb-8 line-clamp-3 text-lg leading-relaxed">
                                {post.excerpt}
                            </p>

                            {/* Editorial pull-line (Optional) */}
                            <div className="border-accent/60 mb-8 hidden border-l-2 py-2 pl-5 sm:block">
                                <p className="text-text-muted from-accent/5 rounded-r-md bg-gradient-to-r to-transparent p-3 text-sm font-medium italic">
                                    "{post.pullQuote || post.excerpt.split('.')[0]}."
                                </p>
                            </div>
                        </div>

                        {/* Bottom Meta Row */}
                        <div className="border-border/70 relative z-10 mt-auto flex flex-wrap items-center justify-between gap-4 border-t pt-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-bg-muted border-border group-hover:border-accent/40 size-11 flex-shrink-0 overflow-hidden rounded-full border-[1.5px] shadow-sm transition-colors duration-300">
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={
                                                post.authorImage ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=1a1a1a&color=00b86b&bold=true`
                                            }
                                            alt={post.author}
                                            fill
                                            loading="lazy"
                                            sizes="44px"
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-text-primary text-xs font-bold tracking-wide uppercase">
                                        {post.author}
                                    </div>
                                    <div className="text-text-muted mt-1 flex items-center gap-3 text-[11px] font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={11} className="text-accent/70" />{' '}
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={11} className="text-accent/70" />{' '}
                                            {post.readTime}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-accent/10 text-accent group-hover:bg-accent flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 group-hover:text-white">
                                <span>Read Insight</span>
                                <ArrowRight
                                    size={16}
                                    className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                            </div>
                        </div>
                    </div>
                </Link>
            </article>
        )
    }

    // ── Standard Grid Card ──
    return (
        <article
            className={cn(
                'group bg-bg-subtle border-border hover:border-accent/30 animate-in fade-in slide-in-from-bottom-2 flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-300 duration-500 hover:shadow-md',
                className
            )}
        >
            <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
                {/* Thumbnail */}
                <div className="bg-bg-muted relative aspect-[16/9] overflow-hidden">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="bg-bg-page/0 group-hover:bg-bg-page/10 absolute inset-0 transition-colors duration-300" />
                    <div className="absolute top-3 left-3">
                        <span className="bg-bg-page/80 border-border/60 text-text-primary rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
                            {post.category}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-grow flex-col p-5">
                    <div className="text-text-muted mb-3 flex items-center gap-3 text-[10px] font-medium">
                        <span className="flex items-center gap-1">
                            <Calendar size={11} /> {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={11} /> {post.readTime}
                        </span>
                    </div>
                    <h3 className="text-text-primary group-hover:text-accent mb-2.5 text-base leading-snug font-bold transition-colors">
                        {post.title}
                    </h3>
                    <p className="text-text-secondary mb-5 line-clamp-2 text-sm leading-relaxed">
                        {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="border-border mt-auto flex items-center justify-between border-t pt-4">
                        <span className="text-text-muted text-[10px] font-bold tracking-wide uppercase">
                            {post.author}
                        </span>
                        <ArrowRight
                            size={14}
                            className="text-accent -translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                    </div>
                </div>
            </Link>
        </article>
    )
}
