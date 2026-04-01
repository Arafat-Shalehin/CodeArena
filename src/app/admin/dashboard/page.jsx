'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users,
    Trophy,
    FileText,
    AlertTriangle,
    Plus,
    Loader2,
    TrendingUp,
    Activity,
    Target,
    Brain,
    CheckCircle2,
    Clock,
    Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import axios from 'axios'
import { io } from 'socket.io-client'

export default function AdminDashboard() {
    const [platformData, setPlatformData] = useState(null)
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, leaderRes] = await Promise.all([
                    axios.get('/api/stats/platform'),
                    axios.get('/api/interview/leaderboard'),
                ])

                if (statsRes.data.success) setPlatformData(statsRes.data.data)
                if (leaderRes.data.success) setLeaderboard(leaderRes.data.data.slice(0, 5))
            } catch (error) {
                console.error('Dashboard error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        const socket = io('http://localhost:3002')
        return () => socket.disconnect()
    }, [])

    if (loading)
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="text-accent animate-spin" size={48} />
            </div>
        )

    return (
        <div className="animate-in fade-in space-y-8 p-4 duration-700 md:p-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-text-primary text-4xl font-black tracking-tighter uppercase italic">
                        System Analytics
                    </h1>
                    <p className="text-text-muted text-sm font-bold">
                        Real-time performance & interview metrics
                    </p>
                </div>
                <Button className="bg-accent hover:bg-accent/90 rounded-xl px-6 font-black text-white italic">
                    <Plus className="mr-2 h-5 w-5" /> NEW PROBLEM
                </Button>
            </div>

            {/* Row 1: Original 4 Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Participants"
                    value={platformData?.totalParticipants}
                    trend={platformData?.participantsTrend}
                    isUp={platformData?.participantsTrendUp}
                    icon={Users}
                />
                <StatCard
                    title="Submissions Today"
                    value={platformData?.submissionsToday}
                    trend={platformData?.submissionsTrend}
                    isUp={platformData?.submissionsTrendUp}
                    icon={Activity}
                />
                <StatCard
                    title="Avg Solve Rate"
                    value={`${platformData?.avgSolveRate}%`}
                    trend={platformData?.solveRateTrend}
                    isUp={platformData?.solveRateTrendUp}
                    icon={Target}
                />
                <StatCard
                    title="Active Contests"
                    value={platformData?.activeContests}
                    trend={platformData?.contestsTrend}
                    isUp={platformData?.contestsTrendUp}
                    icon={Trophy}
                />
            </div>

            {/* Row 2: New 4 Interview Specific Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="AI Interview Sessions"
                    value={platformData?.totalSessions || 0}
                    trend={platformData?.sessionsTrend || 12}
                    isUp={true}
                    icon={Brain}
                />
                <StatCard
                    title="Avg AI Score"
                    value={`${platformData?.avgScore || 0}%`}
                    trend={platformData?.scoreTrend || 5}
                    isUp={true}
                    icon={Zap}
                />
                <StatCard
                    title="Success Rate"
                    value={`${platformData?.completionRate || 0}%`}
                    trend={platformData?.completionTrend || 2}
                    isUp={true}
                    icon={CheckCircle2}
                />
                <StatCard
                    title="Practice Hours"
                    value={`${platformData?.totalHours || 0}h`}
                    trend={platformData?.hoursTrend || 8}
                    isUp={true}
                    icon={Clock}
                />
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Graph Area */}
                <Card className="border-border bg-bg-subtle overflow-hidden rounded-[2rem] shadow-2xl lg:col-span-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-black uppercase italic">
                            <TrendingUp className="text-accent" /> Submission Activity (7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] pr-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={
                                    platformData?.submissionsHistory?.map((val, i) => ({
                                        day: `Day ${i + 1}`,
                                        value: val,
                                    })) || []
                                }
                            >
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#1e293b"
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '16px',
                                        border: '1px solid #1e293b',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Talent Area */}
                <Card className="border-border bg-bg-subtle overflow-hidden rounded-[2rem] shadow-xl lg:col-span-4">
                    <CardHeader className="bg-accent/5 border-border/50 border-b">
                        <CardTitle className="text-accent text-xl font-black uppercase italic">
                            Top Talent
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {leaderboard.map((user, index) => (
                            <div
                                key={index}
                                className="bg-bg-page hover:border-accent/20 flex cursor-pointer items-center justify-between rounded-2xl border border-transparent p-3 transition-transform hover:scale-[1.02]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-accent/10 text-accent flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="text-text-primary mb-1 text-sm leading-none font-bold">
                                            {user.name}
                                        </p>
                                        <p className="text-text-muted text-[10px] font-black uppercase">
                                            Score: {user.score}%
                                        </p>
                                    </div>
                                </div>
                                <div className="border-border size-8 overflow-hidden rounded-full border">
                                    <img
                                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.name}`}
                                        alt="avatar"
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, trend, isUp, icon: Icon }) {
    return (
        <Card className="border-border bg-bg-subtle group hover:border-accent/50 rounded-[1.5rem] shadow-sm transition-all duration-300">
            <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div className="bg-accent/10 text-accent flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110">
                        <Icon size={24} />
                    </div>
                    <div
                        className={`flex items-center rounded-full px-2 py-0.5 text-[10px] font-black italic ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}
                    >
                        {isUp ? '▲' : '▼'} {Math.abs(trend || 0)}%
                    </div>
                </div>
                <p className="text-text-muted mb-1 text-[10px] font-black tracking-[0.2em] uppercase">
                    {title}
                </p>
                <h3 className="text-text-primary text-3xl leading-none font-black tracking-tighter italic">
                    {value !== undefined
                        ? typeof value === 'number'
                            ? value.toLocaleString()
                            : value
                        : '0'}
                </h3>
            </CardContent>
        </Card>
    )
}
