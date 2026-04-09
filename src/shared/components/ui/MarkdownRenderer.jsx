'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import 'katex/dist/katex.min.css'

// Loading fallback component
function MarkdownLoadingFallback() {
    return (
        <div className="animate-pulse space-y-2">
            <div className="bg-bg-muted h-4 w-full rounded"></div>
            <div className="bg-bg-muted h-4 w-3/4 rounded"></div>
            <div className="bg-bg-muted h-4 w-1/2 rounded"></div>
        </div>
    )
}

// Lazy load the actual markdown rendering component
const LazyMarkdownContent = dynamic(() => import('./MarkdownContent'), {
    ssr: false,
    loading: () => <MarkdownLoadingFallback />,
})

/**
 * MarkdownRenderer component to render problem descriptions with LaTeX and GFM support.
 * Uses lazy loading to reduce initial bundle size.
 *
 * @param {Object} props - Component props
 * @param {string} props.content - The Markdown/LaTeX content to render
 * @param {string} props.className - Additional CSS classes for the container
 */
export default function MarkdownRenderer({ content, className = '' }) {
    return (
        <Suspense fallback={<MarkdownLoadingFallback />}>
            <LazyMarkdownContent content={content} className={className} />
        </Suspense>
    )
}
