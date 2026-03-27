import React from 'react'
import { topics } from '../data/problems.data'
import { FilterCheckbox } from '@/shared/components/ui/FilterCheckbox'
import { FilterSidebar } from '@/shared/components/layout/FilterSidebar'
import { SearchInput } from '@/shared/components/ui/SearchInput'
import StatusIcon from './StatusIcon'
import { Checkbox } from '@/components/ui/checkbox'

/**
 * ProblemsSidebar
 *
 * Provides filtering controls for the problems list.
 * Communicates filter state back to the parent ProblemsPage.
 */
export default function ProblemsSidebar({
    sidebarOpen,
    setSidebarOpen,
    searchQuery,
    setSearchQuery,
    selectedDifficulties,
    toggleDifficulty,
    selectedStatuses,
    toggleStatus,
    selectedTopics,
    toggleTopic,
    handleClearFilters,
}) {
    return (
        <FilterSidebar
            title="Filter Problems"
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
                        placeholder="Search problems..."
                    />
                </div>

                {/* Difficulty */}
                <div className="bg-bg-page border-border rounded-lg border p-4 shadow-sm xl:border-none xl:bg-transparent xl:p-0 xl:shadow-none">
                    <h4 className="text-text-muted mb-4 text-xs font-semibold tracking-widest uppercase">
                        Difficulty
                    </h4>
                    <div className="space-y-1">
                        {['Easy', 'Medium', 'Hard'].map((diff) => (
                            <FilterCheckbox
                                key={diff}
                                label={diff}
                                colorType={
                                    diff === 'Easy'
                                        ? 'success'
                                        : diff === 'Medium'
                                          ? 'warning'
                                          : 'error'
                                }
                                checked={selectedDifficulties.includes(diff)}
                                onCheckedChange={() => toggleDifficulty(diff)}
                            />
                        ))}
                    </div>
                </div>

                {/* Status - Note: Restricted to UI state for now */}
                <div className="bg-bg-page border-border rounded-lg border p-4 shadow-sm xl:border-none xl:bg-transparent xl:p-0 xl:shadow-none">
                    <h4 className="text-text-muted mb-4 text-xs font-semibold tracking-widest uppercase">
                        Status
                    </h4>
                    <div className="space-y-3">
                        {[
                            { label: 'Solved', id: 'solved', icon: <StatusIcon status="solved" /> },
                            {
                                label: 'Attempted',
                                id: 'attempted',
                                icon: <StatusIcon status="attempted" />,
                            },
                            {
                                label: 'Unsolved',
                                id: 'unsolved',
                                icon: <StatusIcon status="unsolved" />,
                            },
                        ].map(({ label, id, icon }) => (
                            <label
                                key={id}
                                className="group hover:bg-bg-muted/50 -ml-1.5 flex cursor-pointer items-center gap-3 rounded-md p-1.5 transition-colors"
                            >
                                <Checkbox
                                    className="data-[state=checked]:bg-accent data-[state=checked]:border-accent border-text-muted/40 text-white transition-all"
                                    checked={selectedStatuses.includes(id)}
                                    onCheckedChange={() => toggleStatus(id)}
                                />
                                {icon}
                                <span className="text-text-secondary group-hover:text-text-primary text-sm font-medium transition-colors">
                                    {label}
                                </span>
                            </label>
                        ))}
                    </div>
                    <p className="text-text-muted mt-4 text-[10px] leading-tight italic">
                        Status filtering is coming soon.
                    </p>
                </div>

                {/* Topics */}
                <div className="bg-bg-page border-border rounded-lg border p-4 shadow-sm xl:border-none xl:bg-transparent xl:p-0 xl:shadow-none">
                    <h4 className="text-text-muted mb-4 text-xs font-semibold tracking-widest uppercase">
                        Topics
                    </h4>
                    <div className="custom-scrollbar max-h-56 space-y-1 overflow-y-auto pr-1">
                        {topics.map(({ name }) => (
                            <FilterCheckbox
                                key={name}
                                label={name}
                                colorType="accent"
                                checked={selectedTopics.includes(name)}
                                onCheckedChange={() => toggleTopic(name)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </FilterSidebar>
    )
}
