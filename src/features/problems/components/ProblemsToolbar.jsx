import React from 'react';

export default function ProblemsToolbar({ sortBy, setSortBy, setSidebarOpen, totalProblems }) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">All Problems</h1>
                <p className="text-text-secondary text-sm mt-1">
                    Showing {totalProblems !== undefined ? totalProblems.toLocaleString() : '-'} coding challenges available
                </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                {/* Mobile filter button */}
                <button
                    className="lg:hidden inline-flex items-center justify-center gap-2 px-3 py-2 bg-bg-subtle hover:bg-bg-muted text-text-primary text-sm font-semibold rounded-md border border-border transition-colors duration-normal"
                    onClick={() => setSidebarOpen(true)}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="21" y1="4" x2="14" y2="4" /><line x1="10" y1="4" x2="3" y2="4" />
                        <line x1="21" y1="12" x2="12" y2="12" /><line x1="8" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="20" x2="16" y2="20" /><line x1="12" y1="20" x2="3" y2="20" />
                        <line x1="14" y1="2" x2="14" y2="6" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="16" y1="18" x2="16" y2="22" />
                    </svg>
                    Filters
                </button>
                <span className="text-text-muted text-sm hidden sm:inline">Sort by:</span>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="bg-bg-page border border-border text-text-primary text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent px-3 py-2 pr-8 cursor-pointer transition-colors duration-normal"
                >
                    <option>Difficulty</option>
                    <option>Acceptance Rate</option>
                    <option>Frequency</option>
                    <option>Most Recent</option>
                </select>
            </div>
        </div>
    );
}
