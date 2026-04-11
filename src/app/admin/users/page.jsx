'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
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
    Users,
    Search,
    Trash2,
    ShieldAlert,
    UserCheck,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import Swal from 'sweetalert2'

const getDisplayUsername = (user) => {
    const username = String(user?.username || '').trim()
    if (username) return username

    const name = String(user?.name || '').trim()
    if (name) return name

    return String(user?.email || '').split('@')[0] || 'unknown'
}

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 12

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

    const handleToggleRole = async (user) => {
        if (user._id === currentUser?._id || user._id === currentUser?.id) {
            return Swal.fire('Not allowed', 'You cannot change your own role.', 'warning')
        }
        const newRole = user.role === 'admin' ? 'user' : 'admin'
        const result = await Swal.fire({
            title: 'Change Role?',
            text: `${getDisplayUsername(user)} will be an ${newRole}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--ca-accent)',
            confirmButtonText: 'Yes, change it!',
            background: 'var(--ca-bg-page)',
            color: 'var(--ca-text-primary)',
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

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This user will be deleted permanently!',
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#ef4444',
            background: 'var(--ca-bg-page)',
            color: 'var(--ca-text-primary)',
        })

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/users/${id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                })

                if (res.ok) {
                    setUsers(users.filter((u) => u._id !== id))
                    setCurrentPage(1)
                    Swal.fire('Deleted', 'User removed', 'success')
                }
            } catch (error) {
                Swal.fire('Error', 'Failed to delete user', 'error')
            }
        }
    }

    const adminCount = users.filter((u) => u.role === 'admin').length
    const normalUserCount = users.filter((u) => u.role === 'user').length

    const filtered = users.filter(
        (u) =>
            getDisplayUsername(u).toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(u.name || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginatedItems = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    if (isLoading)
        return (
            <div className="space-y-6 pt-10">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-28 w-full rounded-2xl" />
                    <Skeleton className="h-28 w-full rounded-2xl" />
                    <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-125 w-full rounded-2xl" />
            </div>
        )

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-text-primary flex items-center gap-3 text-3xl font-semibold tracking-tight">
                    <Users className="text-accent size-8" /> User{' '}
                    <span className="text-accent">Management</span>
                </h1>
                <p className="text-text-muted mt-1 text-sm font-medium opacity-75">
                    Manage permissions and account status
                </p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="matte-surface border-border bg-bg-subtle/50 group hover:border-accent/30 relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--ca-border-rgb),0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--ca-border-rgb),0.1)_1px,transparent_1px)] bg-size-[16px_16px] opacity-10" />
                    <p className="text-text-muted relative z-10 mb-2 text-xs font-medium tracking-wide uppercase opacity-75">
                        Total Accounts
                    </p>
                    <div className="relative z-10 flex items-center justify-between">
                        <h2 className="text-text-primary text-3xl leading-none font-semibold">
                            {users.length}
                        </h2>
                        <div className="bg-accent/10 text-accent flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="matte-surface border-border border-l-destructive bg-bg-subtle/50 group hover:border-accent/30 relative overflow-hidden rounded-2xl border border-l-4 p-6 shadow-sm transition-all">
                    <p className="text-text-muted relative z-10 mb-2 text-xs font-medium tracking-wide uppercase opacity-75">
                        Admins (Root)
                    </p>
                    <div className="relative z-10 flex items-center justify-between">
                        <h2 className="text-error text-3xl leading-none font-semibold">
                            {adminCount}
                        </h2>
                        <div className="bg-error/10 text-error flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                            <ShieldAlert size={24} />
                        </div>
                    </div>
                </div>

                <div className="matte-surface border-border border-l-primary bg-bg-subtle/50 group hover:border-accent/30 relative overflow-hidden rounded-2xl border border-l-4 p-6 shadow-sm transition-all">
                    <p className="text-text-muted relative z-10 mb-2 text-xs font-medium tracking-wide uppercase opacity-75">
                        Active Users
                    </p>
                    <div className="relative z-10 flex items-center justify-between">
                        <h2 className="text-accent text-3xl leading-none font-semibold">
                            {normalUserCount}
                        </h2>
                        <div className="bg-accent/10 text-accent flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 group-hover:rotate-6">
                            <UserCheck size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="matte-surface border-border bg-bg-subtle/50 focus-within:border-accent/50 focus-within:ring-accent/20 flex w-full max-w-md items-center gap-3 rounded-xl border px-3 py-1 shadow-sm transition-all focus-within:ring-1">
                    <Search className="text-text-muted size-4" />
                    <Input
                        placeholder="Search users..."
                        className="border-none bg-transparent text-sm font-medium shadow-none focus-visible:ring-0"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>
                <div className="flex gap-2">{/* Add any other global actions here */}</div>
            </div>

            {/* Main Table */}
            <div className="matte-surface border-border bg-bg-subtle/50 hover:border-accent/20 overflow-hidden rounded-2xl border shadow-sm transition-all">
                <Table className="dense">
                    <TableHeader className="bg-bg-muted/30">
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-text-muted h-12 px-6 text-xs font-semibold tracking-wide uppercase">
                                User Details
                            </TableHead>
                            <TableHead className="text-text-muted h-12 px-6 text-xs font-semibold tracking-wide uppercase">
                                Access Level
                            </TableHead>
                            <TableHead className="text-text-muted h-12 px-6 text-right text-xs font-semibold tracking-wide uppercase">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedItems.length > 0 ? (
                            paginatedItems.map((user) => {
                                const displayName = getDisplayUsername(user)

                                return (
                                    <TableRow
                                        key={user._id}
                                        className="border-border hover:bg-accent/2 group transition-colors"
                                    >
                                        <TableCell className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-accent/10 text-accent border-accent/20 flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-transform group-hover:scale-110">
                                                    {displayName[0] || 'U'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-text-primary group-hover:text-accent truncate text-sm leading-tight font-semibold transition-colors">
                                                        {displayName}
                                                    </p>
                                                    <p className="text-text-muted truncate text-xs font-medium">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-3">
                                            <Badge
                                                className={`rounded-lg px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                                                    user.role === 'admin'
                                                        ? 'bg-error/10 text-error border-error/20'
                                                        : 'bg-accent/10 text-accent border-accent/20'
                                                }`}
                                                variant="outline"
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-1.5">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleRole(user)}
                                                    className="text-text-muted hover:text-accent hover:bg-accent/10 size-8 rounded-lg transition-all active:scale-90"
                                                    title="Toggle Role"
                                                >
                                                    <ShieldCheck size={18} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(user._id)}
                                                    className="text-text-muted hover:text-error hover:bg-error/10 size-8 rounded-lg transition-all active:scale-90"
                                                    title="Delete User"
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
                                    colSpan={3}
                                    className="text-text-muted h-32 text-center text-sm font-medium"
                                >
                                    No records match your criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="bg-bg-muted/10 border-border flex items-center justify-between border-t p-4 px-6 md:p-6">
                    <p className="text-text-muted text-xs font-medium tracking-wide opacity-75">
                        Page {currentPage} <span className="mx-1 opacity-40">/</span>{' '}
                        {totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            variant="outline"
                            size="sm"
                            className="border-border hover:bg-accent rounded-xl px-4 py-0 text-xs font-medium transition-all duration-300 hover:text-white active:scale-95 disabled:opacity-50"
                        >
                            <ChevronLeft size={14} className="mr-1" /> Prev
                        </Button>
                        <Button
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            variant="outline"
                            size="sm"
                            className="border-border hover:bg-accent rounded-xl px-4 py-0 text-xs font-medium transition-all duration-300 hover:text-white active:scale-95 disabled:opacity-50"
                        >
                            Next <ChevronRight size={14} className="ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
