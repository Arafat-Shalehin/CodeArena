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
        <div className="bg-bg-page text-text-primary flex min-h-screen w-full font-sans">
            {/* Sidebar: Fixed on Desktop */}
            <aside className="border-border bg-bg-surface/50 sticky top-0 hidden h-screen w-64 shrink-0 border-r backdrop-blur-xl lg:block">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Navbar */}
                <header className="border-border bg-bg-page/80 sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl md:px-8">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <div className="lg:hidden">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <button className="bg-bg-subtle hover:bg-border flex size-10 items-center justify-center rounded-lg transition-colors">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-72 bg-slate-950 p-0">
                                    <Sidebar setOpen={setOpen} />
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Logo with Link to Home */}
                        <Link href="/" className="group flex cursor-pointer items-center gap-2">
                            <div className="size-8 transition-transform group-hover:scale-110">
                                <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                            </div>
                            <div className="hidden flex-col sm:flex">
                                <span className="text-accent text-sm leading-none font-black uppercase italic">
                                    Admin Center
                                </span>
                                <span className="text-text-muted text-[10px] font-bold tracking-widest uppercase">
                                    CodeArena v2.0
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Right Navbar Actions */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button className="bg-bg-subtle hover:bg-border relative flex size-9 items-center justify-center rounded-xl transition-all">
                            <Bell size={18} className="text-text-secondary" />
                            <span className="bg-accent border-bg-page absolute top-2 right-2 h-2 w-2 rounded-full border-2"></span>
                        </button>

                        <div className="border-border flex items-center gap-3 border-l pl-3">
                            <div className="hidden text-right sm:block">
                                <p className="text-text-primary text-xs font-black uppercase italic">
                                    {user?.name || 'Administrator'}
                                </p>
                                <Badge
                                    variant="outline"
                                    className="border-accent/30 text-accent text-[9px] uppercase italic"
                                >
                                    Root Access
                                </Badge>
                            </div>
                            <Avatar className="border-accent/20 size-9 border-2">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.avatarSeed || 'admin'}`}
                                />
                                <AvatarFallback className="bg-accent/10 text-accent font-black">
                                    AD
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="w-full flex-1 p-4 md:p-8">
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
