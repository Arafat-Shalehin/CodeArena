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
            setLoading(true) // ফেচ শুরু করার আগে লোডিং ট্রু করুন
            const res = await fetch('/api/problems')
            const data = await res.json()

            // Safety Check: নিশ্চিত করুন data.data একটি অ্যারে
            if (data.success && Array.isArray(data.data)) {
                setProblems(data.data)
            } else {
                setProblems([]) // যদি ডেটা না থাকে তবে খালি অ্যারে দিন
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

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <Loader2 className="text-accent h-10 w-10 animate-spin" />
                <p className="text-text-muted text-sm font-semibold tracking-wide">
                    Initializing Problem Bank...
                </p>
            </div>
        )
    }

    return (
        <div className="bg-bg-page animate-in fade-in space-y-8 p-6 duration-700 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-text-primary text-3xl font-bold tracking-tight">
                        Problem Bank
                    </h1>
                    <p className="text-text-muted text-sm font-medium">
                        Create and manage your coding challenges.
                    </p>
                </div>

                <Link href="/admin/problems/create">
                    <Button className="bg-accent hover:bg-accent/90 h-11 rounded-lg px-8 font-semibold text-white shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Problem
                    </Button>
                </Link>
            </div>

            <Card className="border-border bg-bg-subtle rounded-xl shadow-sm">
                <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
                    <div className="relative flex-1">
                        <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search problems..."
                            className="input-base pl-10 font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-bg-page border-border text-text-primary focus:ring-accent/20 h-10 w-full rounded-lg border px-3 py-2 text-sm font-medium outline-none focus:ring-2 md:w-[180px]"
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                        value={filterDifficulty}
                    >
                        <option value="All">All Difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </CardContent>
            </Card>

            <div className="border-border bg-bg-page overflow-hidden rounded-xl border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-bg-subtle border-border text-text-muted border-b text-[10px] font-bold tracking-widest uppercase">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Difficulty</th>
                                <th className="px-6 py-4 text-center">Submissions</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                            <AnimatePresence mode="wait">
                                {paginatedProblems.map((p) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={p._id}
                                        className="hover:bg-bg-subtle/50 group transition-colors"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="text-text-primary text-sm font-semibold">
                                                {p.title}
                                            </div>
                                            <div className="text-text-muted mt-1 text-[10px] font-medium tracking-wider uppercase">
                                                UID: {p._id.slice(-6)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                                    p.difficulty?.toLowerCase() === 'easy'
                                                        ? 'bg-success-light text-success'
                                                        : p.difficulty?.toLowerCase() === 'medium'
                                                          ? 'bg-warning-light text-warning'
                                                          : 'bg-error-light text-error'
                                                }`}
                                            >
                                                {p.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-text-primary text-xs font-bold">
                                                    {p.acceptedSubmissions || 0} /{' '}
                                                    {p.totalSubmissions || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-text-secondary hover:text-accent hover:bg-bg-subtle h-8 w-8"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="border-border bg-bg-page w-48 rounded-lg shadow-xl"
                                                >
                                                    <DropdownMenuItem className="hover:bg-bg-subtle cursor-pointer transition-colors">
                                                        <Link
                                                            href={`/admin/problems/edit/${p._id}`}
                                                            className="text-text-primary flex w-full items-center gap-2 py-2 text-sm font-semibold"
                                                        >
                                                            <Edit3 className="text-accent h-4 w-4" />{' '}
                                                            Edit Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-bg-subtle cursor-pointer transition-colors">
                                                        <Link
                                                            href={`/admin/problems/${p._id}/testcases`}
                                                            className="text-text-primary flex w-full items-center gap-2 py-2 text-sm font-semibold"
                                                        >
                                                            <Database className="text-info h-4 w-4" />{' '}
                                                            Testcases
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(p._id)}
                                                        className="text-error hover:bg-error-light cursor-pointer gap-2 py-2.5 text-sm font-semibold transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Delete
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

                <div className="border-border bg-bg-subtle/30 flex items-center justify-between border-t p-6">
                    <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                        Page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs font-bold"
                        >
                            <ChevronLeft size={14} className="mr-1" /> Prev
                        </Button>
                        <Button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs font-bold"
                        >
                            Next <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
