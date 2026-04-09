'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Search,
    Plus,
    Filter,
    Trash2,
    Database,
    Code2,
    Activity,
    Settings,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Edit3,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Swal from 'sweetalert2'

export default function AdminProblems() {
    const [problems, setProblems] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterDifficulty, setFilterDifficulty] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12

    const fetchProblems = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/problems')
            const data = await res.json()

            if (data.success && Array.isArray(data.data)) {
                setProblems(data.data)
            } else {
                setProblems([])
            }
        } catch (error) {
            console.error('Failed to fetch problems', error)
            setProblems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProblems()
    }, [])

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
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
                    const res = await fetch(`/api/problems/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    })
                    const data = await res.json()
                    if (data.success) {
                        Swal.fire('Deleted!', 'Problem removed successfully.', 'success')
                        fetchProblems()
                    }
                } catch (error) {
                    Swal.fire('Error', 'Server error occurred', 'error')
                }
            }
        })
    }

    const filteredProblems = useMemo(() => {
        return problems.filter((p) => {
            const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
            const matchesFilter =
                filterDifficulty === 'All' ||
                p.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
            return matchesSearch && matchesFilter
        })
    }, [problems, search, filterDifficulty])

    const totalPages = Math.ceil(filteredProblems.length / itemsPerPage)
    const paginatedProblems = filteredProblems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="bg-accent/10 flex h-20 w-20 items-center justify-center rounded-2xl">
                    <Loader2 className="text-accent h-10 w-10 animate-spin" />
                </div>
                <p className="text-text-muted text-[10px] font-black tracking-widest uppercase opacity-60">
                    Syncing Problem Bank...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-text-primary text-3xl font-black tracking-tight uppercase italic">
                        Problem <span className="text-accent">Bank</span>
                    </h1>
                    <p className="text-text-muted mt-1 text-[10px] font-black tracking-widest uppercase opacity-70">
                        Create and manage your coding challenges
                    </p>
                </div>

                <Link href="/admin/problems/create">
                    <Button className="bg-accent hover:bg-accent/90 group h-11 rounded-xl px-8 font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95">
                        <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                        ADD CHALLENGE
                    </Button>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="matte-surface border-border bg-bg-subtle/50 focus-within:border-accent/50 focus-within:ring-accent/20 flex flex-1 items-center gap-3 rounded-xl border px-3 py-1 shadow-sm transition-all focus-within:ring-1">
                    <Search className="text-text-muted size-4" />
                    <Input
                        placeholder="Filter problems..."
                        className="border-none bg-transparent text-sm font-bold shadow-none focus-visible:ring-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select
                    value={filterDifficulty}
                    onValueChange={(val) => {
                        setFilterDifficulty(val)
                        setCurrentPage(1)
                    }}
                >
                    <SelectTrigger className="matte-surface border-border bg-bg-subtle/50 focus:ring-accent/20 h-11 w-full rounded-xl px-4 text-xs font-black uppercase italic shadow-sm md:w-[180px]">
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="opacity-50" />
                            <SelectValue placeholder="Difficulty" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="matte-surface border-border bg-bg-page rounded-xl shadow-xl">
                        <SelectItem
                            value="All"
                            className="text-[10px] font-black tracking-widest uppercase"
                        >
                            All Levels
                        </SelectItem>
                        <SelectItem
                            value="easy"
                            className="text-[10px] font-black tracking-widest uppercase"
                        >
                            Beginner
                        </SelectItem>
                        <SelectItem
                            value="medium"
                            className="text-[10px] font-black tracking-widest uppercase"
                        >
                            Intermediate
                        </SelectItem>
                        <SelectItem
                            value="hard"
                            className="text-[10px] font-black tracking-widest uppercase"
                        >
                            Expert
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Problem Table */}
            <div className="matte-surface border-border bg-bg-subtle/50 hover:border-accent/20 overflow-hidden rounded-2xl border shadow-sm transition-all">
                <Table className="dense">
                    <TableHeader className="bg-bg-muted/30">
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-text-muted h-12 px-6 text-[10px] font-black tracking-widest uppercase">
                                Challenge Details
                            </TableHead>
                            <TableHead className="text-text-muted h-12 px-6 text-[10px] font-black tracking-widest uppercase">
                                Complexity
                            </TableHead>
                            <TableHead className="text-text-muted h-12 px-6 text-center text-[10px] font-black tracking-widest uppercase">
                                Stats (Acc/Total)
                            </TableHead>
                            <TableHead className="text-text-muted h-12 px-6 text-right text-[10px] font-black tracking-widest uppercase">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedProblems.length > 0 ? (
                            paginatedProblems.map((p) => (
                                <TableRow
                                    key={p._id}
                                    className="border-border hover:bg-accent/[0.02] group transition-colors"
                                >
                                    <TableCell className="px-6 py-3">
                                        <p className="text-text-primary group-hover:text-accent text-sm leading-tight font-black uppercase italic transition-colors">
                                            {p.title}
                                        </p>
                                        <p className="text-text-muted mt-0.5 text-[10px] font-bold opacity-60">
                                            ID: {p._id.slice(-8).toUpperCase()}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-6 py-3">
                                        <Badge
                                            className={`rounded-lg px-2.5 py-0.5 text-[9px] font-black tracking-tighter uppercase ${
                                                p.difficulty?.toLowerCase() === 'easy'
                                                    ? 'bg-success/10 text-success border-success/20'
                                                    : p.difficulty?.toLowerCase() === 'medium'
                                                      ? 'bg-warning/10 text-warning border-warning/20'
                                                      : 'bg-error/10 text-error border-error/20'
                                            }`}
                                            variant="outline"
                                        >
                                            {p.difficulty}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-center">
                                        <p className="text-text-primary text-[11px] font-black tracking-tighter italic">
                                            {p.acceptedSubmissions || 0}{' '}
                                            <span className="text-text-muted mx-1 opacity-30">
                                                /
                                            </span>{' '}
                                            {p.totalSubmissions || 0}
                                        </p>
                                    </TableCell>
                                    <TableCell className="px-6 py-3 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-text-muted hover:text-accent hover:bg-accent/10 size-8 rounded-lg transition-all active:scale-90"
                                                >
                                                    <MoreVertical size={18} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="matte-surface border-border bg-bg-page min-w-[160px] overflow-hidden rounded-xl p-1 shadow-2xl"
                                            >
                                                <DropdownMenuItem className="focus:bg-accent/10 focus:text-accent group cursor-pointer rounded-lg px-3 py-2 transition-colors">
                                                    <Link
                                                        href={`/admin/problems/edit/${p._id}`}
                                                        className="flex w-full items-center gap-2.5 text-[11px] font-black tracking-tight uppercase"
                                                    >
                                                        <Edit3 className="size-3.5 transition-transform group-hover:scale-110" />
                                                        Edit Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="focus:bg-accent/10 focus:text-accent group cursor-pointer rounded-lg px-3 py-2 transition-colors">
                                                    <Link
                                                        href={`/admin/problems/${p._id}/testcases`}
                                                        className="flex w-full items-center gap-2.5 text-[11px] font-black tracking-tight uppercase"
                                                    >
                                                        <Database className="size-3.5 transition-transform group-hover:scale-110" />
                                                        Testcases
                                                    </Link>
                                                </DropdownMenuItem>
                                                <div className="bg-border my-1 h-px" />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(p._id)}
                                                    className="focus:bg-error/10 focus:text-error group cursor-pointer rounded-lg px-3 py-2 text-[11px] font-black tracking-tight uppercase transition-colors"
                                                >
                                                    <Trash2 className="size-3.5 transition-transform group-hover:scale-110" />
                                                    Remove
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="text-text-muted h-32 text-center text-xs font-bold tracking-widest uppercase"
                                >
                                    No challenges found matching your criteria.
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
        </div>
    )
}
