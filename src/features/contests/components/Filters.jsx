import React from 'react'
import { DATE_FILTERS, DIFFICULTY_FILTERS } from '../constants/contests.constants'

const FilterSection = ({ title, children }) => (
    <div>
        <p className="text-text-muted mb-4 text-xs font-bold tracking-widest uppercase">{title}</p>
        <div className="space-y-3">{children}</div>
    </div>
)

const Filters = () => {
    return (
        <aside className="w-full flex-shrink-0 lg:w-64">
            <div className="bg-bg-subtle border-border sticky top-24 rounded-xl border p-5 shadow-sm">
                <h3 className="text-text-primary mb-6 flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-accent">filter_list</span>
                    Filters
                </h3>
                <div className="space-y-8">
                    <FilterSection title="Date Range">
                        {DATE_FILTERS.map((range) => (
                            <label
                                key={range}
                                className="group flex cursor-pointer items-center gap-3"
                            >
                                <input
                                    type="checkbox"
                                    className="border-border bg-bg-page text-accent focus:ring-accent rounded"
                                />
                                <span className="text-text-secondary group-hover:text-text-primary text-sm transition-colors">
                                    {range}
                                </span>
                            </label>
                        ))}
                    </FilterSection>

                    <FilterSection title="Difficulty">
                        {DIFFICULTY_FILTERS.map((diff) => (
                            <label
                                key={diff.label}
                                className="group flex cursor-pointer items-center gap-3"
                            >
                                <div className={`h-3 w-3 rounded-full ${diff.color}`} />
                                <span className="text-text-secondary group-hover:text-text-primary text-sm transition-colors">
                                    {diff.label}
                                </span>
                            </label>
                        ))}
                    </FilterSection>
                </div>
                <button className="btn-secondary mt-8 w-full py-2">Reset All</button>
            </div>
        </aside>
    )
}

export default Filters
