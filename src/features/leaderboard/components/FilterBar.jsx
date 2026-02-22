import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
        <div className="bg-bg-page border-border mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl p-4 shadow-sm md:flex-row">
            {/* Search */}
            <div className="relative w-full md:w-96">
                <span className="material-symbols-outlined text-text-muted absolute top-1/2 left-3 -translate-y-1/2">
                    search
                </span>
                <Input
                    type="text"
                    placeholder="Search for a legend..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-bg-page border-border focus:border-accent/50 focus:ring-accent/20 rounded-xl pl-10 transition-all"
                />
            </div>

            {/* Filters */}
            <div className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                <select
                    className="bg-bg-page border-border text-text-primary focus:ring-accent/20 cursor-pointer appearance-none rounded-xl py-2 pr-8 pl-3 text-sm font-medium focus:ring-2 focus:outline-none"
                    onChange={(e) => onFilterChange('league', e.target.value)}
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.7em top 50%',
                        backgroundSize: '0.65em auto',
                    }}
                >
                    <option value="all">Global League</option>
                    <option value="friends">Friends Only</option>
                    <option value="company">Company</option>
                </select>

                <select
                    className="bg-bg-page border-border text-text-primary focus:ring-accent/20 cursor-pointer appearance-none rounded-xl border py-2 pr-8 pl-3 text-sm font-medium focus:ring-2 focus:outline-none"
                    onChange={(e) => onFilterChange('timeframe', e.target.value)}
                    style={{
                        backgroundImage:
                            'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.7em top 50%',
                        backgroundSize: '0.65em auto',
                    }}
                >
                    <option value="all_time">All Time</option>
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                </select>
            </div>
        </div>
    )
}
