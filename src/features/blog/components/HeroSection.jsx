import React from 'react'
import { ArrowRight } from 'lucide-react'

/**
 * HeroSection Component
 * Main featured section with high visual impact.
 * Uses design tokens for backgrounds, text, and overlays.
 */
const HeroSection = ({ post }) => {
    return (
        <section className="relative flex min-h-[600px] items-center justify-start overflow-hidden px-6 py-24 md:min-h-[716px] md:px-20 lg:px-32">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={post.img}
                    alt="Hero Background"
                    className="h-full w-full object-cover opacity-40 grayscale-[20%]"
                />
                {/* Vercel-style gradient overlay using background token */}
                <div className="from-bg-page via-bg-page/80 absolute inset-0 bg-gradient-to-r to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl">
                <div className="mb-6 flex items-center gap-3">
                    <span className="border-accent/20 bg-accent-light text-accent-text rounded-full border px-3 py-1 font-mono text-[10px] tracking-widest uppercase md:text-xs">
                        {post.tag}
                    </span>
                    <span className="text-text-muted font-mono text-[10px] tracking-widest uppercase md:text-xs">
                        — {post.readTime}
                    </span>
                </div>

                <h1 className="text-text-primary mb-8 text-4xl leading-[1.1] font-bold tracking-tighter md:text-7xl">
                    The Future of AI in <br />
                    <span className="text-accent">Competitive Programming</span>
                </h1>

                <p className="text-text-secondary mb-10 max-w-2xl text-base leading-relaxed font-normal md:text-xl">
                    {post.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 md:gap-8">
                    <button className="bg-accent duration-normal hover:bg-accent-hover focus:ring-accent inline-flex items-center justify-center gap-2 rounded-md px-8 py-4 text-lg font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
                        Read More
                        <ArrowRight className="h-5 w-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="border-accent/30 h-12 w-12 overflow-hidden rounded-full border-2">
                            <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-text-primary text-sm font-bold">
                                {post.author.name}
                            </p>
                            <p className="text-text-muted font-mono text-xs tracking-widest uppercase">
                                {post.author.role}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
