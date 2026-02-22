import { Button } from '@/components/ui/button'

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
    // Generate page numbers (simplified logic for now)
    const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1)

    return (
        <div className="mt-8 mb-12 flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-border text-text-muted hover:text-text-primary hover:border-border-strong rounded-xl"
            >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
            </Button>

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

            {totalPages > 5 && <span className="text-text-muted px-2">...</span>}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-border text-text-muted hover:text-text-primary hover:border-border-strong rounded-xl"
            >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
            </Button>
        </div>
    )
}
