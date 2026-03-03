// app/admin/dashboard/page.jsx
'use client'

import { motion } from 'framer-motion'
import { Users, Trophy, FileText, AlertTriangle, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const containerVariant = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

const StatCard = ({ title, value, icon: Icon }) => (
    <motion.div variants={cardVariant}>
        <Card className="rounded-2xl shadow-sm transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
                <div>
                    <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                        {title}
                    </p>
                    <h3 className="mt-2 text-3xl font-bold">{value}</h3>
                </div>

                <div className="rounded-xl bg-emerald-500 p-3">
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </CardContent>
        </Card>
    </motion.div>
)

export default function AdminDashboard() {
    return (
        <div className="space-y-10">
            {/* Heading */}
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Platform overview and quick actions</p>
            </div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
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
                    <CardContent className="p-6">
                        <h2 className="mb-6 text-xl font-semibold">Quick Actions</h2>

                        <div className="flex flex-wrap gap-4">
                            <Button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600">
                                <Plus className="h-4 w-4" />
                                Add New Problem
                            </Button>

                            <Button variant="outline">Create Contest</Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
