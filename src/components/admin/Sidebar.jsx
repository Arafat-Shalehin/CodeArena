// components/admin/Sidebar.jsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, BookOpen, Trophy, Users, ShieldAlert } from 'lucide-react'

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
        <aside className="bg-background flex h-full w-64 flex-col shadow-md">
            {/* Logo */}
            <div className="p-6 shadow-sm">
                <h2 className="text-xl font-bold tracking-tight">CodeArena</h2>
                <p className="text-muted-foreground mt-1 text-xs">ADMIN PANEL</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path
                    const Icon = item.icon

                    return (
                        <Link key={item.name} href={item.path}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                                    isActive
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:shadow-sm'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.name}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="text-muted-foreground p-4 text-xs shadow-inner">
                v1.0.4 • Industry Standard Build
            </div>
        </aside>
    )
}
