'use client';

import React from 'react';

// Shared Layout
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Leaderboard Components
import { LeaderboardHeader } from '@/features/leaderboard/components/LeaderboardHeader';
import { PlatformStats } from '@/features/leaderboard/components/PlatformStats';
import { TopThreePodium } from '@/features/leaderboard/components/TopThreePodium';
import { FilterBar } from '@/features/leaderboard/components/FilterBar';
import { RankingTable } from '@/features/leaderboard/components/RankingTable';
import { Pagination } from '@/features/leaderboard/components/Pagination';

// Data
import { leaderboardUsers } from '@/features/leaderboard/data/leaderboard.data';

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
    const [searchQuery, setSearchQuery] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);

    // Filter users based on search (simple client-side filtering for now)
    const ranksForTable = leaderboardUsers.slice(3); // Skip top 3 (shown in podium)
    const filteredUsers = searchQuery
        ? ranksForTable.filter(user =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : ranksForTable;

    return (
        <div className="min-h-screen flex flex-col bg-bg-page text-text-primary">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full space-y-12">
                <LeaderboardHeader />
                <PlatformStats />
                <TopThreePodium />

                <FilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onFilterChange={(type, value) => console.log('Filter:', type, value)}
                />

                <RankingTable
                    data={filteredUsers}
                    currentUser={null} // TODO: Get from auth context
                />

                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredUsers.length / 20)}
                    onPageChange={setCurrentPage}
                />
            </main>

            <Footer />
        </div>
    );
}
