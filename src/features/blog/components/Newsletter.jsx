import React from 'react'

/**
 * Newsletter Component
 * Refactored to follow "Minimal like Vercel" philosophy.
 * Standardized background and text tokens.
 */
const Newsletter = () => {
    return (
        <section className="px-6 py-24 md:px-20 lg:px-32">
            <div className="border-border bg-bg-subtle/50 mx-auto max-w-5xl overflow-hidden rounded-2xl border shadow-sm backdrop-blur-sm">
                <div className="px-6 py-16 text-center md:p-20">
                    <div className="relative z-10">
                        <span className="text-accent-text mb-6 block font-mono text-xs font-medium tracking-[0.3em] uppercase">
                            Stay Synchronized
                        </span>
                        <h2 className="text-text-primary mb-6 text-3xl font-bold tracking-tight md:text-5xl">
                            The Arena Brief
                        </h2>
                        <p className="text-text-secondary mx-auto mb-10 max-w-xl text-lg font-normal">
                            High-velocity updates on upcoming contests, engineering deep-dives, and
                            community spotlights delivered to your inbox weekly.
                        </p>
                        <form
                            className="mx-auto flex max-w-lg flex-col gap-4 md:flex-row"
                            onSubmit={(e) => e.preventDefault()}
                        >
                            <input
                                type="email"
                                placeholder="dev@engine.com"
                                className="border-border bg-bg-page text-text-primary placeholder:text-text-muted duration-normal focus:ring-accent flex-1 rounded-md border px-6 py-3 text-sm transition-colors focus:border-transparent focus:ring-2 focus:outline-none"
                            />
                            <button className="bg-accent duration-normal hover:bg-accent-hover focus:ring-accent rounded-md px-8 py-3 font-semibold text-white transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none active:scale-[0.98]">
                                Initialize Subscription
                            </button>
                        </form>
                        <p className="text-text-muted mt-6 font-mono text-[10px] tracking-widest uppercase">
                            No noise. Pure engineering signal. Opt-out anytime.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Newsletter
