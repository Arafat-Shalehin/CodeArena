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
            className={`
      ${sidebarOpen ? 'fixed inset-0 z-50 flex' : 'hidden'}
      lg:relative lg:flex lg:flex-col lg:inset-auto lg:z-auto
      w-72 lg:w-72 flex-shrink-0
    `}
        >
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="relative z-10 bg-bg-page lg:bg-transparent w-72 lg:w-full h-full lg:h-auto overflow-y-auto lg:overflow-visible p-4 lg:p-0 space-y-6">
                {/* Mobile close */}
                <div className="flex items-center justify-between lg:hidden mb-2">
                    <span className="font-semibold text-text-primary">Filters</span>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-secondary transition-colors duration-normal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-text-primary font-semibold mb-4 flex items-center gap-2 text-sm">
                        <Filter className="w-4 h-4 text-accent" />
                        Filter Problems
                    </h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 z-10" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search problems..."
                            className="pl-9 bg-bg-page border-border"
                        />
                    </div>
                </div>

                {/* Difficulty */}
                <div className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
                    <h4 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-4">
                        Difficulty
                    </h4>
                    <div className="space-y-3">
                        {['Easy', 'Medium', 'Hard'].map((diff) => (
                            <CheckboxGroup
                                key={diff}
                                label={diff}
                                // Counts are hidden until a global stats API is implemented
                                count={null}
                                checkboxColorClass={`bg-${diff === 'Easy' ? 'success' : diff === 'Medium' ? 'warning' : 'error'
                                    } text-white border-${diff === 'Easy' ? 'success' : diff === 'Medium' ? 'warning' : 'error'
                                    }`}
                                textColorClass={`text-${diff === 'Easy' ? 'success' : diff === 'Medium' ? 'warning' : 'error'
                                    }`}
                                ringColorClass={`focus-visible:ring-${diff === 'Easy' ? 'success' : diff === 'Medium' ? 'warning' : 'error'
                                    }`}
                                checked={selectedDifficulties.includes(diff)}
                                onCheckedChange={() => toggleDifficulty(diff)}
                            />
                        ))}
                    </div>
                </div>

                {/* Status - Note: Restricted to UI state for now */}
                <div className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
                    <h4 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-4">
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
                            <label key={id} className="flex items-center gap-3 cursor-pointer group">
                                <Checkbox
                                    className="data-[state=checked]:bg-accent data-[state=checked]:border-accent text-white"
                                    checked={selectedStatuses.includes(id)}
                                    onCheckedChange={() => toggleStatus(id)}
                                />
                                {icon}
                                <span className="text-text-secondary text-sm group-hover:text-text-primary transition-colors">
                                    {label}
                                </span>
                            </label>
                        ))}
                    </div>
                    <p className="mt-4 text-[10px] text-text-muted italic leading-tight">
                        Status filtering is coming soon.
                    </p>
                </div>

                {/* Topics */}
                <div className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
                    <h4 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-4">
                        Topics
                    </h4>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                        {topics.map(({ name }) => (
                            <CheckboxGroup
                                key={name}
                                label={name}
                                // Counts are hidden until a global stats API is implemented
                                count={null}
                                checkboxColorClass="bg-accent text-white border-accent"
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
                    className="w-full gap-2 text-text-secondary hover:text-accent"
                    onClick={handleClearFilters}
                >
                    <RefreshCw className="w-4 h-4" />
                    Clear All Filters
                </Button>
            </div>
        </aside>
    )
}


