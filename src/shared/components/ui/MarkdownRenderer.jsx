'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import 'katex/dist/katex.min.css'

/**
 * MarkdownRenderer component to render problem descriptions with LaTeX and GFM support.
 *
 * @param {Object} props - Component props
 * @param {string} props.content - The Markdown/LaTeX content to render
 * @param {string} props.className - Additional CSS classes for the container
 */
export default function MarkdownRenderer({ content, className = '' }) {
    return (
        <div className={`prose-markdown ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Custom components for specific Markdown elements if needed
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
