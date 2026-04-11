import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Pagination Component
 * Minimal and user-friendly navigation for multi-page lists.
 * Following Design Token System: bg-bg-subtle, border-border, text-text-primary.
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <nav className="flex items-center justify-center gap-2 py-8" aria-label="Pagination">
            {/* Previous Page */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-border bg-bg-subtle text-text-secondary hover:bg-bg-muted hover:text-text-primary inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
                {pages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`focus:ring-accent inline-flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
                            currentPage === page
                                ? 'bg-accent text-white shadow-sm'
                                : 'border-border bg-bg-subtle text-text-secondary hover:bg-bg-muted hover:text-text-primary border'
                        }`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Next Page */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-border bg-bg-subtle text-text-secondary hover:bg-bg-muted hover:text-text-primary inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </nav>
    )
}

export default Pagination
