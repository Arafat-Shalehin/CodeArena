'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, BookOpen, Trophy, Users, ShieldAlert, ChevronRight } from 'lucide-react'

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Problems', icon: BookOpen, path: '/admin/problems' },
    { name: 'Contests', icon: Trophy, path: '/admin/contests' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Security Logs', icon: ShieldAlert, path: '/admin/logs' },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Header / Logo Section */}
            <div className="p-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                        <span className="text-xl font-bold text-white">C</span>
                    </div>
                    <div>
                        <h2 className="text-lg leading-none font-bold tracking-tight text-slate-800 dark:text-white">
                            CodeArena
                        </h2>
                        <p className="mt-1 text-[10px] font-bold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
                            Admin Panel
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 space-y-1 p-4">
                {menuItems.map((item) => {
                    // ড্যাশবোর্ড বা প্রবলেমসের সাব-পেজে থাকলেও যেন মেনু একটিভ দেখায়
                    const isActive = pathname.startsWith(item.path)
                    const Icon = item.icon

                    return (
                        <Link key={item.name} href={item.path} className="block">
                            <motion.div
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={`group flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    isActive
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none'
                                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon
                                        className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-500'}`}
                                    />
                                    {item.name}
                                </div>
                                {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer Section */}
            <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 uppercase">
                        <span>Status</span>
                        <span className="flex items-center gap-1 text-emerald-500">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                            Live
                        </span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">Build v1.0.4 • Standard</p>
                </div>
            </div>
        </aside>
    )
}
