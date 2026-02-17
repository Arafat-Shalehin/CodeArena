import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * @component FilterBar
 * @description Filter and search controls for the leaderboard.
 * 
 * Features:
 * - Search input for username filtering
 * - League selector (global, friends, company)
 * - Timeframe selector (all time, weekly, monthly)
 * - Sticky positioning on scroll
 * 
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query value
 * @param {Function} props.onSearchChange - Handler for search input changes
 * @param {Function} props.onFilterChange - Handler for filter dropdown changes
 * @returns {JSX.Element} The rendered filter bar.
 */
export function FilterBar({ searchQuery, onSearchChange, onFilterChange }) {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-bg-subtle/50 backdrop-blur-sm p-4 rounded-2xl border-border shadow-sm sticky top-20 z-30">
            {/* Search */}
            <div className="relative w-full md:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    search
                </span>
                <Input
                    type="text"
                    placeholder="Search for a legend..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 bg-bg-page border-border focus:border-accent/50 focus:ring-accent/20 transition-all rounded-xl"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                <select
                    className="pl-3 pr-8 py-2 bg-bg-page border-border rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer appearance-none"
                    onChange={(e) => onFilterChange('league', e.target.value)}
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7em top 50%', backgroundSize: '0.65em auto' }}
                >
                    <option value="all">Global League</option>
                    <option value="friends">Friends Only</option>
                    <option value="company">Company</option>
                </select>

                <select
                    className="pl-3 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
                    onChange={(e) => onFilterChange('timeframe', e.target.value)}
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7em top 50%', backgroundSize: '0.65em auto' }}
                >
                    <option value="all_time">All Time</option>
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                </select>
            </div>
        </div>
    );
}
