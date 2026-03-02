'use client'
import React from 'react'
import { DATE_FILTERS, DIFFICULTY_FILTERS, DURATION_FILTERS } from '../constants/contests.constants'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Filter, X, RefreshCw } from 'lucide-react'

// Reusing the CheckboxGroup pattern from the Problems feature
const CheckboxGroup = ({
    label,
    checkboxColorClass,
    textColorClass,
    ringColorClass,
    checked,
    onCheckedChange,
}) => {
    const color = checkboxColorClass || 'accent'

    return (
        <label className="group flex cursor-pointer items-center justify-between">
            <div className="flex items-center gap-3">
                <Checkbox
                    className={`${ringColorClass || ''} data-[state=checked]:bg-${color} data-[state=checked]:border-${color} data-[state=checked]:text-white`}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                />
                <span
                    className={`text-sm font-medium transition-colors ${textColorClass || 'text-text-primary'}`}
                >
                    {label}
                </span>
            </div>
        </label>
    )
}

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
        <aside
            className={` ${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} w-72 flex-shrink-0 lg:relative lg:inset-auto lg:z-auto lg:flex lg:w-64 lg:flex-col`}
        >
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="bg-bg-subtle border-border relative z-10 h-full w-72 space-y-6 overflow-y-auto border-r p-6 shadow-sm lg:h-auto lg:w-full lg:overflow-visible lg:rounded-xl lg:border lg:p-5">
                {/* Mobile close */}
                <div className="mb-2 flex items-center justify-between lg:hidden">
                    <span className="text-text-primary font-semibold">Filters</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="hover:bg-bg-page text-text-secondary duration-normal rounded-lg p-1.5 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <h3 className="text-text-primary mb-6 hidden items-center gap-2 font-bold lg:flex">
                    <Filter className="text-accent h-4 w-4" />
                    Filters
                </h3>

                <div className="space-y-8">
                    {/* Date Range */}
                    <div>
                        <h4 className="text-text-muted mb-4 text-xs font-semibold tracking-widest uppercase">
                            Date Range
                        </h4>
                        <div className="space-y-3">
                            {DATE_FILTERS.map((range) => (
                                <CheckboxGroup
                                    key={range}
                                    label={range}
                                    checkboxColorClass="accent"
                                    textColorClass="text-text-secondary group-hover:text-text-primary"
                                    checked={selectedDates.includes(range)}
                                    onCheckedChange={() => toggleDate(range)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <h4 className="text-text-muted mb-4 text-xs font-semibold tracking-widest uppercase">
                            Duration
                        </h4>
                        <div className="space-y-3">
                            {DURATION_FILTERS.map((duration) => (
                                <CheckboxGroup
                                    key={duration}
                                    label={duration}
                                    checkboxColorClass="accent"
                                    textColorClass="text-text-secondary group-hover:text-text-primary"
                                    checked={selectedDurations.includes(duration)}
                                    onCheckedChange={() => toggleDuration(duration)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <h4 className="text-text-muted mb-4 text-xs font-semibold tracking-widest uppercase">
                            Difficulty
                        </h4>
                        <div className="space-y-3">
                            {DIFFICULTY_FILTERS.map((diff) => {
                                // Map contest difficulty constants to colors
                                const isAllLevels = diff.label === 'All Levels'
                                const diffColorClass =
                                    diff.label === 'Beginner'
                                        ? 'success'
                                        : diff.label === 'Intermediate'
                                          ? 'warning'
                                          : diff.label === 'Advanced'
                                            ? 'error'
                                            : 'accent'

                                return (
                                    <CheckboxGroup
                                        key={diff.label}
                                        label={diff.label}
                                        checkboxColorClass={isAllLevels ? 'accent' : diffColorClass}
                                        textColorClass={`text-${isAllLevels ? 'text-secondary' : diffColorClass}`}
                                        ringColorClass={`focus-visible:ring-${isAllLevels ? 'accent' : diffColorClass}`}
                                        checked={selectedDifficulties.includes(diff.label)}
                                        onCheckedChange={() => toggleDifficulty(diff.label)}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Clear All */}
                <Button
                    variant="outline"
                    className="text-text-secondary hover:!text-accent hover:!bg-accent/10 hover:!border-accent/30 mt-8 w-full gap-2 transition-all duration-300"
                    onClick={handleClearFilters}
                >
                    <RefreshCw className="h-4 w-4" />
                    Reset All
                </Button>
            </div>
        </aside>
    )
}

export default Filters
