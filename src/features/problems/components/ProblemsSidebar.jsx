import React from 'react'
import { topics } from '../data/problems.data'
import CheckboxGroup from './CheckboxGroup'
import StatusIcon from './StatusIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Filter, Search, RefreshCw } from 'lucide-react'

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
        <aside
            className={` ${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} w-72 flex-shrink-0 lg:relative lg:inset-auto lg:z-auto lg:flex lg:w-72 lg:flex-col`}
        >
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="bg-bg-page relative z-10 h-full w-72 space-y-6 overflow-y-auto p-4 lg:h-auto lg:w-full lg:overflow-visible lg:bg-transparent lg:p-0">
                {/* Mobile close */}
                <div className="mb-2 flex items-center justify-between lg:hidden">
                    <span className="text-text-primary font-semibold">Filters</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="hover:bg-bg-subtle text-text-secondary duration-normal rounded-lg p-1.5 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                    <h3 className="text-text-primary mb-4 flex items-center gap-2 text-sm font-semibold">
                        <Filter className="text-accent h-4 w-4" />
                        Filter Problems
                    </h3>
                    <div className="relative">
                        <Search className="text-text-muted absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search problems..."
                            className="bg-bg-page border-border pl-9"
                        />
                    </div>
                </div>

                {/* Difficulty */}
                <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                    <h4 className="text-text-muted mb-4 text-xs font-medium tracking-wide uppercase">
                        Difficulty
                    </h4>
                    <div className="space-y-3">
                        {['Easy', 'Medium', 'Hard'].map((diff) => (
                            <CheckboxGroup
                                key={diff}
                                label={diff}
                                // Counts are hidden until a global stats API is implemented
                                count={null}
                                checkboxColorClass={
                                    diff === 'Easy'
                                        ? 'success'
                                        : diff === 'Medium'
                                          ? 'warning'
                                          : 'error'
                                }
                                textColorClass={`text-${
                                    diff === 'Easy'
                                        ? 'success'
                                        : diff === 'Medium'
                                          ? 'warning'
                                          : 'error'
                                }`}
                                ringColorClass={`focus-visible:ring-${
                                    diff === 'Easy'
                                        ? 'success'
                                        : diff === 'Medium'
                                          ? 'warning'
                                          : 'error'
                                }`}
                                checked={selectedDifficulties.includes(diff)}
                                onCheckedChange={() => toggleDifficulty(diff)}
                            />
                        ))}
                    </div>
                </div>

                {/* Status - Note: Restricted to UI state for now */}
                <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                    <h4 className="text-text-muted mb-4 text-xs font-medium tracking-wide uppercase">
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
                                className="group flex cursor-pointer items-center gap-3"
                            >
                                <Checkbox
                                    className="data-[state=checked]:bg-accent data-[state=checked]:border-accent text-white"
                                    checked={selectedStatuses.includes(id)}
                                    onCheckedChange={() => toggleStatus(id)}
                                />
                                {icon}
                                <span className="text-text-secondary group-hover:text-text-primary text-sm transition-colors">
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
                <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                    <h4 className="text-text-muted mb-4 text-xs font-medium tracking-wide uppercase">
                        Topics
                    </h4>
                    <div className="custom-scrollbar max-h-56 space-y-3 overflow-y-auto pr-1">
                        {topics.map(({ name }) => (
                            <CheckboxGroup
                                key={name}
                                label={name}
                                // Counts are hidden until a global stats API is implemented
                                count={null}
                                checkboxColorClass="accent"
                                textColorClass="text-text-secondary group-hover:text-text-primary transition-colors"
                                checked={selectedTopics.includes(name)}
                                onCheckedChange={() => toggleTopic(name)}
                            />
                        ))}
                    </div>
                </div>

                {/* Clear All */}
                <Button
                    variant="outline"
                    className="text-text-secondary hover:!text-accent hover:!bg-accent/10 hover:!border-accent/30 w-full gap-2 transition-all duration-300"
                    onClick={handleClearFilters}
                >
                    <RefreshCw className="h-4 w-4" />
                    Clear All Filters
                </Button>
            </div>
        </aside>
    )
}
