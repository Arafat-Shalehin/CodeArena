import React from 'react'
import { History, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * @typedef {import('../data/sprint-45.data').PastSprint} PastSprint
 */

/**
 * @typedef {Object} ContestPastSprintsProps
 * @property {PastSprint[]} sprints - List of past sprints to display
 */

/**
 * ContestPastSprints component displays a list of previous contest sprints
 * with links to their respective pages.
 *
 * @param {ContestPastSprintsProps} props
 * @returns {JSX.Element}
 */
export const ContestPastSprints = ({ sprints }) => {
    return (
        <section className="border-border bg-bg-subtle rounded-2xl border p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
                <History className="text-accent h-5 w-5" />
                <h2 className="text-text-primary text-xl font-bold">Past Sprints</h2>
            </div>

            <div className="space-y-3">
                {sprints.map((sprint) => (
                    <a
                        key={sprint.id}
                        href={`#sprint-${sprint.number}`}
                        className={cn(
                            'group bg-bg-page flex items-center justify-between rounded-xl border border-transparent p-3 transition-all',
                            'hover:border-accent/20 hover:shadow-sm'
                        )}
                    >
                        <div>
                            <h5 className="text-text-primary group-hover:text-accent text-sm font-bold transition-colors">
                                Sprint #{sprint.number}
                            </h5>
                            <p className="text-text-muted text-[10px] font-medium tracking-wide uppercase">
                                {sprint.date}
                            </p>
                        </div>
                        <ChevronRight className="text-text-muted group-hover:text-accent h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                ))}
            </div>
        </section>
    )
}
