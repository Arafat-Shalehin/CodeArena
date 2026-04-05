'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'

/**
 * Actual markdown rendering component with all heavy dependencies.
 * This is lazily loaded by MarkdownRenderer to reduce initial bundle.
 */
export default function MarkdownContent({ content, className = '' }) {
    return (
        <div className={`prose-markdown ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    pre: ({ node, ...props }) => <pre {...props} />,
                    code: ({ node, inline, ...props }) => (
                        <code
                            className={inline ? 'bg-bg-muted rounded px-1' : 'block p-2'}
                            {...props}
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
