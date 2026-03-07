'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// Shared Layout
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Leaderboard Components
import { LeaderboardHeader } from '@/features/leaderboard/components/LeaderboardHeader'
import { PlatformStats } from '@/features/leaderboard/components/PlatformStats'
import { TopThreePodium } from '@/features/leaderboard/components/TopThreePodium'
import { FilterBar } from '@/features/leaderboard/components/FilterBar'
import { RankingTable } from '@/features/leaderboard/components/RankingTable'
import { Pagination } from '@/shared/components/ui/Pagination'

// UI Components
import { Skeleton } from '@/components/ui/skeleton'

// Auth
import { useAuth } from '@/context/AuthContext'

/**
 * Leaderboard Page
 *
 * Global competitive programming rankings showcasing top performers.
 *
 * Sections:
 * - Header: Title and description with live rankings badge
 * - PlatformStats: Platform-wide statistics (participants, submissions, contests, solve rate)
 * - TopThreePodium: Featured top 3 users with medals and avatars
 * - FilterBar: Search and filter controls
 * - RankingTable: Full rankings table (positions 4+)
 * - Pagination: Navigation controls
 */
export default function LeaderboardPage() {
    // State for filters and pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [league, setLeague] = useState('all')
    const [timeframe, setTimeframe] = useState('all_time')
    const { user } = useAuth()

    const ITEMS_PER_PAGE = 100

    // Real API State
    const [users, setUsers] = useState([])
    const [pagination, setPagination] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [socket, setSocket] = useState(null)

    /**
     * Fetch real leaderboard data from the API
     * Uses AbortController to prevent race conditions.
     */
    const fetchLeaderboard = useCallback(
        async (page = 1, search = '', league = 'all', timeframe = 'all_time', signal) => {
            setIsLoading(true)
            setError(null)
            try {
                const params = new URLSearchParams()
                params.set('page', page)
                params.set('limit', ITEMS_PER_PAGE)
                params.set('league', league)
                params.set('timeframe', timeframe)
                if (search) params.set('search', search)

                const res = await fetch(`/api/leaderboard?${params.toString()}`, { signal })
                const json = await res.json()

                if (json.success) {
                    // Transform API User objects to match the expected leaderboard format
                    const transformed = json.data.map((u, index) => ({
                        _id: u._id,
                        rank: (page - 1) * ITEMS_PER_PAGE + index + 1,
                        score: u.stats?.score || 0,
                        submissions: u.stats?.accepted || 0,
                        userId: {
                            _id: u._id,
                            username: u.username || u.name || 'Anonymous',
                            email: u.email,
                            stats: u.stats,
                        },
                        title:
                            u.stats?.score > 5000
                                ? 'Supreme Architect'
                                : u.stats?.score > 1000
                                  ? 'Elite Engineer'
                                  : 'Code Warrior',
                        country: 'Global',
                        streak: 0,
                    }))
                    setUsers(transformed)
                    setPagination(json.pagination)

                    // Dynamically connect to the Socket.IO server provided by the API
                    if (json.livePort && !socket) {
                        const socketUrl = `${window.location.protocol}//${window.location.hostname}:${json.livePort}`
                        const { io } = await import('socket.io-client')
                        const newSocket = io(socketUrl)
                        setSocket(newSocket)
                        console.log(`[Socket.IO] Connecting to ${socketUrl}`)
                    }
                } else {
                    throw new Error(json.error || 'Failed to fetch rankings')
                }
            } catch (err) {
                if (err.name === 'AbortError') return
                console.error('[LeaderboardPage] Error:', err)
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        },
        [socket]
    )

    // Listen for socket updates
    useEffect(() => {
        if (!socket) return

        const handleUpdate = (update) => {
            console.log('[Socket.IO] Rank update received:', update)
            // Trigger a silent refetch (no loading state for better UX)
            fetchLeaderboard(currentPage, debouncedSearch, league, timeframe)
        }

        socket.on('rank_update', handleUpdate)
        return () => {
            socket.off('rank_update', handleUpdate)
        }
    }, [socket, currentPage, debouncedSearch, league, timeframe, fetchLeaderboard])

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Load data when page, search, or filters change
    useEffect(() => {
        const controller = new AbortController()

        fetchLeaderboard(currentPage, debouncedSearch, league, timeframe, controller.signal)

        return () => controller.abort()
    }, [currentPage, debouncedSearch, league, timeframe, fetchLeaderboard])

    const isFiltering = !!debouncedSearch || league !== 'all' || timeframe !== 'all_time'

    // Optimized data computation for Podium vs Table
    const currentTableData = useMemo(() => {
        return users
    }, [users])

    const totalPages = pagination?.pages || 1

    // Handlers
    const handleSearch = (value) => {
        setSearchQuery(value)
        setCurrentPage(1) // Reset to first page on new search
    }

    const handleFilterChange = (type, value) => {
        if (type === 'league') setLeague(value)
        if (type === 'timeframe') setTimeframe(value)
        setCurrentPage(1)
    }

    return (
        <div className="bg-bg-page site-gradient text-text-primary flex min-h-screen flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-grow space-y-12 px-4 py-12">
                <LeaderboardHeader />
                <PlatformStats />

                {/* Only show Podium in default view on page 1 */}
                {!isLoading && !error && !isFiltering && currentPage === 1 && users.length >= 3 && (
                    <TopThreePodium users={users.slice(0, 3)} />
                )}

                <FilterBar
                    searchQuery={searchQuery}
                    onSearchChange={handleSearch}
                    onFilterChange={handleFilterChange}
                />

                {/* Content Area */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(10)].map((_, i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-error/10 border-error/20 text-error rounded-xl border p-8 text-center">
                        <p className="text-lg font-bold">Oops! Something went wrong.</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                ) : users.length > 0 ? (
                    <>
                        <RankingTable
                            data={currentTableData}
                            currentUser={user?.username || user?.name}
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.max(1, totalPages)}
                            onPageChange={setCurrentPage}
                        />
                    </>
                ) : (
                    <div className="text-text-muted py-20 text-center">
                        <p className="text-xl font-medium">No legends found here yet.</p>
                        <p className="text-sm">
                            {isFiltering
                                ? 'Try adjusting your filters or search query.'
                                : 'The arena is waiting for its first champions.'}
                        </p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    )
}
