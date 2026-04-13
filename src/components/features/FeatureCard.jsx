'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * FeatureCard Component
 * A consistent card for displaying features, technologies, or values.
 * Follows the CodeArena Design Token System.
 */
export default function FeatureCard({ icon: Icon, title, description, tags, className }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
                'group bg-bg-subtle border-border hover:border-accent/30 duration-normal rounded-lg border p-5 shadow-sm transition-all hover:shadow-md',
                className
            )}
        >
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="bg-bg-muted text-text-secondary group-hover:text-accent flex-shrink-0 rounded-md p-2.5 transition-colors">
                        <Icon size={20} />
                    </div>
                )}
                <div className="flex-grow">
                    <h3 className="text-text-primary group-hover:text-accent mb-1 text-lg font-semibold transition-colors">
                        {title}
                    </h3>
                    <p className="text-text-secondary mb-3 text-sm leading-relaxed">
                        {description}
                    </p>
                    {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="bg-bg-muted text-text-muted rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
