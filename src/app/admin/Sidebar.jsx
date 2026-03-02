import Link from 'next/link'
import { LayoutDashboard, BookOpen, Trophy, Users, ShieldAlert } from 'lucide-react'

const Sidebar = () => {
    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
        { name: 'Problems', icon: <BookOpen size={20} />, path: '/admin/problems' },
        { name: 'Contests', icon: <Trophy size={20} />, path: '/admin/contests' },
        { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
        { name: 'Security Logs', icon: <ShieldAlert size={20} />, path: '/admin/logs' },
    ]

    return (
        <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
            <div className="border-b border-slate-700 p-6 text-2xl font-bold text-green-400">
                CodeArena <span className="block text-xs text-white">ADMIN PANEL</span>
            </div>
            <nav className="flex-1 space-y-2 p-4">
                {menuItems.map((item) => (
                    <Link key={item.name} href={item.path}>
                        <div className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-800">
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </div>
                    </Link>
                ))}
            </nav>
            <div className="border-t border-slate-700 p-4 text-xs text-slate-400">
                v1.0.4 | Industry Standard Build
            </div>
        </div>
    )
}

export default Sidebar
