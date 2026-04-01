'use client'

import React, { useState, useMemo } from 'react'
import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useContest } from '@/hooks/useContest'
import { ArrowLeft, Search, Users, School, Calendar, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export default function ParticipantsPage() {
    const { id: contestId } = useParams()
    const router = useRouter()
    const { contest, isLoading: contestLoading } = useContest(contestId)
    const [searchQuery, setSearchQuery] = useState('')
    const { data: resData, isLoading: swrLoading } = useSWR(
        contestId ? `/api/contests/${contestId}/participants?limit=100` : null,
        (url) => fetch(url).then((r) => r.json()),
        { refreshInterval: 10000 }
    )

    const participants = useMemo(() => {
        if (!resData?.success) return []
        return (resData.data || []).map((p, idx) => ({
            id: p._id,
            name: p.userId?.name || 'Anonymous',
            email: p.userId?.email || '',
            institution: p.userId?.location || 'Independent',
            registeredAt: p.createdAt,
            rank: idx + 1,
            avatar: p.userId?.avatarSeed
                ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId.avatarSeed}`
                : '',
        }))
    }, [resData])

    const totalCount = resData?.pagination?.total || participants.length
    const isLoading = swrLoading && participants.length === 0

    const filteredParticipants = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return participants

        return participants.filter(
            (p) =>
                p.name?.toLowerCase().includes(query) ||
                p.institution?.toLowerCase().includes(query) ||
                p.email?.toLowerCase().includes(query) ||
                p.rank.toString().includes(query)
        )
    }, [participants, searchQuery])

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available'
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    if (contestLoading || isLoading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                <Skeleton className="mb-8 h-10 w-48" />
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-bg-page min-h-screen">
            {/* Sticky Navigation Header */}
            <div className="border-border bg-bg-page/80 sticky top-0 z-10 border-b backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-text-secondary hover:text-accent p-0"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span className="ml-2 hidden text-xs font-black tracking-widest uppercase md:inline">
                                Back
                            </span>
                        </Button>
                        <div className="border-border bg-border h-6 w-px" />
                        <div>
                            <h1 className="text-text-primary text-sm font-black tracking-tight uppercase md:text-lg">
                                {contest?.title || 'Contest Participants'}
                            </h1>
                            <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                                {searchQuery.trim()
                                    ? `Showing ${filteredParticipants.length} of ${totalCount} Registered`
                                    : `${totalCount} Registered Participants`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
                {/* Search Bar section */}
                <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="relative w-full max-w-md">
                        <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search by name, email or institution..."
                            className="border-border bg-bg-subtle focus-visible:ring-accent pl-10 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-text-muted hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                            >
                                <span className="text-xs font-bold uppercase">Clear</span>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-text-muted text-xs font-bold tracking-widest uppercase">
                            Sort:
                        </span>
                        <div className="bg-bg-subtle border-border rounded-lg border px-3 py-1 text-xs font-bold">
                            Registration Date
                        </div>
                    </div>
                </div>

                {/* Table for Desktop, Cards for Mobile */}
                {filteredParticipants.length === 0 ? (
                    <div className="border-border bg-bg-subtle flex flex-col items-center justify-center rounded-2xl border py-20 text-center">
                        <Users className="text-text-muted mb-4 h-12 w-12 opacity-20" />
                        <h3 className="text-text-primary text-lg font-black uppercase">
                            No match found
                        </h3>
                        <p className="text-text-muted text-sm">
                            Tried searching for &quot;{searchQuery}&quot; but nothing matched.
                        </p>
                        <Button
                            variant="link"
                            className="text-accent mt-2 font-bold uppercase"
                            onClick={() => setSearchQuery('')}
                        >
                            Clear search
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="border-border dark:bg-bg-subtle hidden overflow-hidden rounded-xl border bg-white shadow-sm md:block">
                            <table className="w-full text-left">
                                <thead className="border-border bg-bg-subtle/50 text-text-muted border-b text-[10px] font-black tracking-widest uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Institution</th>
                                        <th className="px-6 py-4 text-right">Registered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-border divide-y">
                                    {filteredParticipants.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="hover:bg-accent/[0.02] group transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-text-muted bg-bg-muted rounded px-2 py-0.5 font-mono text-[10px]">
                                                    #{p.rank}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border-2 border-white dark:border-white/5">
                                                        <AvatarImage src={p.avatar} />
                                                        <AvatarFallback className="bg-bg-muted text-text-secondary text-xs font-black uppercase">
                                                            {p.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-text-primary group-hover:text-accent text-sm font-black transition-colors">
                                                        {p.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-text-secondary flex items-center gap-2 text-sm font-medium">
                                                    <School className="text-text-muted h-3.5 w-3.5" />
                                                    {p.institution}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-text-muted flex items-center justify-end gap-2 font-mono text-xs">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(p.registeredAt)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {filteredParticipants.map((p) => (
                                <div
                                    key={p.id}
                                    className="border-border dark:bg-bg-subtle rounded-2xl border bg-white p-5 shadow-sm"
                                >
                                    <div className="mb-4 flex items-center gap-4">
                                        <Avatar className="border-accent/20 h-14 w-14 border-2">
                                            <AvatarImage src={p.avatar} />
                                            <AvatarFallback className="bg-bg-muted text-text-primary text-lg font-black">
                                                {p.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h4 className="text-text-primary text-base leading-tight font-black">
                                                {p.name}
                                            </h4>
                                            <span className="text-accent mt-1 inline-block text-[10px] font-black tracking-widest uppercase">
                                                Rank #{p.rank}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="border-border space-y-3 border-t pt-3">
                                        <div className="text-text-secondary flex items-center gap-2 text-xs font-bold">
                                            <School className="text-text-muted h-4 w-4" />
                                            {p.institution}
                                        </div>
                                        <div className="text-text-muted flex items-center gap-2 text-xs font-bold">
                                            <Calendar className="h-4 w-4" />
                                            Registered: {formatDate(p.registeredAt)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}
