import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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

    return (
        <div className="bg-bg-page rounded-[2rem] shadow-xl border border-border overflow-hidden mb-8">
            <div className="overflow-x-auto">
                <Table className="border-collapse">
                    <TableHeader className="bg-bg-subtle/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest w-20">Rank</TableHead>
                            <TableHead className="py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest">Architect</TableHead>
                            <TableHead className="py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest text-center hidden md:table-cell">Solved</TableHead>
                            <TableHead className="py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest text-center hidden lg:table-cell">Country</TableHead>
                            <TableHead className="py-4 md:px-10 md:py-6 text-xs font-bold text-text-secondary uppercase tracking-widest text-right">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border-light bg-transparent">
                        {data.map((row, idx) => {
                            const isTop3 = row.rank <= 3;
                            const isCurrentUser = row.username === currentUser;
                            const rankColor = row.rank === 1 ? 'text-yellow-500' : row.rank === 2 ? 'text-gray-400' : row.rank === 3 ? 'text-orange-500' : 'text-text-muted';

                            return (
                                <TableRow
                                    key={idx}
                                    className={`border-border-light relative ${isCurrentUser ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-bg-subtle/50'}`}
                                >
                                    <TableCell className="py-4 md:px-10 md:py-6 relative z-10">
                                        <span className={`text-xl md:text-2xl font-display font-bold ${rankColor} italic`}>
                                            #{row.rank}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 md:px-10 md:py-6 relative z-10">
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
                                    </TableCell>
                                    <TableCell className="py-4 md:px-10 md:py-6 text-center hidden md:table-cell relative z-10">
                                        <Badge variant="secondary" className="font-mono bg-bg-muted text-text-primary hover:bg-bg-subtle">
                                            {row.solved}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 md:px-10 md:py-6 text-center hidden lg:table-cell relative z-10">
                                        <span className="font-mono text-sm text-text-muted">{row.country || 'N/A'}</span>
                                    </TableCell>
                                    <TableCell className="py-4 md:px-10 md:py-6 text-right relative z-10">
                                        <span className="font-mono font-bold text-accent text-lg">{row.score.toLocaleString()}</span>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
