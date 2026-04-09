'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTagIcon } from '@/features/practice/data/tagIcons'
import DifficultyBar from '@/features/practice/components/DifficultyBar'

export default function TagCard({ group }) {
    const { tag, count, difficulties } = group
    const Icon = getTagIcon(tag)

    return (
        <Link href={`/practice/${encodeURIComponent(tag)}`} className="group block">
            <div className="bg-bg-subtle border-border hover:border-accent/50 flex h-full flex-col rounded-xl border p-5 shadow-sm transition-all hover:shadow-md">
                <div className="mb-4 flex items-start justify-between">
                    <div className="bg-bg-muted flex h-10 w-10 items-center justify-center rounded-lg text-lg">
                        <Icon className="text-accent h-5 w-5" />
                    </div>
                    <span className="text-text-muted bg-bg-muted rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                        {count} {count === 1 ? 'problem' : 'problems'}
                    </span>
                </div>

                <h3 className="text-text-primary group-hover:text-accent mb-3 text-base font-bold tracking-tight transition-colors">
                    {tag}
                </h3>

                <div className="mt-auto">
                    <DifficultyBar difficulties={difficulties} count={count} />
                </div>

                <div className="border-border mt-4 flex items-center justify-between border-t pt-3">
                    <span className="text-text-muted text-[10px] font-bold tracking-wider uppercase">
                        Start Practicing
                    </span>
                    <ArrowRight className="text-text-muted/60 group-hover:text-accent h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    )
}
