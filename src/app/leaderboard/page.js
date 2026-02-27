'use client'

import { useState } from 'react'

// Shared Layout
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Leaderboard Components
import { LeaderboardHeader } from '@/features/leaderboard/components/LeaderboardHeader'
import { PlatformStats } from '@/features/leaderboard/components/PlatformStats'
import { TopThreePodium } from '@/features/leaderboard/components/TopThreePodium'
import { FilterBar } from '@/features/leaderboard/components/FilterBar'
import { RankingTable } from '@/features/leaderboard/components/RankingTable'
import { Pagination } from '@/features/leaderboard/components/Pagination'

// Auth
import { useAuth } from '@/context/AuthContext'
import { useEffect, useCallback, useMemo } from 'react'

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
    // TODO: Implement state management for search, filters, pagination
    // State for filters and pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const { user } = useAuth()

    const ITEMS_PER_PAGE = 30

    // Real API State
    const [users, setUsers] = useState([])
    const [pagination, setPagination] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    /**
     * Fetch real leaderboard data from the API
     */
    const fetchLeaderboard = useCallback(async (page = 1, search = '') => {
        setIsLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            params.set('page', page)
            params.set('limit', ITEMS_PER_PAGE)
            if (search) params.set('search', search)

            const res = await fetch(`/api/leaderboard?${params.toString()}`)
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
                        username: u.name || 'Anonymous',
                        email: u.email,
                        stats: u.stats
                    },
                    title: (u.stats?.score > 1000) ? 'Supreme Architect' : 'Code Warrior',
                    country: 'Global',
                    streak: 0
                }))
                setUsers(transformed)
                setPagination(json.pagination)
            } else {
                throw new Error(json.error || 'Failed to fetch rankings')
            }
        } catch (err) {
            console.error('[LeaderboardPage] Error:', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Load data when page or debounced search changes
    useEffect(() => {
        // Reset to page 1 if search changes
        if (currentPage !== 1 && debouncedSearch !== '') {
            setCurrentPage(1)
        } else {
            fetchLeaderboard(currentPage, debouncedSearch)
        }
    }, [currentPage, debouncedSearch, fetchLeaderboard])

    const isFiltering = !!debouncedSearch

    // Optimized data computation
    const currentTableData = useMemo(() => {
        if (!isFiltering && currentPage === 1) {
            return users.slice(3) // Exclude top 3 from table on first page
        }
        return users
    }, [users, isFiltering, currentPage])

    const totalPages = pagination?.pages || 1

    // Handlers
    const handleSearch = (value) => {
        setSearchQuery(value)
    }

    const handleFilterChange = (type, value) => {
        // League and timeframe are currently placeholders as DB schema is simple
        // but we reset to page 1 to ensure UI consistency
        setCurrentPage(1)
    }

    return (
        <div className="bg-bg-page text-text-primary flex min-h-screen flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-grow space-y-12 px-4 py-12">
                <LeaderboardHeader />
                <PlatformStats />

                {/* Loading State */}
                {isLoading && (
                    <div className="flex h-96 items-center justify-center">
                        <div className="size-16 animate-spin rounded-full border-b-2 border-accent"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-error/10 border-error/20 text-error rounded-lg border p-4 text-center">
                        {error}
                    </div>
                )}

                {/* Only show Podium in default view on page 1 */}
                {!isLoading && !error && !isFiltering && currentPage === 1 && users.length >= 3 && (
                    <TopThreePodium users={users.slice(0, 3)} />
                )}

                <FilterBar
                    searchQuery={searchQuery}
                    onSearchChange={handleSearch}
                    onFilterChange={handleFilterChange}
                />

                {!isLoading && !error && (
                    <RankingTable
                        data={currentTableData}
                        currentUser={user?.name}
                    />
                )}

                {currentTableData.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, totalPages)}
                        onPageChange={setCurrentPage}
                    />
                )}
            </main>

            <Footer />
        </div>
    )
}
