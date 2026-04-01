import React from 'react'
import { Filter, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Shared layout component for filter sidebars.
 * Provides the mobile drawer overlay, responsive desktop layout, and headers.
 *
 * @param {Object} props
 * @param {string} [props.title='Filters'] - Sidebar heading title
 * @param {boolean} props.isOpen - Whether the mobile sidebar is open
 * @param {Function} props.setIsOpen - State setter for sidebar open state
 * @param {Function} [props.onClear] - Callback to clear all filters
 * @param {string} [props.clearLabel='Clear All Filters'] - Label for the clear button
 * @param {React.ReactNode} props.children - The filter components/checkboxes
 */
export function FilterSidebar({
    title = 'Filters',
    isOpen,
    setIsOpen,
    onClear,
    clearLabel = 'Clear All Filters',
    children,
}) {
    return (
        <aside
            className={` ${
                isOpen ? 'fixed inset-0 z-50 flex' : 'hidden'
            } w-72 flex-shrink-0 lg:relative lg:inset-auto lg:z-auto lg:flex lg:w-64 lg:flex-col`}
        >
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="bg-bg-subtle border-border xl:bg-bg-subtle relative z-10 h-full w-72 space-y-6 overflow-y-auto border-r p-6 shadow-sm lg:h-auto lg:w-full lg:overflow-visible lg:rounded-xl lg:border-none lg:bg-transparent lg:p-0 xl:border xl:p-5">
                {/* Mobile close header */}
                <div className="mb-2 flex items-center justify-between lg:hidden">
                    <span className="text-text-primary font-semibold">{title}</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="hover:bg-bg-page text-text-secondary duration-normal rounded-lg p-1.5 transition-colors"
                        aria-label="Close filter sidebar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Desktop header */}
                <h3 className="text-text-primary mb-6 hidden items-center gap-2 font-bold lg:flex">
                    <Filter className="text-accent h-4 w-4" />
                    {title}
                </h3>

                {/* Filter Controls (Passed via children) */}
                <div className="space-y-8">{children}</div>

                {/* Clear All CTA */}
                {onClear && (
                    <Button
                        variant="outline"
                        className="text-text-secondary hover:!text-accent hover:!bg-accent/10 hover:!border-accent/30 mt-8 w-full gap-2 transition-all duration-300"
                        onClick={onClear}
                    >
                        <RefreshCw className="h-4 w-4" />
                        {clearLabel}
                    </Button>
                )}
            </div>
        </aside>
    )
}
