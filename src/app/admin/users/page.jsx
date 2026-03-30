'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Users,
    Trash2,
    ShieldCheck,
    Search,
    ChevronLeft,
    ChevronRight,
    UserCheck,
    ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import Swal from 'sweetalert2'

export default function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // ১. ইউজার ডাটা ফেচ করা
    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/users', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            })

            if (res.status === 401) {
                console.error('Unauthorized: সেশন শেষ বা আপনি অ্যাডমিন নন।')
                return
            }

            const data = await res.json()
            if (data.success) {
                setUsers(data.data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    // ২. রোল পরিবর্তন (PATCH)
    const handleToggleRole = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin'
        const result = await Swal.fire({
            title: 'Change Role?',
            text: `${user.name} will be an ${newRole}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Yes, change it!',
        })

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/users/${user._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: newRole }),
                    credentials: 'include',
                })

                if (res.ok) {
                    Swal.fire('Success', 'Role updated successfully', 'success')
                    fetchUsers()
                } else {
                    const errorData = await res.json()
                    Swal.fire('Error', errorData.message || 'Failed to update role', 'error')
                }
            } catch (error) {
                Swal.fire('Error', 'Something went wrong', 'error')
            }
        }
    }

    // ৩. ইউজার ডিলিট (DELETE)
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This user will be deleted permanently!',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        })

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/users/${id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                })

                if (res.ok) {
                    setUsers(users.filter((u) => u._id !== id))
                    Swal.fire('Deleted', 'User removed', 'success')
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete user', 'error')
            }
        }
    }

    // ৪. স্ট্যাটিস্টিকস ক্যালকুলেশন
    const adminCount = users.filter((u) => u.role === 'admin').length
    const normalUserCount = users.filter((u) => u.role === 'user').length

    // ৫. ফিল্টারিং ও পেজিনেশন লজিক
    const filtered = users.filter(
        (u) =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedItems = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    if (isLoading)
        return (
            <div className="space-y-4 p-10">
                <Skeleton className="h-32 w-full rounded-3xl" />
                <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
        )

    return (
        <div className="bg-bg-page min-h-screen p-6 md:p-10">
            {/* হেডার */}
            <div className="mb-10">
                <h1 className="text-text-primary flex items-center gap-3 text-3xl font-black tracking-tight uppercase">
                    <Users className="text-accent size-8" /> User Management
                </h1>
                <p className="text-text-muted mt-1 text-sm font-bold">
                    Manage permissions and account status
                </p>
            </div>

            {/* স্ট্যাটাস কার্ডস */}
            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="border-border rounded-3xl border bg-white p-6 shadow-sm">
                    <p className="text-text-muted mb-2 text-[10px] font-black tracking-widest uppercase">
                        Total Accounts
                    </p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-text-primary text-4xl leading-none font-black">
                            {users.length}
                        </h2>
                        <Users className="size-8 text-gray-100" />
                    </div>
                </div>

                <div className="border-border rounded-3xl border border-l-4 border-l-red-500 bg-white p-6 shadow-sm">
                    <p className="text-text-muted mb-2 text-[10px] font-black tracking-widest uppercase">
                        Admins
                    </p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-4xl leading-none font-black text-red-600">
                            {adminCount}
                        </h2>
                        <ShieldAlert className="size-8 text-red-100" />
                    </div>
                </div>

                <div className="border-border rounded-3xl border border-l-4 border-l-blue-500 bg-white p-6 shadow-sm">
                    <p className="text-text-muted mb-2 text-[10px] font-black tracking-widest uppercase">
                        Regular Users
                    </p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-4xl leading-none font-black text-blue-600">
                            {normalUserCount}
                        </h2>
                        <UserCheck className="size-8 text-blue-100" />
                    </div>
                </div>
            </div>

            {/* সার্চ বার */}
            <div className="border-border mb-8 flex max-w-md items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm">
                <Search className="text-text-muted ml-2 size-5" />
                <Input
                    placeholder="Search by name or email..."
                    className="border-none bg-transparent font-bold shadow-none focus-visible:ring-0"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setCurrentPage(1)
                    }}
                />
            </div>

            {/* টেবিল */}
            <div className="border-border overflow-hidden rounded-3xl border bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-bg-page/50 border-border text-text-muted border-b text-[10px] font-black tracking-widest uppercase">
                            <tr>
                                <th className="px-6 py-5">User Details</th>
                                <th className="px-6 py-5">Access Role</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                            {paginatedItems.length > 0 ? (
                                paginatedItems.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-accent/[0.01] group transition-colors"
                                    >
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-accent/10 text-accent flex size-10 items-center justify-center rounded-full font-black">
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className="text-text-primary leading-tight font-black">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-text-muted text-xs font-medium">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span
                                                className={`inline-flex items-center rounded-lg border px-3 py-1 text-[10px] font-black tracking-widest uppercase ${
                                                    user.role === 'admin'
                                                        ? 'border-red-100 bg-red-50 text-red-600'
                                                        : 'border-blue-100 bg-blue-50 text-blue-600'
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Toggle Role"
                                                    onClick={() => handleToggleRole(user)}
                                                    className="hover:text-accent rounded-full transition-colors"
                                                >
                                                    <ShieldCheck size={20} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Delete User"
                                                    onClick={() => handleDelete(user._id)}
                                                    className="rounded-full transition-colors hover:text-red-600"
                                                >
                                                    <Trash2 size={20} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="text-text-muted px-6 py-10 text-center font-bold"
                                    >
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* পেজিনেশন */}
                <div className="border-border bg-bg-page/30 flex items-center justify-between border-t p-6">
                    <p className="text-text-muted text-[10px] font-black tracking-wider uppercase">
                        Page {currentPage} of {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl px-4 font-bold"
                        >
                            <ChevronLeft size={16} className="mr-1" /> Prev
                        </Button>
                        <Button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl px-4 font-bold"
                        >
                            Next <ChevronRight size={16} className="ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
