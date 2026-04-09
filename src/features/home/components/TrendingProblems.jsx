'use client'

import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export default function TrendingProblems({ problems, getDifficultyClass }) {
    if (!problems?.length) {
        return <p className="text-text-muted text-xs">No trending problems.</p>
    }

    return (
        <div className="flex flex-col gap-4">
            {problems.map((prob) => (
                <Link key={prob._id} href={`/problems/${prob._id}`} className="group block">
                    <div className="mb-1 flex items-start justify-between">
                        <p className="text-text-primary group-hover:text-accent line-clamp-1 text-sm font-medium transition-colors">
                            {prob.title}
                        </p>
                        <span
                            className={`ml-2 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${getDifficultyClass(prob.difficulty)}`}
                        >
                            {prob.difficulty}
                        </span>
                    </div>
                    <p className="text-text-muted text-[11px]">
                        {prob.totalSubmissions?.toLocaleString() || 0} submissions
                    </p>
                </Link>
            ))}
        </div>
    )
}
