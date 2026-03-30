'use client'

import { useState } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Menu, Bell } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuth } from '@/context/AuthContext'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLayout({ children }) {
    const [open, setOpen] = useState(false)
    const { user } = useAuth()

    return (
        <div className="flex min-h-screen w-full bg-bg-page text-text-primary font-sans">
            {/* Sidebar: Fixed on Desktop */}
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-bg-surface/50 backdrop-blur-xl lg:block">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Navbar */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg-page/80 px-4 backdrop-blur-xl md:px-8">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <div className="lg:hidden">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <button className="flex size-10 items-center justify-center rounded-lg bg-bg-subtle hover:bg-border transition-colors">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72 bg-slate-950 p-0">
                                    <Sidebar setOpen={setOpen} />
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Logo with Link to Home */}
                        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                            <div className="size-8 transition-transform group-hover:scale-110">
                                <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                            </div>
                            <div className="hidden sm:flex flex-col">
                                <span className="text-sm font-black uppercase italic text-accent leading-none">Admin Center</span>
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">CodeArena v2.0</span>
                            </div>
                        </Link>
                    </div>

                    {/* Right Navbar Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button className="relative flex size-9 items-center justify-center rounded-xl bg-bg-subtle hover:bg-border transition-all">
                            <Bell size={18} className="text-text-secondary" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent border-2 border-bg-page"></span>
                        </button>

                        <div className="flex items-center gap-3 border-l border-border pl-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-xs font-black uppercase italic text-text-primary">{user?.name || "Administrator"}</p>
                                <Badge variant="outline" className="border-accent/30 text-[9px] uppercase italic text-accent">Root Access</Badge>
                            </div>
                            <Avatar className="size-9 border-2 border-accent/20">
                                <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.avatarSeed || 'admin'}`} />
                                <AvatarFallback className="bg-accent/10 text-accent font-black">AD</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 w-full p-4 md:p-8">
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