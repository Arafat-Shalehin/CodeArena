'use client'

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

import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

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
 * - Framer-motion layout animations for live reordering
 * - Sticky footer for current user rank if not on page
 *
 * @param {Object} props
 * @param {Array} props.data - Array of user ranking objects
 * @param {string} props.currentUser - Username of the currently authenticated user
 * @returns {JSX.Element} The rendered ranking table.
 */
export function RankingTable({ data, currentUser }) {
    const { user: authUser } = useAuth()

    // Check if the authenticated user is present in the current data slice
    const isAuthUserInView = data.some(
        (row) => row.userId?._id === authUser?._id || row.userId?.id === authUser?._id
    )

    // Render a single rank row (shared logic for table and sticky bar)
    const renderRankRow = (row, idx, isSticky = false) => {
        const isTop3 = row.rank <= 3
        const isCurrentUser =
            row.userId?._id === authUser?._id ||
            row.userId?.id === authUser?._id ||
            row.userId?._id === currentUser ||
            row.userId?.username === currentUser

        const rankColor =
            row.rank === 1
                ? 'text-[var(--color-rank-gold)]'
                : row.rank === 2
                  ? 'text-[var(--color-rank-silver)]'
                  : row.rank === 3
                    ? 'text-[var(--color-rank-bronze)]'
                    : 'text-text-muted'

        return (
            <motion.tr
                key={isSticky ? 'sticky-rank' : row._id || row.userId?._id || idx}
                layout={!isSticky}
                initial={{ opacity: 0, y: isSticky ? 20 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                    mass: 1,
                }}
                className={`border-border group border-b transition-colors ${
                    isSticky
                        ? 'bg-accent/15 border-t-accent sticky bottom-0 z-50 border-t-2 shadow-[0_-4px_12px_rgba(0,0,0,0.1)] backdrop-blur-md'
                        : isCurrentUser
                          ? 'bg-accent/10 border-l-accent z-20 border-l-4 shadow-inner'
                          : 'hover:bg-bg-subtle/50'
                }`}
            >
                <TableCell className="py-4 md:px-10 md:py-6">
                    <span
                        className={`font-display text-xl font-bold md:text-2xl ${rankColor} italic`}
                    >
                        #{row.rank}
                    </span>
                </TableCell>
                <TableCell className="py-4 md:px-10 md:py-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <Avatar className="border-border size-8 border-2 shadow-sm md:size-12">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${row.userId?.username || 'user'}`}
                                alt={row.userId?.username}
                            />
                            <AvatarFallback className="bg-bg-muted text-text-primary text-xs">
                                {(row.userId?.username || 'U').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/profile/${row.userId?._id || row.userId?.id}`}
                                className="font-display text-text-primary hover:text-accent flex items-center gap-2 truncate text-sm font-bold transition-colors md:text-lg"
                            >
                                {row.userId?.username}
                                {isTop3 && <span className="text-xs">🔥</span>}
                                {isSticky && (
                                    <Badge
                                        variant="outline"
                                        className="border-accent text-accent px-1.5 py-0 text-[10px]"
                                    >
                                        YOU
                                    </Badge>
                                )}
                            </Link>
                            <div className="text-text-muted truncate text-[10px] font-medium tracking-wider uppercase md:text-xs">
                                {row.title || 'Code Warrior'}
                            </div>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="hidden py-4 text-center md:table-cell md:px-10 md:py-6">
                    <Badge
                        variant="secondary"
                        className="bg-bg-muted text-text-primary hover:bg-bg-subtle font-mono text-xs md:text-sm"
                    >
                        {row.submissions || 0}
                    </Badge>
                </TableCell>
                <TableCell className="hidden py-4 text-center md:px-10 md:py-6 lg:table-cell">
                    <span className="text-text-muted font-mono text-xs md:text-sm">
                        {row.country || 'Global'}
                    </span>
                </TableCell>
                <TableCell className="py-4 text-right md:px-10 md:py-6">
                    <span className="text-accent font-mono text-base font-bold md:text-lg">
                        {(row.score || 0).toLocaleString()}
                    </span>
                </TableCell>
            </motion.tr>
        )
    }

    return (
        <div className="bg-bg-page border-border relative mb-8 overflow-hidden rounded-[2rem] border shadow-xl">
            <div className="w-full">
                <Table className="w-full border-collapse">
                    <TableHeader className="bg-bg-subtle/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-text-secondary w-16 py-4 text-xs font-bold tracking-widest uppercase md:w-20 md:px-10 md:py-6">
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
                        <AnimatePresence mode="popLayout">
                            {data.map((row, idx) => renderRankRow(row, idx))}
                        </AnimatePresence>
                    </TableBody>
                </Table>

                {/* Sticky "My Rank" Bar */}
                {authUser && !isAuthUserInView && authUser.stats?.globalRank && (
                    <div className="w-full">
                        <Table className="w-full border-collapse">
                            <TableBody>
                                {renderRankRow(
                                    {
                                        rank: authUser.stats.globalRank,
                                        userId: {
                                            _id: authUser._id,
                                            username: authUser.name, // Mapping 'name' to 'username' as per common project pattern
                                        },
                                        submissions: authUser.stats.accepted,
                                        score: authUser.stats.score,
                                        country: authUser.location || 'Global',
                                        title:
                                            authUser.stats.score > 40
                                                ? 'Supreme Architect'
                                                : authUser.stats.score > 10
                                                  ? 'Elite Engineer'
                                                  : 'Code Warrior',
                                    },
                                    -1,
                                    true
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    )
}
