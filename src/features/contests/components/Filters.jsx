'use client'
import React from 'react'
import { DATE_FILTERS, DIFFICULTY_FILTERS, DURATION_FILTERS } from '../constants/contests.constants'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Filter, X, RefreshCw } from 'lucide-react'

// Reusing the CheckboxGroup pattern from the Problems feature
const CheckboxGroup = ({ label, checked, onCheckedChange, colorType = 'default' }) => {
    const colorStyles = {
        default: {
            checkbox: 'data-[state=checked]:bg-accent data-[state=checked]:border-accent',
            text: 'text-text-secondary group-hover:text-text-primary',
            ring: 'focus-visible:ring-accent',
        },
        success: {
            checkbox: 'data-[state=checked]:bg-success data-[state=checked]:border-success',
            text: 'text-success/80 group-hover:text-success',
            ring: 'focus-visible:ring-success',
        },
        warning: {
            checkbox: 'data-[state=checked]:bg-warning data-[state=checked]:border-warning',
            text: 'text-warning/80 group-hover:text-warning',
            ring: 'focus-visible:ring-warning',
        },
        error: {
            checkbox: 'data-[state=checked]:bg-error data-[state=checked]:border-error',
            text: 'text-error/80 group-hover:text-error',
            ring: 'focus-visible:ring-error',
        },
    }

    const style = colorStyles[colorType] || colorStyles.default

    return (
        <label className="group hover:bg-bg-muted/50 -ml-1.5 flex cursor-pointer items-center justify-between rounded-md p-1.5 transition-colors">
            <div className="flex items-center gap-3">
                <Checkbox
                    className={`border-text-muted/40 transition-all data-[state=checked]:text-white ${style.ring} ${style.checkbox}`}
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                />
                <span
                    className={`text-sm font-medium transition-colors ${style.text} ${
                        checked && colorType === 'default' ? '!text-text-primary font-semibold' : ''
                    }`}
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
                        <h4 className="text-text-muted mb-3 text-xs font-semibold tracking-widest uppercase">
                            Date Range
                        </h4>
                        <div className="space-y-1">
                            {DATE_FILTERS.map((range) => (
                                <CheckboxGroup
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
                                <CheckboxGroup
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
                                    <CheckboxGroup
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
