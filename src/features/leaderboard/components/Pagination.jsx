import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * @component Pagination
 * @description Pagination controls for navigating through leaderboard pages.
 *
 * Features:
 * - Previous/Next navigation buttons
 * - Page number buttons (up to 5 visible)
 * - Active page indicator
 * - Design token-based styling
 *
 * @param {Object} props
 * @param {number} props.currentPage - Currently active page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Handler for page change
 * @returns {JSX.Element} The rendered pagination controls.
 */
export function Pagination({ currentPage, totalPages, onPageChange }) {
    // Generate page numbers (sliding window around currentPage)
    const pages = []
    const range = 2 // Number of pages either side of current

    let start = Math.max(1, currentPage - range)
    let end = Math.min(totalPages, currentPage + range)

    // Adjust if near start or end to keep window size consistent
    if (currentPage <= range) {
        end = Math.min(totalPages, range * 2 + 1)
    } else if (currentPage > totalPages - range) {
        start = Math.max(1, totalPages - range * 2)
    }

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    return (
        <div className="mt-8 mb-12 flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-border text-text-muted hover:text-text-primary hover:border-border-strong rounded-xl"
            >
                <ChevronLeft className="size-5" />
            </Button>

            {start > 1 && (
                <>
                    <Button
                        variant="ghost"
                        onClick={() => onPageChange(1)}
                        className="text-text-muted hover:text-text-primary hover:bg-bg-muted h-10 w-10 rounded-xl p-0 font-mono font-bold"
                    >
                        1
                    </Button>
                    {start > 2 && <span className="text-text-muted px-1">...</span>}
                </>
            )}

            {pages.map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'ghost'}
                    onClick={() => onPageChange(page)}
                    className={`h-10 w-10 rounded-xl p-0 font-mono font-bold ${
                        currentPage === page
                            ? 'bg-accent shadow-accent/20 hover:bg-accent/90 text-white shadow-lg'
                            : 'text-text-muted hover:text-text-primary hover:bg-bg-muted'
                    }`}
                >
                    {page}
                </Button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="text-text-muted px-1">...</span>}
                    <Button
                        variant="ghost"
                        onClick={() => onPageChange(totalPages)}
                        className="text-text-muted hover:text-text-primary hover:bg-bg-muted h-10 w-10 rounded-xl p-0 font-mono font-bold"
                    >
                        {totalPages}
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-border text-text-muted hover:text-text-primary hover:border-border-strong rounded-xl"
            >
                <ChevronRight className="size-5" />
            </Button>
        </div>
    )
}
