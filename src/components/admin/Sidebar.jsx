'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext' // আপনার Auth Context ইমপোর্ট করুন
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  Trophy, 
  Code2, 
  Users, 
  LogOut 
} from 'lucide-react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth() // AuthContext থেকে ডাটা নিন

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
      href: '/admin/profile', // আপনার প্রি-বিল্ড প্রোফাইল পাথ
      icon: <User size={20} />,
    },
    {
      title: 'Settings',
      href: '/admin/settings', // আপনার প্রি-বিল্ড সেটিংস পাথ
      icon: <Settings size={20} />,
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen flex flex-col sticky top-0">
      {/* Brand Logo */}
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Code2 className="text-white" size={22} />
          </div>
          <span className="text-xl font-black uppercase italic tracking-tighter text-text-primary">
            Code<span className="text-accent">Arena</span>
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-6">
        <div>
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Menu</p>
          <div className="space-y-1">
            {mainMenuItems.map((item) => (
              <SidebarLink key={item.href} item={item} active={pathname === item.href} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">Account</p>
          <div className="space-y-1">
            {accountItems.map((item) => (
              <SidebarLink key={item.href} item={item} active={pathname === item.href} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer Actions: Logout & User Profile */}
      <div className="p-4 space-y-2 border-t border-border bg-bg-page/50">
        <button
          onClick={logout} // Logout Function Call
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all duration-200 group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="text-sm">Logout</span>
        </button>

        <div className="bg-white border border-border rounded-2xl p-3 flex items-center gap-3 shadow-sm">
          <div className="h-9 w-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-text-primary truncate">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-text-muted truncate">{user?.email || 'admin@codearena.com'}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// Reusable Nav Link Component
function SidebarLink({ item, active }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 ${
        active 
          ? 'bg-accent text-white shadow-md shadow-accent/25 scale-[1.02]' 
          : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary'
      }`}
    >
      {item.icon}
      <span className="text-sm">{item.title}</span>
    </Link>
  )
}