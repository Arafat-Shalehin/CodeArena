import React from 'react'

export default function ProblemsToolbar({ sortBy, setSortBy, setSidebarOpen, totalProblems }) {
    return (
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
                <h1 className="text-text-primary text-3xl font-bold">All Problems</h1>
                <p className="text-text-secondary mt-1 text-sm">
                    Showing {totalProblems !== undefined ? totalProblems.toLocaleString() : '-'}{' '}
                    coding challenges available
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                {/* Mobile filter button */}
                <button
                    className="bg-bg-subtle hover:bg-bg-muted text-text-primary border-border duration-normal inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition-colors lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <line x1="21" y1="4" x2="14" y2="4" />
                        <line x1="10" y1="4" x2="3" y2="4" />
                        <line x1="21" y1="12" x2="12" y2="12" />
                        <line x1="8" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="20" x2="16" y2="20" />
                        <line x1="12" y1="20" x2="3" y2="20" />
                        <line x1="14" y1="2" x2="14" y2="6" />
                        <line x1="8" y1="10" x2="8" y2="14" />
                        <line x1="16" y1="18" x2="16" y2="22" />
                    </svg>
                    Filters
                </button>
                <span className="text-text-muted hidden text-sm sm:inline">Sort by:</span>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-bg-page border-border text-text-primary focus:ring-accent duration-normal cursor-pointer rounded-md border px-3 py-2 pr-8 text-sm transition-colors focus:border-transparent focus:ring-2 focus:outline-none"
                    aria-label="Sort by"
                >
                    <option>Difficulty</option>
                    <option>Acceptance Rate</option>
                    <option>Frequency</option>
                    <option>Most Recent</option>
                </select>
            </div>
        </div>
    )
}
