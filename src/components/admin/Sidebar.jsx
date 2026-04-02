'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' // useRouter ইমপোর্ট করুন
import { useAuth } from '@/context/AuthContext'
import { LayoutDashboard, User, Settings, Trophy, Code2, Users, LogOut } from 'lucide-react'

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter() // router ইনভোক করুন
    const { logout, user } = useAuth()

    // লগআউট হ্যান্ডলার ফাংশন
    const handleLogout = async () => {
        try {
            await logout() // লগআউট কল করুন
            router.push('/') // হোম পেজে পাঠিয়ে দিন
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const mainMenuItems = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
            icon: <LayoutDashboard size={20} />,
        },
        {
            title: 'Manage Contests',
            href: '/admin/contests',
            icon: <Trophy size={20} />,
        },
        {
            title: 'Problems',
            href: '/admin/problems',
            icon: <Code2 size={20} />,
        },
        {
            title: 'Users List',
            href: '/admin/users',
            icon: <Users size={20} />,
        },
    ]

    const accountItems = [
        {
            title: 'My Profile',
            href: '/admin/profile',
            icon: <User size={20} />,
        },
        {
            title: 'Settings',
            href: '/admin/settings',
            icon: <Settings size={20} />,
        },
    ]

    return (
        <aside className="border-border bg-bg-page sticky top-0 flex min-h-screen w-64 flex-col border-r">
            {/* Brand Logo */}
            <div className="p-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <div className="bg-accent shadow-accent/20 flex h-9 w-9 items-center justify-center rounded-xl shadow-lg">
                        <Code2 className="text-white" size={22} />
                    </div>
                    <span className="text-text-primary text-xl font-black tracking-tighter uppercase italic">
                        Code<span className="text-accent">Arena</span>
                    </span>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 space-y-6 px-4">
                <div>
                    <p className="text-text-muted mb-2 px-4 text-[10px] font-bold tracking-widest uppercase">
                        Menu
                    </p>
                    <div className="space-y-1">
                        {mainMenuItems.map((item) => (
                            <SidebarLink
                                key={item.href}
                                item={item}
                                active={pathname === item.href}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-text-muted mb-2 px-4 text-[10px] font-bold tracking-widest uppercase">
                        Account
                    </p>
                    <div className="space-y-1">
                        {accountItems.map((item) => (
                            <SidebarLink
                                key={item.href}
                                item={item}
                                active={pathname === item.href}
                            />
                        ))}
                    </div>
                </div>
            </nav>

            {/* Footer Actions: Logout & User Profile */}
            <div className="border-border bg-bg-page/50 space-y-2 border-t p-4">
                <button
                    onClick={handleLogout} // আপডেট করা হ্যান্ডলার কল করুন
                    className="group text-error hover:bg-error-light flex w-full items-center gap-3 rounded-xl px-4 py-3 font-bold transition-all duration-200"
                >
                    <LogOut size={20} className="transition-transform group-hover:translate-x-1" />
                    <span className="text-sm">Logout</span>
                </button>

                <div className="border-border bg-bg-subtle flex items-center gap-3 rounded-2xl border p-3 shadow-sm">
                    <div className="bg-accent/10 border-accent/20 text-accent flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-text-primary truncate text-xs font-bold">
                            {user?.name || 'Admin'}
                        </p>
                        <p className="text-text-muted truncate text-[10px]">
                            {user?.email || 'admin@codearena.com'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    )
}

function SidebarLink({ item, active }) {
    return (
        <Link
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-bold transition-all duration-200 ${
                active
                    ? 'bg-accent shadow-accent-glow scale-[1.02] text-white shadow-md'
                    : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary'
            }`}
        >
            {item.icon}
            <span className="text-sm">{item.title}</span>
        </Link>
    )
}
