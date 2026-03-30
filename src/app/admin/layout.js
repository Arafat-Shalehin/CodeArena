'use client'

import { useState } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Menu, Bell, Search, LayoutDashboard } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLayout({ children }) {
    const [open, setOpen] = useState(false)
    const { user } = useAuth() // Auth context থেকে ইউজার ডাটা নেওয়া [cite: 260, 289]

    return (
        <div className="bg-bg-page text-text-primary flex h-screen overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside className="hidden h-full border-r border-border bg-bg-surface/50 backdrop-blur-xl lg:block w-64">
                <Sidebar />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Global Admin Header */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg-page/80 px-4 backdrop-blur-xl md:px-8">
                    
                    {/* Left Section: Branding & Mobile Trigger */}
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <button className="flex size-10 items-center justify-center rounded-lg bg-bg-subtle hover:bg-border transition-colors">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72 border-r border-border bg-slate-950 p-0">
                                    <Sidebar setOpen={setOpen} />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <Link href="/admin" className="flex items-center gap-2 group">
                            <div className="size-8 transition-transform group-hover:scale-110">
                                <Image src="/logo.svg" alt="Logo" width={32} height={32} priority />
                            </div>
                            <div className="hidden flex-col sm:flex">
                                <span className="text-sm font-black uppercase italic tracking-tighter leading-none text-accent">
                                    Admin Center
                                </span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                                    CodeArena v2.0
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Right Section: Tools & Profile */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Status Indicator */}
                        <div className="hidden items-center gap-2 rounded-full border border-border bg-bg-subtle px-3 py-1.5 lg:flex">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Online</span>
                        </div>

                        <div className="h-8 w-px bg-border mx-2 hidden md:block"></div>

                        <div className="flex items-center gap-1 md:gap-3">
                            <ThemeToggle />
                            <button className="relative flex size-9 items-center justify-center rounded-xl bg-bg-subtle hover:bg-border transition-all">
                                <Bell size={18} className="text-text-secondary" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent border-2 border-bg-page"></span>
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-2 border-l border-border ml-2">
                            <div className="hidden flex-col items-end sm:flex">
                                <p className="text-xs font-black italic text-text-primary uppercase leading-none">
                                    {user?.name || "Administrator"}
                                </p>
                                <Badge variant="outline" className="mt-1 h-5 border-accent/30 bg-accent/5 text-[9px] font-black uppercase tracking-tighter text-accent italic">
                                    Root Access
                                </Badge>
                            </div>
                            
                            <Avatar className="size-9 border-2 border-accent/20 ring-4 ring-accent/5 transition-all hover:scale-105">
                                <AvatarImage 
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.avatarSeed || user?.name || 'admin'}`} 
                                    alt="Admin"
                                />
                                <AvatarFallback className="bg-accent/10 text-accent font-black text-xs">
                                    {(user?.name || 'AD').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-bg-subtle/20 via-bg-page to-bg-page p-4 md:p-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto max-w-7xl"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    )
}