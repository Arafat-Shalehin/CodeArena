import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

/**
 * @component FilterBar
 * @description Filter and search controls for the leaderboard.
 *
 * Features:
 * - Search input for username/name filtering
 * - League selector (global, friends, company)
 * - Timeframe selector (all time, weekly, monthly)
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
                <Search className="text-text-muted absolute top-1/2 left-3 size-5 -translate-y-1/2" />
                <Input
                    type="text"
                    placeholder="Search for a legend..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-bg-page border-border focus:border-accent/50 focus:ring-accent/20 rounded-xl pl-10 transition-all"
                />
            </div>

            {/* Filters */}
            <div className="flex w-full gap-3 overflow-x-auto pb-2 md:w-auto md:pb-0">
                <Select onValueChange={(value) => onFilterChange('league', value)}>
                    <SelectTrigger className="border-border bg-bg-page text-text-primary focus:ring-accent/20 w-[160px] rounded-xl">
                        <SelectValue placeholder="Global League" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Global League</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                </Select>

                <Select onValueChange={(value) => onFilterChange('timeframe', value)}>
                    <SelectTrigger className="border-border bg-bg-page text-text-primary focus:ring-accent/20 w-[140px] rounded-xl">
                        <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_time">All Time</SelectItem>
                        <SelectItem value="weekly">This Week</SelectItem>
                        <SelectItem value="monthly">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
