'use client'
import React from 'react'
import { DATE_FILTERS, DIFFICULTY_FILTERS, DURATION_FILTERS } from '../constants/contests.constants'
import { FilterCheckbox } from '@/shared/components/ui/FilterCheckbox'
import { FilterSidebar } from '@/shared/components/layout/FilterSidebar'

const Filters = ({
    sidebarOpen,
    setSidebarOpen,
    selectedDates = [],
    toggleDate = () => {},
    selectedDifficulties = [],
    toggleDifficulty = () => {},
    selectedDurations = [],
    toggleDuration = () => {},
    handleClearFilters = () => {},
}) => {
    return (
        <FilterSidebar
            title="Filters"
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            onClear={handleClearFilters}
            clearLabel="Reset All"
        >
            {/* Date Range */}
            <div>
                <h4 className="text-text-muted mb-3 text-xs font-semibold tracking-widest uppercase">
                    Date Range
                </h4>
                <div className="space-y-1">
                    {DATE_FILTERS.map((range) => (
                        <FilterCheckbox
                            key={range}
                            label={range}
                            checked={selectedDates.includes(range)}
                            onCheckedChange={() => toggleDate(range)}
                        />
                    ))}
                </div>
            </div>

            {/* Duration */}
            <div>
                <h4 className="text-text-muted mb-3 text-xs font-semibold tracking-widest uppercase">
                    Duration
                </h4>
                <div className="space-y-1">
                    {DURATION_FILTERS.map((duration) => (
                        <FilterCheckbox
                            key={duration}
                            label={duration}
                            checked={selectedDurations.includes(duration)}
                            onCheckedChange={() => toggleDuration(duration)}
                        />
                    ))}
                </div>
            </div>

            {/* Difficulty */}
            <div>
                <h4 className="text-text-muted mb-3 text-xs font-semibold tracking-widest uppercase">
                    Difficulty
                </h4>
                <div className="space-y-1">
                    {DIFFICULTY_FILTERS.map((diff) => {
                        const colorType =
                            diff.label === 'Beginner'
                                ? 'success'
                                : diff.label === 'Intermediate'
                                  ? 'warning'
                                  : diff.label === 'Advanced'
                                    ? 'error'
                                    : 'default'

                        return (
                            <FilterCheckbox
                                key={diff.label}
                                label={diff.label}
                                colorType={colorType}
                                checked={selectedDifficulties.includes(diff.label)}
                                onCheckedChange={() => toggleDifficulty(diff.label)}
                            />
                        )
                    })}
                </div>
            </div>
        </FilterSidebar>
    )
}

export default Filters
