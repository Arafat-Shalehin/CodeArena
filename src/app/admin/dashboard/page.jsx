'use client'

import { motion } from 'framer-motion'
import { Users, Trophy, FileText, AlertTriangle, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const containerVariant = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
}

const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

const StatCard = ({ title, value, icon: Icon }) => (
    <motion.div variants={cardVariant}>
        <Card className="rounded-2xl shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4 md:p-6">
                <div className="min-w-0">
                    <p className="text-muted-foreground truncate text-[10px] font-medium tracking-wide uppercase md:text-sm">
                        {title}
                    </p>
                    <h3 className="mt-1 text-xl font-bold md:text-3xl">{value}</h3>
                </div>

                <div className="shrink-0 rounded-xl bg-emerald-500 p-2 md:p-3">
                    <Icon className="h-5 w-5 text-white md:h-6 md:w-6" />
                </div>
            </CardContent>
        </Card>
    </motion.div>
)

export default function AdminDashboard() {
    return (
        <div className="space-y-6 md:space-y-10">
            {/* Heading */}
            <div>
                <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Platform overview and quick actions
                </p>
            </div>

            {/* Stats Grid - Mobile: 1 col, Tablet: 2 col, Desktop: 4 col */}
            <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4"
                variants={containerVariant}
                initial="hidden"
                animate="show"
            >
                <StatCard title="Total Users" value="12,450" icon={Users} />
                <StatCard title="Active Contests" value="3" icon={Trophy} />
                <StatCard title="Total Problems" value="450" icon={FileText} />
                <StatCard title="Security Alerts" value="12" icon={AlertTriangle} />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="rounded-2xl shadow-sm">
                    <CardContent className="p-4 md:p-6">
                        <h2 className="mb-4 text-lg font-semibold md:mb-6 md:text-xl">
                            Quick Actions
                        </h2>

                        <div className="flex flex-col gap-3 sm:flex-row md:gap-4">
                            <Link href="/admin/problems/create" className="w-full sm:w-auto">
                                <Button className="flex w-full items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600">
                                    <Plus className="h-4 w-4" />
                                    Add New Problem
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full sm:w-auto">
                                Create Contest
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
