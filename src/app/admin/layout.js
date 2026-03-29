'use client'

import { useState } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Menu, Home } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Link from 'next/link'

export default function AdminLayout({ children }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="bg-muted/40 flex min-h-screen">
            {/* Desktop Sidebar */}
            <div className="hidden w-64 shrink-0 bg-slate-950 lg:block">
                <div className="sticky top-0 h-screen">
                    <Sidebar />
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Responsive Header - 'border-b' সরিয়ে দেওয়া হয়েছে */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-background sticky top-0 z-40 flex h-16 items-center justify-between px-4 shadow-sm md:px-8"
                >
                    <div className="flex items-center gap-3">
                        {/* Mobile Sidebar Trigger */}
                        <div className="lg:hidden">
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <button className="hover:bg-muted rounded-md p-2">
                                        <Menu className="h-6 w-6" />
                                    </button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-64 bg-slate-950 p-0">
                                    <Sidebar setOpen={setOpen} />
                                </SheetContent>
                            </Sheet>
                        </div>

                        <Link
                            href="/"
                            className="flex items-center gap-2 transition-opacity hover:opacity-80"
                        >
                            <div className="hidden h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 sm:block"></div>
                            <h1 className="truncate text-sm font-semibold tracking-tight md:text-lg">
                                CodeArena Center
                            </h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        <Link href="/">
                            <button className="text-muted-foreground hover:text-primary bg-secondary/50 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors">
                                <Home className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Exit Admin</span>
                            </button>
                        </Link>

                        <div className="hidden text-right sm:block">
                            <p className="text-xs leading-none font-semibold md:text-sm">
                                Admin Leader
                            </p>
                            <Badge className="mt-1 border-none bg-emerald-500 text-[10px] md:text-xs">
                                Root Access
                            </Badge>
                        </div>

                        <Avatar className="h-8 w-8 shadow-sm ring-2 ring-emerald-500/20 md:h-10 md:w-10">
                            <AvatarFallback className="bg-emerald-100 font-bold text-emerald-700">
                                AT
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </motion.header>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    )
}
