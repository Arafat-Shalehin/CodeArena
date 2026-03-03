// app/admin/layout.js
'use client'

import Sidebar from '@/components/admin/Sidebar'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function AdminLayout({ children }) {
    return (
        <div className="bg-muted/40 flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            <div className="flex flex-1 flex-col">
                {/* Header */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-background sticky top-0 z-40 flex h-16 items-center justify-between px-8 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"></div>
                        <h1 className="text-lg font-semibold tracking-tight">
                            CodeArena Control Center
                        </h1>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="text-right">
                            <p className="text-sm font-semibold">Admin Team Leader</p>
                            <Badge className="mt-1 bg-emerald-500 hover:bg-emerald-600">
                                Root Access
                            </Badge>
                        </div>

                        <Avatar className="h-10 w-10 shadow-sm">
                            <AvatarImage src="/avatar.png" />
                            <AvatarFallback>AT</AvatarFallback>
                        </Avatar>
                    </div>
                </motion.header>

                {/* Main */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    )
}
