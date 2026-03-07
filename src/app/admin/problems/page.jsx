'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Swal from 'sweetalert2'
import {
    Search,
    Plus,
    MoreVertical,
    Edit3,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Filter,
    Database,
    Loader2,
    CheckCircle2,
} from 'lucide-react'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminProblems() {
    const [problems, setProblems] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterDifficulty, setFilterDifficulty] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    const fetchProblems = async () => {
        try {
            const res = await fetch('/api/problems')
            const data = await res.json()
            if (data.success) setProblems(data.data)
        } catch (error) {
            console.error('Failed to fetch problems', error)
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
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            background: '#ffffff',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/api/problems/${id}`, { method: 'DELETE' })
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

    const getDifficultyStyle = (level) => {
        const difficulty = level?.toLowerCase()
        if (difficulty === 'easy') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        if (difficulty === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200'
        return 'bg-rose-100 text-rose-700 border-rose-200'
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#00bc7d]" />
                <p className="text-sm font-medium text-slate-500">Loading...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-4 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Manage Problems
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Create and manage your coding challenges.
                    </p>
                </div>

                {/* FIXED: Removed asChild and used Link directly with Button styles */}
                <Link href="/admin/problems/create">
                    <Button className="flex items-center gap-2 bg-[#00bc7d] shadow-md hover:bg-[#00a36c]">
                        <Plus className="h-4 w-4" /> Add Problem
                    </Button>
                </Link>
            </div>

            <Card className="border-none bg-white/60 shadow-sm backdrop-blur-md">
                <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search problems..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 md:w-[180px]"
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                    >
                        <option value="All">All Difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </CardContent>
            </Card>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-slate-50/80 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Difficulty</th>
                                <th className="p-4 text-center">Submissions</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <AnimatePresence mode="wait">
                                {paginatedProblems.map((p) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={p._id}
                                        className="transition-colors hover:bg-slate-50/50"
                                    >
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">
                                                {p.title}
                                            </div>
                                            <div className="font-mono text-[10px] text-slate-400">
                                                ID: {p._id.slice(-6)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                variant="outline"
                                                className={getDifficultyStyle(p.difficulty)}
                                            >
                                                {p.difficulty}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-mono text-xs font-bold text-slate-600">
                                                    {p.acceptedSubmissions || 0} /{' '}
                                                    {p.totalSubmissions || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    {/* FIXED: No asChild here, simplified Links */}
                                                    <DropdownMenuItem>
                                                        <Link
                                                            href={`/admin/problems/edit/${p._id}`}
                                                            className="flex w-full items-center"
                                                        >
                                                            <Edit3 className="mr-2 h-4 w-4 text-blue-500" />{' '}
                                                            Edit Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Link
                                                            href={`/admin/problems/testcases/${p._id}`}
                                                            className="flex w-full items-center text-emerald-600"
                                                        >
                                                            <Database className="mr-2 h-4 w-4" />{' '}
                                                            Testcases
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(p._id)}
                                                        className="cursor-pointer text-rose-600 focus:bg-rose-50"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4">
                    <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                        Page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
