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
    // State for filters and pagination
    const [searchQuery, setSearchQuery] = React.useState('');
    const [leagueFilter, setLeagueFilter] = React.useState('all');
    const [timeframeFilter, setTimeframeFilter] = React.useState('all_time');
    const [currentPage, setCurrentPage] = React.useState(1);

    const ITEMS_PER_PAGE = 30;

    // Filter users based on search, league, and timeframe
    // Note: In a real app, this would likely be server-side filtering
    const filterUsers = () => {
        let filtered = [...leaderboardUsers];

        // 1. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(query) ||
                user.country.toLowerCase().includes(query)
            );
        }

        // 2. League Filter (Mock Logic)
        if (leagueFilter !== 'all') {
            if (leagueFilter === 'friends') {
                // Mock: Show users with odd indices as "friends"
                filtered = filtered.filter((_, index) => index % 3 === 0);
            } else if (leagueFilter === 'company') {
                // Mock: Show users from top tech hubs as "company"
                const techHubs = ['USA', 'China', 'India', 'Germany', 'UK', 'Canada'];
                filtered = filtered.filter(user => techHubs.includes(user.country));
            }
        }

        // 3. Timeframe Filter (Mock Logic)
        // Since data is static, we'll sort differently to simulate timeframes
        if (timeframeFilter === 'weekly') {
            // Mock: Weekly based on 'streak' (assuming high streak active this week)
            filtered.sort((a, b) => b.streak - a.streak);
        } else if (timeframeFilter === 'monthly') {
            // Mock: Monthly based on 'solved' counts (partial correlation)
            filtered.sort((a, b) => b.solved - a.solved);
        } else {
            // Default: All Time (based on points/score)
            filtered.sort((a, b) => b.score - a.score);
        }

        return filtered;
    };

    const allFilteredUsers = filterUsers();

    // Remove top 3 from the table view ONLY if we are in 'all' league and 'all_time' timeframe
    // AND if we are on the first page.
    // Actually, traditionally top 3 are always separate in leaderboard UI.
    // Let's keep them separate but include them in search results if they match.
    // However, the design has a dedicated Top 3 component.
    // If a user searches for #1, should they appear in the table? Usually yes in search results.
    // But for default view, they are in the podium.
    // Logic: If isFiltering (search or filters active), show all matching users in table.
    // If default view (no filters), exclude top 3 from table (they are in podium).
    const isFiltering = searchQuery || leagueFilter !== 'all' || timeframeFilter !== 'all_time';

    // For specific requirement: "show 30"
    // If not filtering, we skip top 3, so we start from index 3.
    // If filtering, we might include them.
    // To keep it simple and consistent with podium presence:
    // We will always display the Podium for top 3 of 'all_time' global.
    // The table will display the rest.
    // If filters change, the podium might not be relevant (e.g. "Weekly" podium?)
    // For now, let's keep podium static as "All Time Global" and stick to table filtering.
    // So we slice the first 3 OFF only if we are in standard mode.
    // Actually, better UX: effectively hide podium if filtering?
    // Let's sticking to: Table shows data. Podium shows top 3 global all time.

    // Adjusted Logic:
    // Table DataSource = allFilteredUsers
    // If (default view), slice(3).
    // If (filtered), keep all. (So you can see where your friend is, even if #1)

    const tableDataRaw = (!isFiltering) ? allFilteredUsers.slice(3) : allFilteredUsers;

    const totalPages = Math.ceil(tableDataRaw.length / ITEMS_PER_PAGE);

    // Pagination Logic
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentTableData = tableDataRaw.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Handlers
    const handleSearch = (value) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to page 1 on search
    };

    const handleFilterChange = (type, value) => {
        if (type === 'league') setLeagueFilter(value);
        if (type === 'timeframe') setTimeframeFilter(value);
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    return (
        <div className="min-h-screen flex flex-col bg-bg-page text-text-primary">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full space-y-12">
                <LeaderboardHeader />
                <PlatformStats />

                {/* Only show Podium in default view */}
                {!isFiltering && <TopThreePodium />}

                <FilterBar
                    searchQuery={searchQuery}
                    onSearchChange={handleSearch}
                    onFilterChange={handleFilterChange}
                />

                <RankingTable
                    data={currentTableData}
                    currentUser={null} // TODO: Get from auth context
                    startIndex={startIndex + (isFiltering ? 0 : 3) + 1} // Correct rank display
                />

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
    );
}
