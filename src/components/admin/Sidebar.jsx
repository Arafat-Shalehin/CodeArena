'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' // useRouter ইমপোর্ট করুন
import { useAuth } from '@/context/AuthContext'
import {
    LayoutDashboard,
    User,
    Settings,
    Trophy,
    Code2,
    Users,
    Activity,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

export default function AdminSidebar({ isCollapsed, setIsCollapsed, onMobileItemClick }) {
    const pathname = usePathname()
    const router = useRouter()
    const { logout, user } = useAuth()

    const handleLogout = async () => {
        try {
            await logout()
            router.push('/')
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
        {
            title: 'Ops Panel',
            href: '/admin/ops',
            icon: <Activity size={20} />,
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
        <aside
            className={`matte-surface border-border bg-bg-page/90 relative flex h-full flex-col border-r backdrop-blur-xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Subtle Grid Pattern Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--ca-border-rgb),0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--ca-border-rgb),0.1)_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.03]" />

            {/* Collapse Toggle Button (Desktop Only) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="bg-bg-page border-border text-text-muted hover:text-accent absolute top-20 -right-3 z-50 hidden size-6 items-center justify-center rounded-full border shadow-sm transition-all hover:scale-110 lg:flex"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Brand Logo */}
            <div
                className={`relative z-10 p-6 transition-all ${isCollapsed ? 'items-center px-4' : ''}`}
            >
                <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <div className="bg-accent shadow-accent/20 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl shadow-lg transition-transform duration-300 hover:rotate-6">
                        <Code2 className="text-white" size={22} />
                    </div>
                    {!isCollapsed && (
                        <span className="text-text-primary text-xl font-black tracking-tighter uppercase italic">
                            Code<span className="text-accent">Arena</span>
                        </span>
                    )}
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="scrollbar-none relative z-10 flex-1 space-y-8 overflow-y-auto px-3 py-4">
                <div>
                    {!isCollapsed && (
                        <p className="text-text-muted mb-3 px-4 text-[9px] font-black tracking-widest uppercase opacity-60">
                            Core Strategy
                        </p>
                    )}
                    <div className="space-y-1.5">
                        {mainMenuItems.map((item) => (
                            <SidebarLink
                                key={item.href}
                                item={item}
                                active={pathname === item.href}
                                isCollapsed={isCollapsed}
                                onClick={onMobileItemClick}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    {!isCollapsed && (
                        <p className="text-text-muted mb-3 px-4 text-[9px] font-black tracking-widest uppercase opacity-60">
                            Management
                        </p>
                    )}
                    <div className="space-y-1.5">
                        {accountItems.map((item) => (
                            <SidebarLink
                                key={item.href}
                                item={item}
                                active={pathname === item.href}
                                isCollapsed={isCollapsed}
                                onClick={onMobileItemClick}
                            />
                        ))}
                    </div>
                </div>
            </nav>

            {/* Footer Actions: Logout & User Profile */}
            <div
                className={`border-border bg-bg-page/40 relative z-10 space-y-3 border-t p-4 backdrop-blur-md ${isCollapsed ? 'items-center' : ''}`}
            >
                <button
                    onClick={handleLogout}
                    className={`group text-error hover:bg-error/10 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 font-black transition-all duration-200 active:scale-95 ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                    <LogOut
                        size={18}
                        className={`transition-transform ${!isCollapsed ? 'group-hover:translate-x-1' : ''}`}
                    />
                    {!isCollapsed && (
                        <span className="text-[10px] tracking-widest uppercase">Sign Out</span>
                    )}
                </button>

                {!isCollapsed ? (
                    <div className="matte-surface border-border bg-bg-subtle/50 group hover:border-accent/30 hover:bg-bg-subtle flex items-center gap-3 overflow-hidden rounded-2xl border p-2.5 shadow-sm transition-all">
                        <div className="bg-accent/10 border-accent/20 text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-[10px] font-black shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-6">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                            <p className="text-text-primary truncate text-[11px] font-black tracking-tight uppercase italic">
                                {user?.name || 'Admin'}
                            </p>
                            <p className="text-text-muted truncate text-[8px] font-bold opacity-60">
                                {user?.email || 'admin@codearena.com'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-accent/10 border-accent/20 text-accent flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-black transition-all hover:scale-110 hover:rotate-6">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                )}
            </div>
        </aside>
    )
}

function SidebarLink({ item, active, isCollapsed, onClick }) {
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-2.5 transition-all duration-300 active:scale-95 ${
                active
                    ? 'bg-accent/10 text-accent shadow-sm'
                    : 'text-text-muted hover:bg-bg-muted/50 hover:text-text-primary'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
        >
            {/* Active Indicator Ring */}
            {active && (
                <div className="bg-accent absolute top-0 left-0 h-full w-1 shadow-[0_0_15px_rgba(var(--ca-accent-rgb),0.5)]" />
            )}

            <div
                className={`relative z-10 shrink-0 transition-transform duration-300 ${active ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'}`}
            >
                {React.cloneElement(item.icon, { size: 18, strokeWidth: active ? 2.5 : 2 })}
            </div>

            {!isCollapsed && (
                <span
                    className={`relative z-10 text-[11px] font-black tracking-widest uppercase transition-colors ${active ? 'text-accent' : ''}`}
                >
                    {item.title}
                </span>
            )}

            {isCollapsed && (
                <div className="bg-bg-page border-border text-text-primary pointer-events-none absolute left-14 z-50 rounded-lg border px-3 py-1.5 text-[9px] font-black tracking-widest whitespace-nowrap uppercase opacity-0 shadow-2xl backdrop-blur-md transition-all group-hover:left-16 group-hover:opacity-100">
                    {item.title}
                </div>
            )}

            {/* Hover Glow Effect */}
            <div className="bg-accent/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
    )
}
