import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

/**
 * @component RankingTable
 * @description Displays ranked users in a table format with avatars and stats.
 * 
 * Features:
 * - Responsive table (hides columns on mobile)
 * - Top 3 rankings highlighted
 * - Current user row highlighting
 * - Avatar integration with dicebear
 * - Design token-based styling
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of user ranking objects
 * @param {string} props.currentUser - Username of the currently authenticated user
 * @returns {JSX.Element} The rendered ranking table.
 */
export function RankingTable({ data, currentUser }) {
    if (!data || data.length === 0) {
        return <div className="text-center py-20 text-text-muted">No legends found.</div>;
    }

    const TableRow = ({ row, index }) => {
        const isTop3 = index < 3;
        const isCurrentUser = row.username === currentUser;
        const rankColor = index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-500' : 'text-text-muted';

        return (
            <tr className={`group transition-colors border-b border-border-light last:border-0 relative ${isCurrentUser ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-bg-subtle/50'}`}>
                <td className="px-6 py-4 md:px-10 md:py-6 relative z-10">
                    <span className={`text-xl md:text-2xl font-display font-bold ${rankColor} italic`}>
                        #{row.rank}
                    </span>
                </td>
                <td className="px-6 py-4 md:px-10 md:py-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-10 md:size-12 border-2 border-border shadow-sm">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${row.username}`}
                                alt={row.username}
                            />
                            <AvatarFallback className="bg-bg-muted text-text-primary">
                                {row.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-display font-bold text-text-primary text-base md:text-lg flex items-center gap-2">
                                {row.username}
                                {isTop3 && <span className="text-xs">🔥</span>}
                            </div>
                            <div className="text-xs font-medium text-text-muted uppercase tracking-wider">
                                {row.title}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 md:px-10 md:py-6 text-center hidden md:table-cell relative z-10">
                    <Badge variant="secondary" className="font-mono bg-bg-muted text-text-primary hover:bg-bg-subtle">
                        {row.solved}
                    </Badge>
                </td>
                <td className="px-6 py-4 md:px-10 md:py-6 text-center hidden lg:table-cell relative z-10">
                    <span className="font-mono text-sm text-text-muted">{row.location || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 md:px-10 md:py-6 text-right relative z-10">
                    <span className="font-mono font-bold text-accent text-lg">{row.points.toLocaleString()} pts</span>
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-bg-page rounded-[2rem] shadow-xl border border-border overflow-hidden mb-8">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-bg-subtle/50 border-b border-border">
                            <th className="px-6 py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest w-20">Rank</th>
                            <th className="px-6 py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest">Architect</th>
                            <th className="px-6 py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest text-center hidden md:table-cell">Solved</th>
                            <th className="px-6 py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest text-center hidden lg:table-cell">Location</th>
                            <th className="px-6 py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                        {data.map((row, idx) => (
                            <TableRow key={idx} row={row} index={idx} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
