import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

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
        return <div className="text-text-muted py-20 text-center">No legends found.</div>
    }

    return (
        <div className="bg-bg-page border-border mb-8 overflow-hidden rounded-[2rem] border shadow-xl">
            <div className="overflow-x-auto">
                <Table className="border-collapse">
                    <TableHeader className="bg-bg-subtle/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-text-secondary w-20 py-4 text-xs font-bold tracking-widest uppercase md:px-10 md:py-6">
                                Rank
                            </TableHead>
                            <TableHead className="text-text-secondary py-4 text-xs font-bold tracking-widest uppercase md:px-10 md:py-6">
                                Architect
                            </TableHead>
                            <TableHead className="text-text-secondary hidden py-4 text-center text-xs font-bold tracking-widest uppercase md:table-cell md:px-10 md:py-6">
                                Solved
                            </TableHead>
                            <TableHead className="text-text-secondary hidden py-4 text-center text-xs font-bold tracking-widest uppercase md:px-10 md:py-6 lg:table-cell">
                                Country
                            </TableHead>
                            <TableHead className="text-text-secondary py-4 text-right text-xs font-bold tracking-widest uppercase md:px-10 md:py-6">
                                Score
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-border divide-y bg-transparent">
                        {data.map((row, idx) => {
                            const isTop3 = row.rank <= 3
                            const isCurrentUser = row.userId.username === currentUser
                            const rankColor =
                                row.rank === 1
                                    ? 'text-yellow-500'
                                    : row.rank === 2
                                      ? 'text-gray-400'
                                      : row.rank === 3
                                        ? 'text-orange-500'
                                        : 'text-text-muted'

                            return (
                                <TableRow
                                    key={idx}
                                    className={`border-border relative ${isCurrentUser ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-bg-subtle/50'}`}
                                >
                                    <TableCell className="relative z-10 py-4 md:px-10 md:py-6">
                                        <span
                                            className={`font-display text-xl font-bold md:text-2xl ${rankColor} italic`}
                                        >
                                            #{row.rank}
                                        </span>
                                    </TableCell>
                                    <TableCell className="relative z-10 py-4 md:px-10 md:py-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="border-border size-10 border-2 shadow-sm md:size-12">
                                                <AvatarImage
                                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${row.userId.username}`}
                                                    alt={row.userId.username}
                                                />
                                                <AvatarFallback className="bg-bg-muted text-text-primary">
                                                    {row.userId.username
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link
                                                    href={`/profile/${row.userId._id}`}
                                                    className="font-display text-text-primary hover:text-accent flex items-center gap-2 text-base font-bold transition-colors md:text-lg"
                                                >
                                                    {row.userId.username}
                                                    {isTop3 && <span className="text-xs">🔥</span>}
                                                </Link>
                                                <div className="text-text-muted text-xs font-medium tracking-wider uppercase">
                                                    {row.title}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="relative z-10 hidden py-4 text-center md:table-cell md:px-10 md:py-6">
                                        <Badge
                                            variant="secondary"
                                            className="bg-bg-muted text-text-primary hover:bg-bg-subtle font-mono"
                                        >
                                            {row.submissions}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="relative z-10 hidden py-4 text-center md:px-10 md:py-6 lg:table-cell">
                                        <span className="text-text-muted font-mono text-sm">
                                            {row.country || 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="relative z-10 py-4 text-right md:px-10 md:py-6">
                                        <span className="text-accent font-mono text-lg font-bold">
                                            {row.score.toLocaleString()}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
