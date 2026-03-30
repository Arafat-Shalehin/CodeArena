import React from 'react'
import { FilterSidebar } from '@/shared/components/layout/FilterSidebar'
import { SearchInput } from '@/shared/components/ui/SearchInput'
import { FilterCheckbox } from '@/shared/components/ui/FilterCheckbox'

/**
 * PracticeSidebar
 *
 * Provides filtering controls for the practice topics list.
 * Communicates filter state back to the parent PracticePage.
 */
export default function PracticeSidebar({
    sidebarOpen,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    handleClearFilters,
}) {
    return (
        <FilterSidebar
            title="Filter Topics"
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            onClear={handleClearFilters}
        >
            <div className="space-y-6">
                {/* Search */}
                <div className="bg-bg-page border-border rounded-lg border p-4 shadow-sm xl:border-none xl:bg-transparent xl:p-0 xl:shadow-none">
                    <SearchInput
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search topics..."
                    />
                </div>

                {/* Difficulty */}
                <div className="bg-bg-page border-border rounded-lg border p-4 shadow-sm xl:border-none xl:bg-transparent xl:p-0 xl:shadow-none">
                    <h4 className="text-text-muted mb-4 text-xs font-semibold tracking-widest uppercase">
                        Difficulty
                    </h4>
                    <div className="space-y-1">
                        {['easy', 'medium', 'hard'].map((diff) => (
                            <FilterCheckbox
                                key={diff}
                                label={diff.charAt(0).toUpperCase() + diff.slice(1)}
                                colorType={
                                    diff === 'easy'
                                        ? 'success'
                                        : diff === 'medium'
                                          ? 'warning'
                                          : 'error'
                                }
                                checked={selectedDifficulty === diff}
                                onCheckedChange={() => setSelectedDifficulty(diff)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </FilterSidebar>
    )
}
