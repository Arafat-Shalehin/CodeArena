'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, Home } from 'lucide-react'

export default function InterviewLayout({ children }) {
    const pathname = usePathname()

    // Don't show the internal nav on the actual session page to maximize space
    // and prevent distractions during the interview.
    const isSessionPage = pathname.match(/^\/interview\/[a-f0-9]{24}$/)

    if (isSessionPage) {
        return <>{children}</>
    }

    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`
        const isLast = index === segments.length - 1
        return {
            name: segment.charAt(0).toUpperCase() + segment.slice(1),
            path,
            isLast,
        }
    })

    return (
        <div className="bg-bg-page selection:bg-accent/30 min-h-screen">
            {/* Consistent Top Nav */}
            <nav className="border-border bg-bg-page/80 fixed top-0 right-0 left-0 z-[100] flex h-16 items-center border-b px-4 backdrop-blur-xl">
                <div className="container mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="group text-text-secondary hover:text-accent flex items-center gap-2 font-black transition-all"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-xs tracking-[0.2em] uppercase">Back to Home</span>
                        </Link>

                        <div className="bg-border hidden h-4 w-px md:block" />

                        {/* Breadcrumbs */}
                        <div className="hidden items-center gap-2 md:flex">
                            <Link href="/">
                                <Home className="text-text-muted hover:text-accent h-3.5 w-3.5 transition-colors" />
                            </Link>
                            {breadcrumbs.map((crumb, i) => (
                                <React.Fragment key={crumb.path}>
                                    <ChevronRight className="text-text-muted h-3 w-3" />
                                    <Link
                                        href={crumb.path}
                                        className={`text-[10px] font-black tracking-widest uppercase transition-colors ${
                                            crumb.isLast
                                                ? 'text-text-primary'
                                                : 'text-text-muted hover:text-accent'
                                        }`}
                                    >
                                        {crumb.name}
                                    </Link>
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="border-accent/20 bg-accent/10 hidden items-center gap-2 rounded-full border px-3 py-1 sm:flex">
                            <div className="bg-accent h-1.5 w-1.5 animate-pulse rounded-full" />
                            <span className="text-accent text-[10px] font-black tracking-tighter uppercase">
                                AI Interview Active
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-16">{children}</div>
        </div>
    )
}
