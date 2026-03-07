'use client'

import { useState } from 'react'
import Sidebar from '@/components/admin/Sidebar'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Menu } from 'lucide-react' // মেনু আইকন
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet' // Shadcn Sheet

export default function AdminLayout({ children }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="bg-muted/40 flex h-screen overflow-hidden">
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <div className="hidden h-full lg:block">
                <Sidebar />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Responsive Header */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-background sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 shadow-sm md:px-8"
                >
                    <div className="flex items-center gap-3">
                        {/* Mobile Sidebar Trigger (Only visible on Mobile) */}
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

                        <div className="flex items-center gap-2">
                            <div className="hidden h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 sm:block"></div>
                            <h1 className="truncate text-sm font-semibold tracking-tight md:text-lg">
                                CodeArena Center
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="hidden text-right sm:block">
                            <p className="text-xs leading-none font-semibold md:text-sm">
                                Admin Leader
                            </p>
                            <Badge className="mt-1 bg-emerald-500 text-[10px] md:text-xs">
                                Root Access
                            </Badge>
                        </div>

                        <Avatar className="h-8 w-8 shadow-sm md:h-10 md:w-10">
                            <AvatarImage src="/avatar.png" />
                            <AvatarFallback>AT</AvatarFallback>
                        </Avatar>
                    </div>
                </motion.header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    )
}
