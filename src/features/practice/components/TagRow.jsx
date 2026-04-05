'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getTagIcon } from '@/features/practice/data/tagIcons'
import DifficultyBar from '@/features/practice/components/DifficultyBar'

export default function TagRow({ group }) {
    const { tag, count, difficulties } = group
    const Icon = getTagIcon(tag)

    return (
        <tr className="border-border hover:bg-bg-subtle duration-fast group cursor-pointer border-t transition-colors">
            <td className="px-6 py-4">
                <div className="bg-bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                    <Icon className="text-accent h-5 w-5" />
                </div>
            </td>
            <td className="px-6 py-4">
                <Link
                    href={`/practice/${encodeURIComponent(tag)}`}
                    className="text-text-primary group-hover:text-accent text-sm font-bold transition-colors"
                >
                    {tag}
                </Link>
            </td>
            <td className="text-text-muted hidden px-6 py-4 text-xs font-bold sm:table-cell">
                {count} {count === 1 ? 'problem' : 'problems'}
            </td>
            <td className="px-6 py-4">
                <DifficultyBar difficulties={difficulties} count={count} />
            </td>
            <td className="px-6 py-4 text-right">
                <Link
                    href={`/practice/${encodeURIComponent(tag)}`}
                    className="text-text-muted/60 group-hover:text-accent inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase transition-colors"
                >
                    Start{' '}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
            </td>
        </tr>
    )
}
