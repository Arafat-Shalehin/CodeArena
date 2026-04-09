'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Trophy,
    Plus,
    Search,
    Trash2,
    Eye,
    Edit2,
    Edit,
    Save,
    AlertCircle,
    Loader2,
    Activity,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function AdminContestsPage() {
    const router = useRouter()
    const [contests, setContests] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12
    const [sortConfig, setSortConfig] = useState({ key: 'startTime', direction: 'desc' })

    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedContest, setSelectedContest] = useState(null)

    const fetchAllContests = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/contests')
            const data = await res.json()
            if (data.success) setContests(data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAllContests()
    }, [])

    const handleSort = (key) => {
        let direction = 'asc'
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc'
        setSortConfig({ key, direction })
        setCurrentPage(1)
    }

    const sortedContests = [...contests].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
    })

    const filtered = sortedContests.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const currentItems = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const deleteContest = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This contest and its records will be removed.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: 'var(--ca-border)',
            confirmButtonText: 'Yes, delete it!',
            background: 'var(--ca-bg-page)',
            color: 'var(--ca-text-primary)',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/api/contests/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    })
                    if (res.ok) {
                        setContests(contests.filter((c) => c._id !== id))
                        Swal.fire('Deleted!', 'Contest has been removed.', 'success')
                    }
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete.', 'error')
                }
            }
        })
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        if (new Date(selectedContest.endTime) <= new Date(selectedContest.startTime)) {
            return Swal.fire({
                title: 'Invalid Dates',
                text: 'End time must be after start time.',
                icon: 'warning',
                background: 'var(--ca-bg-page)',
                color: 'var(--ca-text-primary)',
            })
        }
        try {
            const res = await fetch(`/api/contests/${selectedContest._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(selectedContest),
            })
            const data = await res.json()
            if (data.success) {
                Swal.fire('Success!', 'Contest updated successfully.', 'success')
                setIsEditModalOpen(false)
                fetchAllContests()
            } else {
                Swal.fire('Error', data.message || 'Update failed', 'error')
            }
        } catch (error) {
            Swal.fire('Error!', 'Something went wrong.', 'error')
        }
    }

    if (isLoading)
        return (
            <div className="space-y-6 pt-10">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </div>
        )

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <h1 className="text-text-primary flex items-center gap-3 text-3xl font-black tracking-tight uppercase italic">
                        <Trophy className="text-accent size-8" /> Competition{' '}
                        <span className="text-accent">Center</span>
                    </h1>
                    <p className="text-text-muted mt-1 text-[10px] font-black tracking-widest uppercase opacity-70">
                        Host and moderate competitive programming sprints
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/admin/contests/create')}
                    className="bg-accent hover:bg-accent/90 group h-11 rounded-xl px-8 font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" />
                    CREATE EVENT
                </Button>
            </div>

            {/* Metrics & Search Bar */}
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="matte-surface border-border bg-bg-subtle/50 focus-within:border-accent/50 focus-within:ring-accent/20 flex w-full max-w-md items-center gap-3 rounded-xl border px-3 py-1 shadow-sm transition-all focus-within:ring-1">
                    <Search className="text-text-muted size-4" />
                    <Input
                        placeholder="Search by title..."
                        className="border-none bg-transparent text-sm font-bold shadow-none focus-visible:ring-0"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>
                <div className="text-text-muted text-[10px] font-black tracking-widest uppercase opacity-70">
                    Showing <span className="text-text-primary">{filtered.length}</span> active
                    events
                </div>
            </div>

            {/* Main Table */}
            <div className="matte-surface border-border bg-bg-subtle/50 hover:border-accent/20 overflow-hidden rounded-2xl border shadow-sm transition-all">
                <Table className="dense">
                    <TableHeader className="bg-bg-muted/30">
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead
                                className="text-text-muted hover:text-accent h-12 cursor-pointer px-6 transition-colors"
                                onClick={() => handleSort('title')}
                            >
                                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
                                    Event Name <ArrowUpDown size={10} className="opacity-50" />
                                </div>
                            </TableHead>
                            <TableHead className="text-text-muted h-12 px-6 text-[10px] font-black tracking-widest uppercase">
                                Live Status
                            </TableHead>
                            <TableHead
                                className="text-text-muted hover:text-accent h-12 cursor-pointer px-6 transition-colors"
                                onClick={() => handleSort('startTime')}
                            >
                                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
                                    Start Date <ArrowUpDown size={10} className="opacity-50" />
                                </div>
                            </TableHead>
                            <TableHead className="text-text-muted h-12 px-6 text-right text-[10px] font-black tracking-widest uppercase">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentItems.length > 0 ? (
                            currentItems.map((contest) => {
                                const isEnded = new Date(contest.endTime) < new Date()
                                return (
                                    <TableRow
                                        key={contest._id}
                                        className="border-border hover:bg-accent/[0.02] group transition-colors"
                                    >
                                        <TableCell className="px-6 py-3">
                                            <p className="text-text-primary group-hover:text-accent text-sm leading-tight font-black uppercase italic transition-colors">
                                                {contest.title}
                                            </p>
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <Badge
                                                className={`rounded-lg px-2.5 py-0.5 text-[9px] font-black tracking-tighter uppercase ${
                                                    isEnded
                                                        ? 'bg-bg-muted text-text-muted border-border'
                                                        : 'bg-success/10 text-success border-success/20'
                                                }`}
                                                variant="outline"
                                            >
                                                {isEnded ? 'ARCHIVED' : 'ACTIVE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-text-muted px-6 py-3 text-[11px] font-bold">
                                            {new Date(contest.startTime).toLocaleDateString(
                                                undefined,
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                }
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedContest(contest)
                                                        setIsViewModalOpen(true)
                                                    }}
                                                    className="text-text-muted hover:text-accent hover:bg-accent/10 size-8 rounded-lg transition-all active:scale-90"
                                                >
                                                    <Eye size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedContest(contest)
                                                        setIsEditModalOpen(true)
                                                    }}
                                                    className="text-text-muted hover:text-accent hover:bg-accent/10 size-8 rounded-lg transition-all active:scale-90"
                                                >
                                                    <Edit size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteContest(contest._id)}
                                                    className="text-text-muted hover:text-error hover:bg-error/10 size-8 rounded-lg transition-all active:scale-90"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-text-muted h-32 text-center text-xs font-bold tracking-widest uppercase"
                                >
                                    No contests scheduled yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="bg-bg-muted/10 border-border flex items-center justify-between border-t p-4 px-6 md:p-6">
                    <p className="text-text-muted text-[10px] font-black tracking-widest uppercase opacity-70">
                        Page {currentPage} <span className="mx-1 opacity-40">/</span>{' '}
                        {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            variant="outline"
                            size="sm"
                            className="border-border hover:bg-accent rounded-xl px-4 py-0 text-[10px] font-black uppercase transition-all duration-300 hover:text-white active:scale-95 disabled:opacity-50"
                        >
                            <ChevronLeft size={14} className="mr-1" /> Prev
                        </Button>
                        <Button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            variant="outline"
                            size="sm"
                            className="border-border hover:bg-accent rounded-xl px-4 py-0 text-[10px] font-black uppercase transition-all duration-300 hover:text-white active:scale-95 disabled:opacity-50"
                        >
                            Next <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* VIEW MODAL */}
            {isViewModalOpen && selectedContest && (
                <div className="bg-bg-page/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="matte-surface border-border bg-bg-page w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl">
                        <div className="border-border bg-bg-muted/30 flex items-center justify-between border-b p-6">
                            <h2 className="text-text-primary flex items-center gap-2 text-lg font-black uppercase italic">
                                <Trophy className="text-accent h-5 w-5" /> Event{' '}
                                <span className="text-accent">Summary</span>
                            </h2>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-text-muted hover:text-error transition-all hover:rotate-90"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 p-8">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-text-muted ml-0.5 text-[10px] font-black tracking-widest uppercase opacity-60">
                                        Title
                                    </label>
                                    <p className="bg-bg-muted/50 border-border rounded-xl border p-3.5 text-sm font-black tracking-tight uppercase italic">
                                        {selectedContest.title}
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-text-muted ml-0.5 text-[10px] font-black tracking-widest uppercase opacity-60">
                                        About Event
                                    </label>
                                    <div className="bg-bg-muted/50 border-border min-h-[100px] rounded-xl border p-4 text-sm leading-relaxed font-bold">
                                        {selectedContest.description ||
                                            'No detailed description available for this event.'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-text-muted ml-0.5 text-[10px] font-black tracking-widest uppercase opacity-60">
                                            Start Time
                                        </label>
                                        <p className="bg-bg-muted/50 border-border rounded-xl border p-3.5 text-xs font-black italic">
                                            {new Date(selectedContest.startTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-text-muted ml-0.5 text-[10px] font-black tracking-widest uppercase opacity-60">
                                            End Time
                                        </label>
                                        <p className="bg-bg-muted/50 border-border rounded-xl border p-3.5 text-xs font-black italic">
                                            {new Date(selectedContest.endTime).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsViewModalOpen(false)}
                                className="bg-accent/10 text-accent hover:bg-accent border-accent/20 h-11 w-full rounded-xl border font-black uppercase italic transition-all hover:text-white active:scale-95"
                            >
                                CLOSE EVENT PREVIEW
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && selectedContest && (
                <div className="bg-bg-page/60 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="matte-surface border-border bg-bg-page w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl">
                        <form onSubmit={handleUpdate}>
                            <div className="border-border bg-bg-muted/30 flex items-center justify-between border-b p-6">
                                <h2 className="text-text-primary text-lg font-black uppercase italic">
                                    Modify <span className="text-accent">Contest</span>
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-text-muted hover:text-error transition-all hover:rotate-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4 p-8">
                                <div className="space-y-1.5">
                                    <label className="text-text-muted ml-0.5 text-[10px] font-black tracking-widest uppercase opacity-60">
                                        Event Title
                                    </label>
                                    <Input
                                        value={selectedContest.title}
                                        onChange={(e) =>
                                            setSelectedContest({
                                                ...selectedContest,
                                                title: e.target.value,
                                            })
                                        }
                                        className="matte-surface border-border bg-bg-muted/20 focus-visible:ring-accent h-11 rounded-xl px-4 text-sm font-bold shadow-none focus-visible:ring-1"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-text-muted ml-0.5 text-[10px] font-black tracking-widest uppercase opacity-60">
                                        Description
                                    </label>
                                    <Textarea
                                        value={selectedContest.description}
                                        onChange={(e) =>
                                            setSelectedContest({
                                                ...selectedContest,
                                                description: e.target.value,
                                            })
                                        }
                                        className="matte-surface border-border bg-bg-muted/20 focus-visible:ring-accent min-h-[120px] rounded-xl p-4 text-sm font-bold shadow-none focus-visible:ring-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-text-muted ml-0.5 text-[10px] font-black tracking-widest uppercase opacity-60">
                                            Start Date
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={selectedContest.startTime?.slice(0, 16)}
                                            onChange={(e) =>
                                                setSelectedContest({
                                                    ...selectedContest,
                                                    startTime: e.target.value,
                                                })
                                            }
                                            className="matte-surface border-border bg-bg-muted/20 focus-visible:ring-accent h-11 rounded-xl text-xs font-bold shadow-none focus-visible:ring-1"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-text-muted ml-0.5 text-[10px] font-black tracking-widest uppercase opacity-60">
                                            End Date
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={selectedContest.endTime?.slice(0, 16)}
                                            onChange={(e) =>
                                                setSelectedContest({
                                                    ...selectedContest,
                                                    endTime: e.target.value,
                                                })
                                            }
                                            className="matte-surface border-border bg-bg-muted/20 focus-visible:ring-accent h-11 rounded-xl text-xs font-bold shadow-none focus-visible:ring-1"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-accent hover:bg-accent/90 mt-4 h-11 w-full rounded-xl font-black text-white uppercase italic shadow-lg transition-all active:scale-95"
                                >
                                    <Save className="mr-2 h-4 w-4" /> COMMIT CHANGES
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
