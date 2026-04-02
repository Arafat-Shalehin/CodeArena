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
                <div>
                    <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
                        <Trophy className="text-accent h-8 w-8" /> Contest Manager
                    </h1>
                    <p className="text-text-muted mt-1 text-sm font-medium">
                        Schedule and manage competitive programming events.
                    </p>
                </div>
                <Button
                    onClick={() => (window.location.href = '/admin/contests/create')}
                    className="bg-accent hover:bg-accent/90 h-11 rounded-lg px-8 font-semibold text-white shadow-sm"
                >
                    <Plus className="mr-2 h-5 w-5" /> New Contest
                </Button>
            </div>

            <div className="border-border bg-bg-subtle mb-8 flex flex-col items-center justify-between gap-4 rounded-lg border p-4 shadow-sm md:flex-row">
                <div className="flex w-full max-w-md items-center gap-3">
                    <Search className="text-text-muted h-5 w-5" />
                    <Input
                        placeholder="Search contests..."
                        className="input-base border-none bg-transparent font-medium focus-visible:ring-0"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>
                <div className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                    Total: {filtered.length} Contests
                </div>
            </div>

            <div className="border-border bg-bg-page overflow-hidden rounded-lg border shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-bg-subtle border-border text-text-muted border-b text-[10px] font-bold tracking-widest uppercase">
                        <tr>
                            <th
                                className="hover:text-accent cursor-pointer px-6 py-4 transition-colors"
                                onClick={() => handleSort('title')}
                            >
                                <div className="flex items-center gap-2">
                                    Contest Name <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th className="px-6 py-4">Status</th>
                            <th
                                className="hover:text-accent cursor-pointer px-6 py-4 transition-colors"
                                onClick={() => handleSort('startTime')}
                            >
                                <div className="flex items-center gap-2">
                                    Start Date <ArrowUpDown size={12} />
                                </div>
                            </th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-border divide-y">
                        {currentItems.map((contest) => (
                            <tr
                                key={contest._id}
                                className="hover:bg-bg-subtle/50 group transition-colors"
                            >
                                <td className="px-6 py-5 text-sm font-semibold">{contest.title}</td>
                                <td className="px-6 py-5">
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                            new Date(contest.endTime) < new Date()
                                                ? 'bg-error-light text-error'
                                                : 'bg-success-light text-success'
                                        }`}
                                    >
                                        {new Date(contest.endTime) < new Date()
                                            ? 'Ended'
                                            : 'Active'}
                                    </span>
                                </td>
                                <td className="text-text-muted px-6 py-5 text-xs font-medium">
                                    {new Date(contest.startTime).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedContest(contest)
                                                setIsViewModalOpen(true)
                                            }}
                                            className="text-text-secondary hover:text-accent hover:bg-bg-subtle h-8 w-8"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedContest(contest)
                                                setIsEditModalOpen(true)
                                            }}
                                            className="text-text-secondary hover:text-info hover:bg-bg-subtle h-8 w-8"
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteContest(contest._id)}
                                            className="text-text-secondary hover:text-error hover:bg-bg-subtle h-8 w-8"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="border-border bg-bg-subtle/30 flex items-center justify-between border-t p-6">
                    <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                        Page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs font-bold"
                        >
                            <ChevronLeft size={14} className="mr-1" /> Prev
                        </Button>
                        <Button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            variant="outline"
                            size="sm"
                            className="rounded-lg text-xs font-bold"
                        >
                            Next <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
            {/* VIEW MODAL */}
            {isViewModalOpen && selectedContest && (
                <div className="bg-bg-page/40 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="animate-in zoom-in-95 border-border bg-bg-page w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl duration-200">
                        <div className="border-border bg-bg-subtle flex items-center justify-between border-b p-6">
                            <h2 className="text-text-primary flex items-center gap-2 text-lg font-bold">
                                <Trophy className="text-accent h-5 w-5" /> Contest Details
                            </h2>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-text-muted hover:text-error transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 p-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-text-muted ml-1 text-[10px] font-bold tracking-wider uppercase">
                                        Contest Name
                                    </label>
                                    <p className="bg-bg-subtle border-border rounded-lg border p-3 text-sm font-semibold">
                                        {selectedContest.title}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-text-muted ml-1 text-[10px] font-bold tracking-wider uppercase">
                                        Description
                                    </label>
                                    <div className="bg-bg-subtle border-border min-h-[80px] rounded-lg border p-4 text-sm leading-relaxed font-medium">
                                        {selectedContest.description || 'No description provided.'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-text-muted ml-1 text-[10px] font-bold tracking-wider uppercase">
                                            Start Time
                                        </label>
                                        <p className="bg-bg-subtle border-border rounded-lg border p-3 text-xs font-semibold">
                                            {new Date(selectedContest.startTime).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-text-muted ml-1 text-[10px] font-bold tracking-wider uppercase">
                                            End Time
                                        </label>
                                        <p className="bg-bg-subtle border-border rounded-lg border p-3 text-xs font-semibold">
                                            {new Date(selectedContest.endTime).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsViewModalOpen(false)}
                                className="bg-bg-page text-text-primary border-border hover:bg-bg-subtle mt-4 h-11 w-full rounded-lg border font-bold shadow-sm"
                            >
                                Close Preview
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* EDIT MODAL */}
            {isEditModalOpen && selectedContest && (
                <div className="bg-bg-page/40 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
                    <div className="animate-in zoom-in-95 border-border bg-bg-page w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl duration-200">
                        <form onSubmit={handleUpdate}>
                            <div className="border-border bg-bg-subtle flex items-center justify-between border-b p-6">
                                <h2 className="text-text-primary text-lg font-bold">
                                    Edit Contest
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="text-text-muted hover:text-error transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="space-y-4 p-8">
                                <div className="space-y-2">
                                    <label className="text-text-muted ml-1 text-[10px] font-bold tracking-wider uppercase">
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
                                        className="input-base font-semibold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-text-muted ml-1 text-[10px] font-bold tracking-wider uppercase">
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
                                        className="bg-bg-page border-border focus:ring-accent min-h-[100px] rounded-lg text-sm font-medium focus:ring-2 focus:outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-text-muted ml-1 text-[10px] font-bold tracking-wider uppercase">
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
                                            className="input-base text-xs font-semibold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-text-muted ml-1 text-[10px] font-bold tracking-wider uppercase">
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
                                            className="input-base text-xs font-semibold"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="bg-accent hover:bg-accent/90 mt-4 h-11 w-full rounded-lg font-bold text-white shadow-sm"
                                >
                                    <Save className="mr-2 h-4 w-4" /> Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
