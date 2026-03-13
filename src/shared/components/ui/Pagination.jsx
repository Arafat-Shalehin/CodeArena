import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * @component Pagination
 * @description Shared pagination controls for navigating through paginated data.
 *
 * Features:
 * - Previous/Next navigation buttons
 * - Sliding window for page numbers (up to 5 visible at a time)
 * - Ellipsis (...) indicators for skipped pages
 * - Configurable loading state
 *
 * @param {Object} props
 * @param {number} props.currentPage - Currently active page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Handler called when a page button is clicked
 * @param {boolean} [props.isLoading=false] - If true, disables all interactions
 * @returns {JSX.Element|null} The rendered pagination controls, or null if <= 1 page.
 */
export function Pagination({ currentPage, totalPages, onPageChange, isLoading = false }) {
    if (!totalPages || totalPages <= 1) return null

    // Generate page numbers (sliding window around currentPage)
    const pages = []
    const windowOffset = 2 // Number of pages either side of current to show

    let start = Math.max(1, currentPage - windowOffset)
    let end = Math.min(totalPages, currentPage + windowOffset)

    // Adjust if near start or end to keep window size symmetrically consistent if possible
    if (currentPage <= windowOffset) {
        end = Math.min(totalPages, windowOffset * 2 + 1)
    } else if (currentPage > totalPages - windowOffset) {
        start = Math.max(1, totalPages - windowOffset * 2)
    }

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    return (
        <nav className="my-6 flex items-center justify-center gap-1 sm:gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || isLoading}
                className="border-border text-text-muted hover:text-text-primary hover:border-border-strong duration-normal rounded-xl transition-colors"
                aria-label="Previous page"
            >
                <ChevronLeft className="size-5" />
            </Button>

            {start > 1 && (
                <>
                    <Button
                        variant="ghost"
                        onClick={() => onPageChange(1)}
                        disabled={isLoading}
                        className="text-text-muted hover:text-text-primary hover:bg-bg-muted duration-normal h-10 w-10 rounded-xl p-0 font-mono font-bold transition-colors"
                    >
                        1
                    </Button>
                    {start > 2 && <span className="text-text-muted px-1 sm:px-2">...</span>}
                </>
            )}

            {pages.map((page) => (
                <Button
                    key={`page-${page}`}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    onClick={() => onPageChange(page)}
                    disabled={isLoading}
                    className={`duration-normal h-10 w-10 rounded-xl p-0 font-mono font-bold transition-all ${
                        currentPage === page
                            ? 'bg-accent shadow-accent/20 hover:bg-accent/90 font-bold text-white shadow-lg'
                            : 'text-text-muted hover:text-text-primary hover:bg-bg-muted border border-transparent'
                    }`}
                >
                    {page}
                </Button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && (
                        <span className="text-text-muted px-1 sm:px-2">...</span>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => onPageChange(totalPages)}
                        disabled={isLoading}
                        className="text-text-muted hover:text-text-primary hover:bg-bg-muted duration-normal h-10 w-10 rounded-xl p-0 font-mono font-bold transition-colors"
                    >
                        {totalPages}
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="border-border text-text-muted hover:text-text-primary hover:border-border-strong duration-normal rounded-xl transition-colors"
                aria-label="Next page"
            >
                <ChevronRight className="size-5" />
            </Button>
        </nav>
    )
}
