'use client'

import { useState, useEffect } from 'react'
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
        <div className="animate-in fade-in space-y-8 p-6 duration-700 md:p-8">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-text-primary text-3xl font-bold tracking-tight">
                        System Analytics
                    </h1>
                    <p className="text-text-muted text-sm font-medium">
                        Real-time performance & interview metrics
                    </p>
                </div>
                <Button className="bg-accent hover:bg-accent/90 rounded-lg px-6 font-semibold text-white shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> New Problem
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
                <Card className="border-border bg-bg-subtle overflow-hidden rounded-xl shadow-sm lg:col-span-8">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg font-bold">
                            <TrendingUp className="text-accent h-5 w-5" /> Submission Activity (7
                            Days)
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
                                        <stop
                                            offset="5%"
                                            stopColor="var(--ca-accent)"
                                            stopOpacity={0.1}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--ca-accent)"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="var(--ca-border)"
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--ca-text-muted)', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--ca-text-muted)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--ca-bg-page)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--ca-border)',
                                        boxShadow: 'var(--shadow-md)',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--ca-accent)"
                                    strokeWidth={2}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Talent Area */}
                <Card className="border-border bg-bg-subtle overflow-hidden rounded-xl shadow-sm lg:col-span-4">
                    <CardHeader className="bg-bg-muted/30 border-border border-b py-4">
                        <CardTitle className="text-text-primary text-lg font-bold">
                            Top Talent
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {leaderboard.map((user, index) => (
                            <div
                                key={index}
                                className="bg-bg-page hover:border-accent/30 border-border flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-accent/10 text-accent flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="text-text-primary text-sm leading-none font-semibold">
                                            {user.name}
                                        </p>
                                        <p className="text-text-muted mt-1 text-[10px] font-medium tracking-wider uppercase">
                                            Score: {user.score}%
                                        </p>
                                    </div>
                                </div>
                                <div className="border-border bg-bg-muted/20 size-8 overflow-hidden rounded-full border">
                                    <img
                                        src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.name}`}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
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
        <Card className="border-border bg-bg-subtle group hover:border-accent/40 rounded-xl shadow-sm transition-all duration-300">
            <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div className="bg-accent/10 text-accent group-hover:bg-accent/20 flex h-11 w-11 items-center justify-center rounded-lg transition-colors">
                        <Icon size={20} />
                    </div>
                    <div
                        className={`flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${isUp ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}
                    >
                        {isUp ? '▲' : '▼'} {Math.abs(trend || 0)}%
                    </div>
                </div>
                <p className="text-text-muted mb-1 text-[10px] font-semibold tracking-wider uppercase">
                    {title}
                </p>
                <h3 className="text-text-primary text-2xl font-bold tracking-tight">
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
