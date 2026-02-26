import React from 'react'
import StatusIcon from './StatusIcon'
import PaginationBtn from './PaginationBtn'
import { difficultyConfig, normalizeDifficulty } from '../data/problems.data'

// Number of skeleton rows to show while loading
const SKELETON_ROWS = 8

/**
 * ProblemsTable
 *
 * Renders the main problems list.
 * Accepts problems from the real API (via page.js) instead of mock data.
 *
 * Props:
 * - problems       {Array}    - Array of problem objects from /api/problems
 * - pagination     {Object}   - { total, page, limit, pages } from the API
 * - currentPage    {number}   - The currently active page
 * - onPageChange   {Function} - Called with (pageNumber) when user changes page
 * - isLoading      {boolean}  - Show skeleton while fetching
 * - error          {string}   - Error message to display (if any)
 */
export default function ProblemsTable({
    problems,
    pagination,
    currentPage,
    onPageChange,
    solvedIds = [],
    isLoading,
    error,
}) {
    // Build the visible page number buttons (e.g. [1, 2, 3, '...', 8])
    const buildPageNumbers = () => {
        if (!pagination || pagination.pages <= 1) return []
        const total = pagination.pages
        const current = currentPage
        const pages = []

        if (total <= 5) {
            // Show all pages when there are 5 or fewer
            for (let i = 1; i <= total; i++) pages.push(i)
        } else {
            // Always show first and last; add ellipsis in between
            pages.push(1)
            if (current > 3) pages.push('...')
            const start = Math.max(2, current - 1)
            const end = Math.min(total - 1, current + 1)
            for (let i = start; i <= end; i++) pages.push(i)
            if (current < total - 2) pages.push('...')
            pages.push(total)
        }
        return pages
    }

    // --- Render helpers ---

    /** Empty state — shown when API returns 0 results */
    const EmptyState = () => (
        <tr>
            <td colSpan={7} className="px-6 py-16 text-center text-text-muted">
                <div className="flex flex-col items-center gap-3">
                    <svg
                        className="w-10 h-10 text-text-muted opacity-50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <p className="font-medium text-text-primary">No problems found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                </div>
            </td>
        </tr>
    )

    /** Skeleton rows — shown while loading to preserve layout */
    const SkeletonRows = () =>
        Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <tr key={i} className="border-t border-border animate-pulse">
                {/* Status */}
                <td className="px-6 py-4">
                    <div className="h-5 w-5 rounded-full bg-bg-muted" />
                </td>
                {/* ID */}
                <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="h-3 w-12 rounded bg-bg-muted" />
                </td>
                {/* Title */}
                <td className="px-6 py-4">
                    <div className="h-4 w-48 rounded bg-bg-muted mb-2" />
                    <div className="flex gap-1.5 lg:hidden">
                        <div className="h-3 w-12 rounded bg-bg-muted" />
                        <div className="h-3 w-16 rounded bg-bg-muted" />
                    </div>
                </td>
                {/* Difficulty */}
                <td className="px-6 py-4 text-center">
                    <div className="h-5 w-16 rounded-full bg-bg-muted mx-auto" />
                </td>
                {/* Acceptance */}
                <td className="px-6 py-4 hidden md:table-cell">
                    <div className="h-1.5 w-full rounded-full bg-bg-muted mb-1" />
                    <div className="h-3 w-10 rounded bg-bg-muted" />
                </td>
                {/* Submissions */}
                <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="h-3 w-14 rounded bg-bg-muted" />
                </td>
                {/* Tags */}
                <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex gap-1.5">
                        <div className="h-4 w-16 rounded bg-bg-muted" />
                        <div className="h-4 w-10 rounded bg-bg-muted" />
                    </div>
                </td>
            </tr>
        ))

    /** Error state */
    const ErrorState = () => (
        <tr>
            <td colSpan={7} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                    <svg
                        className="w-10 h-10 text-error opacity-60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                    <p className="font-medium text-text-primary">Failed to load problems</p>
                    <p className="text-sm text-text-muted">{error}</p>
                </div>
            </td>
        </tr>
    )

    const pageNumbers = buildPageNumbers()

    return (
        <div className="w-full border border-border rounded-lg overflow-hidden bg-bg-page shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-bg-subtle border-b border-border">
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-14">
                                Status
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-16 hidden sm:table-cell">
                                #
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">
                                Title
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-28 text-center">
                                Difficulty
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-36 hidden md:table-cell">
                                Acceptance
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide w-28 hidden lg:table-cell">
                                Submissions
                            </th>
                            <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wide hidden lg:table-cell">
                                Tags
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Loading skeleton */}
                        {isLoading && <SkeletonRows />}

                        {/* Error state */}
                        {!isLoading && error && <ErrorState />}

                        {/* Empty state */}
                        {!isLoading && !error && problems.length === 0 && <EmptyState />}

                        {/* Real problem rows */}
                        {!isLoading &&
                            !error &&
                            problems.map((p, index) => {
                                // Normalize difficulty to get the right style config
                                // Backend returns "easy" / "medium" / "hard" (lowercase)
                                const normalizedDiff = normalizeDifficulty(p.difficulty)
                                const diff = difficultyConfig[normalizedDiff] || difficultyConfig.Medium

                                // Calculate display index for the # column
                                const rowNumber =
                                    pagination
                                        ? (pagination.page - 1) * pagination.limit + index + 1
                                        : index + 1

                                // Format submission count for display (e.g. 12345 → "12.3k")
                                const formatCount = (n) => {
                                    if (!n || n === 0) return '0'
                                    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
                                    return String(n)
                                }

                                return (
                                    <tr
                                        key={p._id}
                                        className="border-t border-border hover:bg-bg-subtle transition-colors duration-fast cursor-pointer group"
                                    >
                                        {/* Status — dynamic based on user history */}
                                        <td className="px-6 py-4">
                                            <StatusIcon
                                                status={solvedIds.includes(p._id) ? 'solved' : 'unsolved'}
                                            />
                                        </td>

                                        {/* Sequential row number */}
                                        <td className="px-6 py-4 font-mono text-text-muted text-xs hidden sm:table-cell">
                                            #{rowNumber}
                                        </td>

                                        {/* Title + inline tags (small screens) */}
                                        <td className="px-6 py-4">
                                            <a
                                                href={`/problems/${p._id}`}
                                                className="font-medium text-text-primary group-hover:text-accent transition-colors text-sm"
                                            >
                                                {p.title}
                                            </a>
                                            {/* Show tags inline on small screens where tag column is hidden */}
                                            {p.tags && p.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-1.5 lg:hidden">
                                                    {p.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium bg-bg-muted text-text-secondary uppercase tracking-wide"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>

                                        {/* Difficulty badge */}
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${diff.badge}`}
                                            >
                                                {normalizedDiff}
                                            </span>
                                        </td>

                                        {/* Acceptance rate bar + percentage */}
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="w-full bg-bg-muted rounded-full h-1.5 mb-1 relative overflow-hidden">
                                                <div
                                                    className={`absolute top-0 left-0 h-full ${diff.progress}`}
                                                    style={{
                                                        width: `${Math.min(p.acceptanceRate || 0, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-xs text-text-muted font-mono">
                                                {p.acceptanceRate ?? 0}%
                                            </span>
                                        </td>

                                        {/* Total submissions */}
                                        <td className="px-6 py-4 font-mono text-text-muted text-xs hidden lg:table-cell">
                                            {formatCount(p.totalSubmissions)}
                                        </td>

                                        {/* Tag chips (large screens) */}
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            {p.tags && p.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {p.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-medium bg-bg-muted text-text-secondary uppercase tracking-wide"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-text-muted text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-bg-subtle border-t border-border">
                {/* Result count */}
                <p className="text-text-secondary text-sm">
                    {pagination ? (
                        <>
                            Showing{' '}
                            <span className="font-medium text-text-primary">
                                {(pagination.page - 1) * pagination.limit + 1}–
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-text-primary">
                                {pagination.total.toLocaleString()}
                            </span>{' '}
                            problems
                        </>
                    ) : (
                        <span className="text-text-muted">Loading…</span>
                    )}
                </p>

                {/* Page number buttons */}
                {pageNumbers.length > 0 && (
                    <nav className="flex items-center gap-1">
                        {/* Prev */}
                        <PaginationBtn
                            disabled={currentPage <= 1 || isLoading}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </PaginationBtn>

                        {pageNumbers.map((n, i) =>
                            n === '...' ? (
                                <span key={`ellipsis-${i}`} className="px-2 text-text-muted text-sm">
                                    …
                                </span>
                            ) : (
                                <PaginationBtn
                                    key={n}
                                    active={n === currentPage}
                                    disabled={isLoading}
                                    onClick={() => onPageChange(n)}
                                >
                                    {n}
                                </PaginationBtn>
                            )
                        )}

                        {/* Next */}
                        <PaginationBtn
                            disabled={
                                !pagination || currentPage >= pagination.pages || isLoading
                            }
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </PaginationBtn>
                    </nav>
                )}
            </div>
        </div>
    )
}
