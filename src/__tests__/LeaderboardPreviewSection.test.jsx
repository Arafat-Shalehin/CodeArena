import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LeaderboardPreviewSection from '@/features/home/components/LeaderboardPreviewSection';

// Mock the hook
vi.mock('@/hooks/useLeaderboard', () => ({
    useLeaderboard: vi.fn()
}));

import { useLeaderboard } from '@/hooks/useLeaderboard';

describe('LeaderboardPreviewSection', () => {
    it('renders loading state', () => {
        useLeaderboard.mockReturnValue({
            users: [],
            isLoading: true,
            error: null
        });

        render(<LeaderboardPreviewSection />);
        expect(screen.getByText(/Loading Global Hall of Fame/i)).toBeDefined();
    });

    it('renders error state', () => {
        useLeaderboard.mockReturnValue({
            users: [],
            isLoading: false,
            error: new Error('Failed')
        });

        render(<LeaderboardPreviewSection />);
        expect(screen.getByText(/Unable to load leaderboard/i)).toBeDefined();
    });

    it('renders users when data is available', () => {
        const mockUsers = [
            { rank: 1, username: 'User1', title: 'Dev', score: 1000, solved: 10 },
            { rank: 2, username: 'User2', title: 'Dev', score: 900, solved: 9 },
            { rank: 3, username: 'User3', title: 'Dev', score: 800, solved: 8 }
        ];

        useLeaderboard.mockReturnValue({
            users: mockUsers,
            isLoading: false,
            error: null
        });

        render(<LeaderboardPreviewSection />);
        expect(screen.getAllByText('User1')[0]).toBeDefined();
        expect(screen.getAllByText('User2')[0]).toBeDefined();
        expect(screen.getAllByText('User3')[0]).toBeDefined();
    });
});
