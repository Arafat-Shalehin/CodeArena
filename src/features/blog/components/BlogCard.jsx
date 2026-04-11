import React from 'react'
import * as LucideIcons from 'lucide-react'
import Image from 'next/image'

/**
 * BlogCard Component
 * Following Design Token System:
 * - bg-bg-subtle, border-border, shadow-sm
 * - text-text-primary, text-text-secondary, text-text-muted
 * - font-mono for labels
 */
const BlogCard = ({ post }) => {
    const Icon = LucideIcons[post.icon] || LucideIcons.FileText

    return (
        <div className="group border-border bg-bg-subtle duration-normal flex cursor-pointer flex-col overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow">
            {/* Image Container */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={post.img}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <span className="border-accent/20 bg-bg-page/80 text-accent-text rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium tracking-widest uppercase backdrop-blur-md">
                        {post.tag}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-text-muted font-mono text-xs tracking-widest uppercase">
                        {post.date}
                    </span>
                    <span className="text-accent-text font-mono text-xs uppercase">
                        {post.readTime}
                    </span>
                </div>

                <h3 className="text-text-primary group-hover:text-accent mb-4 text-xl leading-tight font-semibold transition-colors">
                    {post.title}
                </h3>

                <p className="text-text-secondary mb-8 line-clamp-3 text-sm leading-relaxed">
                    {post.description}
                </p>

                {/* Footer */}
                <div className="border-border mt-auto flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-3">
                        <div className="border-border h-8 w-8 overflow-hidden rounded-full border">
                            <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <span className="text-text-secondary text-xs font-semibold tracking-widest uppercase">
                            By {post.author.name}
                        </span>
                    </div>
                    <Icon className="text-accent h-4 w-4" />
                </div>
            </div>
        </div>
    )
}

export default BlogCard
