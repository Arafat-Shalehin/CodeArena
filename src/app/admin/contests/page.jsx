'use client'

import React, { useState, useEffect } from 'react'
import {
    Trophy,
    Plus,
    Edit,
    Trash2,
    Search,
    Eye,
    X,
    Save,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import Swal from 'sweetalert2'

export default function AdminContestsPage() {
    const [contests, setContests] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
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
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/api/contests/${id}`, { method: 'DELETE' })
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
        try {
            const res = await fetch(`/api/contests/${selectedContest._id}`, {
                method: 'PATCH', // আপনার API যদি PUT হয় তবে PUT দিন
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedContest),
            })
            const data = await res.json()
            if (data.success) {
                Swal.fire('Success!', 'Contest updated.', 'success')
                setIsEditModalOpen(false)
                fetchAllContests()
            } else {
                Swal.fire('Error', data.message || 'Update failed', 'error')
            }
        } catch (error) {
            Swal.fire('Error!', 'Update failed.', 'error')
        }
    }

    if (isLoading)
        return (
            <div className="p-10">
                <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
        )

    return (
        <div className="bg-bg-page text-text-primary min-h-screen p-6 md:p-10">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight uppercase">
                    <Trophy className="text-accent size-8" /> Contest Manager
                </h1>
                <Button
                    onClick={() => (window.location.href = '/admin/contests/create')}
                    className="bg-accent h-12 rounded-xl px-8 font-black text-white uppercase shadow-lg"
                >
                    <Plus className="mr-2 size-5" /> New Contest
                </Button>
            </div>

            <div className="border-border mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm md:flex-row">
                <div className="flex w-full max-w-md items-center gap-3">
                    <Search className="text-text-muted size-5" />
                    <Input
                        placeholder="Search contests..."
                        className="border-none bg-transparent font-bold focus-visible:ring-0"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>
                <div className="text-text-muted text-[10px] font-black tracking-widest uppercase">
                    Total: {filtered.length} Contests
                </div>
            </div>

            <div className="border-border overflow-hidden rounded-3xl border bg-white shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-bg-page/50 border-border text-text-muted border-b text-[10px] font-black tracking-widest uppercase">
                        <tr>
                            <th
                                className="hover:text-accent cursor-pointer px-6 py-5 transition-colors"
                                onClick={() => handleSort('title')}
                            >
                                <div className="flex items-center gap-1">
                                    Contest Name <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th className="px-6 py-5">Status</th>
                            <th
                                className="hover:text-accent cursor-pointer px-6 py-5 transition-colors"
                                onClick={() => handleSort('startTime')}
                            >
                                <div className="flex items-center gap-1">
                                    Start Date <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                        {currentItems.map((contest) => (
                            <tr
                                key={contest._id}
                                className="hover:bg-accent/[0.02] group transition-colors"
                            >
                                <td className="px-6 py-6 font-black">{contest.title}</td>
                                <td className="px-6 py-6">
                                    <span
                                        className={`rounded-lg border px-3 py-1 text-[10px] font-black uppercase ${
                                            new Date(contest.endTime) < new Date()
                                                ? 'border-red-100 bg-red-50 text-red-600'
                                                : 'border-green-100 bg-green-50 text-green-600'
                                        }`}
                                    >
                                        {new Date(contest.endTime) < new Date()
                                            ? 'Ended'
                                            : 'Active'}
                                    </span>
                                </td>
                                <td className="text-text-muted px-6 py-6 text-xs font-bold italic">
                                    {new Date(contest.startTime).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedContest(contest)
                                                setIsViewModalOpen(true)
                                            }}
                                            className="hover:text-accent"
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
                                            className="hover:text-blue-600"
                                        >
                                            <Edit size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteContest(contest._id)}
                                            className="hover:text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="border-border bg-bg-page/20 flex items-center justify-between border-t p-6">
                    <p className="text-text-muted text-[10px] font-black uppercase italic">
                        Page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl font-bold"
                        >
                            <ChevronLeft size={16} /> Prev
                        </Button>
                        <Button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl font-bold"
                        >
                            Next <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
            {/* VIEW MODAL */}
            {isViewModalOpen && selectedContest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="animate-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                        <div className="border-border bg-bg-page/30 flex items-center justify-between border-b p-6">
                            <h2 className="text-accent flex items-center gap-2 text-xl font-black uppercase italic">
                                <Trophy size={20} /> Contest Details
                            </h2>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-text-muted transition-colors hover:text-red-500"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="space-y-6 p-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-1">
                                    <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                                        Contest Name
                                    </label>
                                    <p className="bg-bg-page/50 border-border rounded-xl border p-3 font-black">
                                        {selectedContest.title}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                                        Description
                                    </label>
                                    <div className="bg-bg-page/50 border-border min-h-[80px] rounded-xl border p-4 text-sm font-medium">
                                        {selectedContest.description || 'No description provided.'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                                            Start Time
                                        </label>
                                        <p className="bg-bg-page/50 border-border rounded-xl border p-3 text-xs font-bold">
                                            {new Date(selectedContest.startTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                                            End Time
                                        </label>
                                        <p className="bg-bg-page/50 border-border rounded-xl border p-3 text-xs font-bold">
                                            {new Date(selectedContest.endTime).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsViewModalOpen(false)}
                                className="mt-4 h-12 w-full rounded-xl bg-black font-black text-white uppercase shadow-lg"
                            >
                                Close Preview
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* EDIT MODAL */}
            {isEditModalOpen && selectedContest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="animate-in zoom-in-95 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl duration-200">
                        <form onSubmit={handleUpdate}>
                            <div className="border-border bg-bg-page/30 flex items-center justify-between border-b p-6">
                                <h2 className="text-xl font-black uppercase italic">
                                    Edit Contest
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-text-muted transition-colors hover:text-black"
                                >
                                    <X />
                                </button>
                            </div>
                            <div className="space-y-4 p-8">
                                <div className="space-y-1">
                                    <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                                        Title
                                    </label>
                                    <Input
                                        value={selectedContest.title}
                                        onChange={(e) =>
                                            setSelectedContest({
                                                ...selectedContest,
                                                title: e.target.value,
                                            })
                                        }
                                        className="rounded-xl font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
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
                                        className="min-h-[100px] rounded-xl"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                                            Start
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
                                            className="rounded-xl text-xs font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-text-muted ml-1 text-[10px] font-black uppercase">
                                            End
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
                                            className="rounded-xl text-xs font-bold"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-accent mt-4 h-12 w-full rounded-xl font-black text-white uppercase shadow-lg"
                                >
                                    <Save className="mr-2" size={18} /> Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
