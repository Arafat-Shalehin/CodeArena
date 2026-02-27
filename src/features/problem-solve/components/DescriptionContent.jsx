'use client'

import React from 'react'

// Icons
import { BookmarkPlus, Share2, ThumbsUp, ThumbsDown } from 'lucide-react'

// UI
import { Badge } from '@/components/ui/badge'

/**
 * DescriptionContent Component
 * Renders the actual problem text, examples, tags, and acceptance rate based on the mockup.
 *
 * @param {Object} props
 * @param {Object} props.problem - The structured mock data
 */
export default function DescriptionContent({ problem }) {
    if (!problem) return null

    return (
        <div className="text-text-primary flex h-full flex-col p-6">
            {/* Header / Title Actions Row */}
            <div className="z-[100] mb-4 flex items-center justify-between">
                <h1 className="text-text-primary text-2xl font-bold tracking-tight">
                    {problem.title}
                </h1>
                <div className="flex items-center gap-2">
                    <button className="text-text-muted hover:bg-bg-subtle hover:text-text-primary rounded-md p-2 transition-colors">
                        <BookmarkPlus size={20} />
                    </button>
                    <button className="text-text-muted hover:bg-bg-subtle hover:text-text-primary rounded-md p-2 transition-colors">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>

            {/* Meta Row: Badges & Upvotes */}
            <div className="mb-6 flex items-center gap-3">
                {/* Dynamically assign badge color based on difficulty - easy mapped for now based on mockup */}
                <Badge
                    variant="outline"
                    className="bg-success-light text-success border-success/20 rounded-full px-2.5 py-0.5 text-xs tracking-widest uppercase"
                >
                    {problem.difficulty}
                </Badge>
                <div className="text-text-muted flex items-center gap-1 text-sm font-medium">
                    <ThumbsUp size={16} />
                    <span>{problem.likes}</span>
                </div>
                <div className="border-border text-text-muted flex items-center gap-1 border-l pl-3 text-sm font-medium">
                    <ThumbsDown size={16} />
                    <span>{problem.dislikes}</span>
                </div>
            </div>

            {/* Problem Body -> Using dangerouslySetInnerHTML to process our HTML mock */}
            <div
                className="prose prose-invert text-text-secondary prose-code:rounded prose-code:bg-bg-subtle prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-sm prose-code:text-text-primary w-full max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{ __html: problem.description }}
            />

            {/* Constraints Block */}
            {problem.constraints && problem.constraints.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-text-primary mb-3 text-base font-semibold">Constraints:</h3>
                    <ul className="text-text-muted list-disc space-y-2 pl-5 text-sm">
                        {problem.constraints.map((constraint, idx) => (
                            <li key={idx}>
                                <code className="bg-bg-subtle text-text-primary rounded px-1.5 py-0.5 font-mono text-xs">
                                    {constraint}
                                </code>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Topics Bar */}
            {problem.topics && problem.topics.length > 0 && (
                <div className="border-border mt-10 border-t pt-6">
                    <h3 className="text-text-muted mb-3 text-xs font-bold tracking-widest uppercase">
                        Related Topics
                    </h3>
                    <div className="z-[100] flex flex-wrap gap-2">
                        {problem.topics.map((topic) => (
                            <Badge
                                key={topic}
                                variant="outline"
                                className="bg-accent-light text-accent-text border-accent/20 hover:bg-accent/20 cursor-pointer text-xs transition-colors"
                            >
                                {topic}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
