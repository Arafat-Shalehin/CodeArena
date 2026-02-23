import React from 'react';
import { topics } from '../data/problems.data';
import CheckboxGroup from './CheckboxGroup';
import StatusIcon from './StatusIcon';

export default function ProblemsSidebar({ sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery }) {
    return (
        <aside className={`
      ${sidebarOpen ? "fixed inset-0 z-overlay flex" : "hidden"}
      lg:relative lg:flex lg:flex-col lg:inset-auto lg:z-auto
      w-72 lg:w-72 flex-shrink-0
    `}>
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
                    <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-secondary transition-colors duration-normal">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
                    <h3 className="text-text-primary font-semibold mb-4 flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="21" y1="4" x2="14" y2="4" /><line x1="10" y1="4" x2="3" y2="4" />
                            <line x1="21" y1="12" x2="12" y2="12" /><line x1="8" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="20" x2="16" y2="20" /><line x1="12" y1="20" x2="3" y2="20" />
                            <line x1="14" y1="2" x2="14" y2="6" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="16" y1="18" x2="16" y2="22" />
                        </svg>
                        Filter Problems
                    </h3>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search problems..."
                            className="w-full pl-9 pr-3 py-2 bg-bg-page border border-border rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-normal"
                        />
                    </div>
                </div>

                {/* Difficulty */}
                <div className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
                    <h4 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-4">Difficulty</h4>
                    <div className="space-y-3">
                        <CheckboxGroup label="Easy" count="842" checkboxColorClass="text-success" textColorClass="text-success" ringColorClass="focus:ring-success" />
                        <CheckboxGroup label="Medium" count="1,250" checkboxColorClass="text-warning" textColorClass="text-warning" ringColorClass="focus:ring-warning" />
                        <CheckboxGroup label="Hard" count="450" checkboxColorClass="text-error" textColorClass="text-error" ringColorClass="focus:ring-error" />
                    </div>
                </div>

                {/* Status */}
                <div className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
                    <h4 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-4">Status</h4>
                    <div className="space-y-3">
                        {[
                            { label: "Solved", icon: <StatusIcon status="solved" />, },
                            { label: "Attempted", icon: <StatusIcon status="attempted" /> },
                            { label: "Unsolved", icon: <StatusIcon status="unsolved" /> },
                        ].map(({ label, icon }) => (
                            <label key={label} className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-border text-accent focus:ring-2 focus:ring-accent" />
                                {icon}
                                <span className="text-text-secondary text-sm group-hover:text-text-primary transition-colors">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Topics */}
                <div className="bg-bg-subtle border border-border rounded-lg p-6 shadow-sm">
                    <h4 className="text-text-muted text-xs font-medium uppercase tracking-wide mb-4">Topics</h4>
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                        {topics.map(({ name, count }) => (
                            <CheckboxGroup key={name} label={name} count={count} checkboxColorClass="text-accent" textColorClass="text-text-secondary group-hover:text-text-primary transition-colors" />
                        ))}
                    </div>
                </div>

                {/* Clear All */}
                <button className="w-full bg-bg-subtle p-4 rounded-lg border border-border shadow-sm text-sm text-text-secondary font-medium hover:text-accent hover:border-accent/30 transition-colors duration-normal flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                    </svg>
                    Clear All Filters
                </button>
            </div>
        </aside>
    );
}
