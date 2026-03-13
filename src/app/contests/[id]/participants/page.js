'use client'

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useContest } from '@/hooks/useContest'
import { ArrowLeft, Search, Users, School, Calendar, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

// Mock Data as requested (Assuming backend might provide this eventually)
const MOCK_PARTICIPANTS = [
    {
        id: '1',
        name: 'Rabiul Islam',
        institution: 'BUET',
        registeredAt: '2024-03-01T10:00:00Z',
        rank: 1,
        avatar: '',
    },
    {
        id: '2',
        name: 'Zayan Ahmed',
        institution: 'NSU',
        registeredAt: '2024-03-01T10:05:00Z',
        rank: 2,
        avatar: '',
    },
    {
        id: '3',
        name: 'Nishat Tasnim',
        institution: 'University of Dhaka',
        registeredAt: '2024-03-01T10:15:00Z',
        rank: 3,
        avatar: '',
    },
    {
        id: '4',
        name: 'Arafat Sunny',
        institution: 'SUST',
        registeredAt: '2024-03-01T11:00:00Z',
        rank: 4,
        avatar: '',
    },
    {
        id: '5',
        name: 'Mehidi Hasan',
        institution: 'MIST',
        registeredAt: '2024-03-01T12:00:00Z',
        rank: 5,
        avatar: '',
    },
    {
        id: '6',
        name: 'Sara Khan',
        institution: 'Brac University',
        registeredAt: '2024-03-02T09:00:00Z',
        rank: 6,
        avatar: '',
    },
    {
        id: '7',
        name: 'Tanvir Hossain',
        institution: 'CUET',
        registeredAt: '2024-03-02T10:30:00Z',
        rank: 7,
        avatar: '',
    },
    {
        id: '8',
        name: 'Labiba Zaman',
        institution: 'IUT',
        registeredAt: '2024-03-02T11:45:00Z',
        rank: 8,
        avatar: '',
    },
]

export default function ParticipantsPage() {
    const { id: contestId } = useParams()
    const router = useRouter()
    const { contest, isLoading: contestLoading } = useContest(contestId)
    const [searchQuery, setSearchQuery] = useState('')

    const filteredParticipants = useMemo(() => {
        return MOCK_PARTICIPANTS.filter(
            (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.institution.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [searchQuery])

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    if (contestLoading) {
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
                                {MOCK_PARTICIPANTS.length} Total Registered
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
                            placeholder="Filter by name or institution..."
                            className="border-border bg-bg-subtle focus-visible:ring-accent pl-10 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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
                            No participants found
                        </h3>
                        <p className="text-text-muted text-sm">Try adjusting your search query.</p>
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
