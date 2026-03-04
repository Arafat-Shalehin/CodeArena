import React from 'react'
import StatusIcon from './StatusIcon'
import { Pagination } from '@/shared/components/ui/Pagination'
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
    attemptedIds = [],
    isLoading,
    error,
}) {
    // --- Render helpers ---

    /** Empty state — shown when API returns 0 results */
    const EmptyState = () => (
        <tr>
            <td colSpan={7} className="text-text-muted px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                    <svg
                        className="text-text-muted h-10 w-10 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <p className="text-text-primary font-medium">No problems found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                </div>
            </td>
        </tr>
    )

    /** Skeleton rows — shown while loading to preserve layout */
    const SkeletonRows = () =>
        Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <tr key={i} className="border-border animate-pulse border-t">
                {/* Status */}
                <td className="px-6 py-4">
                    <div className="bg-bg-muted h-5 w-5 rounded-full" />
                </td>
                {/* ID */}
                <td className="hidden px-6 py-4 sm:table-cell">
                    <div className="bg-bg-muted h-3 w-12 rounded" />
                </td>
                {/* Title */}
                <td className="px-6 py-4">
                    <div className="bg-bg-muted mb-2 h-4 w-48 rounded" />
                    <div className="flex gap-1.5 lg:hidden">
                        <div className="bg-bg-muted h-3 w-12 rounded" />
                        <div className="bg-bg-muted h-3 w-16 rounded" />
                    </div>
                </td>
                {/* Difficulty */}
                <td className="px-6 py-4 text-center">
                    <div className="bg-bg-muted mx-auto h-5 w-16 rounded-full" />
                </td>
                {/* Acceptance */}
                <td className="hidden px-6 py-4 md:table-cell">
                    <div className="bg-bg-muted mb-1 h-1.5 w-full rounded-full" />
                    <div className="bg-bg-muted h-3 w-10 rounded" />
                </td>
                {/* Submissions */}
                <td className="hidden px-6 py-4 lg:table-cell">
                    <div className="bg-bg-muted h-3 w-14 rounded" />
                </td>
                {/* Tags */}
                <td className="hidden px-6 py-4 lg:table-cell">
                    <div className="flex gap-1.5">
                        <div className="bg-bg-muted h-4 w-16 rounded" />
                        <div className="bg-bg-muted h-4 w-10 rounded" />
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
                        className="text-error h-10 w-10 opacity-60"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                    <p className="text-text-primary font-medium">Failed to load problems</p>
                    <p className="text-text-muted text-sm">{error}</p>
                </div>
            </td>
        </tr>
    )

    return (
        <div className="border-border bg-bg-page w-full overflow-hidden rounded-lg border shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-bg-subtle border-border border-b">
                            <th className="text-text-muted w-14 px-6 py-3 text-xs font-medium tracking-wide uppercase">
                                Status
                            </th>
                            <th className="text-text-muted hidden w-16 px-6 py-3 text-xs font-medium tracking-wide uppercase sm:table-cell">
                                #
                            </th>
                            <th className="text-text-muted px-6 py-3 text-xs font-medium tracking-wide uppercase">
                                Title
                            </th>
                            <th className="text-text-muted w-28 px-6 py-3 text-center text-xs font-medium tracking-wide uppercase">
                                Difficulty
                            </th>
                            <th className="text-text-muted hidden w-36 px-6 py-3 text-xs font-medium tracking-wide uppercase md:table-cell">
                                Acceptance
                            </th>
                            <th className="text-text-muted hidden w-28 px-6 py-3 text-xs font-medium tracking-wide uppercase lg:table-cell">
                                Submissions
                            </th>
                            <th className="text-text-muted hidden px-6 py-3 text-xs font-medium tracking-wide uppercase lg:table-cell">
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
                                const diff =
                                    difficultyConfig[normalizedDiff] || difficultyConfig.Medium

                                // Calculate display index for the # column
                                const rowNumber = pagination
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
                                        className="border-border hover:bg-bg-subtle duration-fast group cursor-pointer border-t transition-colors"
                                    >
                                        {/* Status — dynamic based on user history */}
                                        <td className="px-6 py-4">
                                            <StatusIcon
                                                status={
                                                    solvedIds.includes(p._id)
                                                        ? 'solved'
                                                        : attemptedIds.includes(p._id)
                                                          ? 'attempted'
                                                          : 'unsolved'
                                                }
                                            />
                                        </td>

                                        {/* Sequential row number */}
                                        <td className="text-text-muted hidden px-6 py-4 font-mono text-xs sm:table-cell">
                                            #{rowNumber}
                                        </td>

                                        {/* Title + inline tags (small screens) */}
                                        <td className="px-6 py-4">
                                            <a
                                                href={`/problems/${p._id}`}
                                                className="text-text-primary group-hover:text-accent text-sm font-medium transition-colors"
                                            >
                                                {p.title}
                                            </a>
                                            {/* Show tags inline on small screens where tag column is hidden */}
                                            {p.tags && p.tags.length > 0 && (
                                                <div className="mt-1.5 flex flex-wrap gap-1.5 lg:hidden">
                                                    {p.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="bg-bg-muted text-text-secondary inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
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
                                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${diff.badge}`}
                                            >
                                                {normalizedDiff}
                                            </span>
                                        </td>

                                        {/* Acceptance rate bar + percentage */}
                                        <td className="hidden px-6 py-4 md:table-cell">
                                            <div className="bg-bg-muted relative mb-1 h-1.5 w-full overflow-hidden rounded-full">
                                                <div
                                                    className={`absolute top-0 left-0 h-full ${diff.progress}`}
                                                    style={{
                                                        width: `${Math.min(p.acceptanceRate || 0, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="text-text-muted font-mono text-xs">
                                                {p.acceptanceRate ?? 0}%
                                            </span>
                                        </td>

                                        {/* Total submissions */}
                                        <td className="text-text-muted hidden px-6 py-4 font-mono text-xs lg:table-cell">
                                            {formatCount(p.totalSubmissions)}
                                        </td>

                                        {/* Tag chips (large screens) */}
                                        <td className="hidden px-6 py-4 lg:table-cell">
                                            {p.tags && p.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {p.tags.map((tag) => (
                                                        <span
                                                            key={tag}
                                                            className="bg-bg-muted text-text-secondary inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
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
            <div className="bg-bg-subtle border-border flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row">
                {/* Result count */}
                <p className="text-text-secondary text-sm">
                    {pagination ? (
                        <>
                            Showing{' '}
                            <span className="text-text-primary font-medium">
                                {(pagination.page - 1) * pagination.limit + 1}–
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            of{' '}
                            <span className="text-text-primary font-medium">
                                {pagination.total.toLocaleString()}
                            </span>{' '}
                            problems
                        </>
                    ) : (
                        <span className="text-text-muted">Loading…</span>
                    )}
                </p>

                {/* Page number buttons */}
                {pagination && pagination.pages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.pages}
                        onPageChange={onPageChange}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </div>
    )
}
