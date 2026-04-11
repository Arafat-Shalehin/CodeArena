'use client'

import { useState, useEffect, useMemo } from 'react'
import {
    Users,
    Trophy,
    Plus,
    Loader2,
    Activity,
    Target,
    Brain,
    CheckCircle2,
    Clock,
    Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export default function AdminDashboard() {
    const [platformData, setPlatformData] = useState(null)
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, leaderRes] = await Promise.all([
                    axios.get('/api/stats/platform'),
                    axios.get('/api/leaderboard?limit=5&page=1'),
                ])

                if (statsRes.data.success) setPlatformData(statsRes.data.data)
                if (leaderRes.data.success) setLeaderboard(leaderRes.data.data || [])
            } catch (error) {
                console.error('Dashboard error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const velocityData = useMemo(() => {
        if (Array.isArray(platformData?.dailyStats) && platformData.dailyStats.length > 0) {
            return platformData.dailyStats.map((item, index) => ({
                date: item?.date || item?.label || item?.day || item?._id || `D${index + 1}`,
                submissions:
                    Number(item?.submissions ?? item?.count ?? item?.value ?? item?.total ?? 0) ||
                    0,
            }))
        }

        if (
            Array.isArray(platformData?.submissionsHistory) &&
            platformData.submissionsHistory.length > 0
        ) {
            const total = platformData.submissionsHistory.length
            return platformData.submissionsHistory.map((value, index) => {
                const d = new Date()
                d.setDate(d.getDate() - (total - index - 1))
                return {
                    date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    submissions: Number(value) || 0,
                }
            })
        }

        return []
    }, [platformData])

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="bg-accent/10 flex h-20 w-20 items-center justify-center rounded-2xl">
                    <Loader2 className="text-accent h-10 w-10 animate-spin" />
                </div>
                <p className="text-text-muted text-center text-xs font-medium tracking-wide opacity-70">
                    Gathering system intelligence...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-5 p-4 md:p-0">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-text-primary text-3xl font-extrabold tracking-tight">
                        System <span className="text-accent">Analytics</span>
                    </h1>
                    <p className="text-text-muted mt-1 text-sm font-medium opacity-80">
                        Real-time performance & interview metrics
                    </p>
                </div>
                <Button className="bg-accent hover:bg-accent/90 group rounded-lg px-5 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] active:scale-95">
                    <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
                    New Problem
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                    value={platformData?.avgSolveRate}
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="AI Interview Sessions"
                    value={platformData?.totalSessions ?? '—'}
                    trend={platformData?.sessionsTrend ?? 0}
                    isUp={platformData?.sessionsTrendUp ?? true}
                    icon={Brain}
                    variant="accent"
                />
                <StatCard
                    title="Avg AI Score"
                    value={`${platformData?.avgScore ?? 0}%`}
                    trend={platformData?.scoreTrend ?? 5}
                    isUp={true}
                    icon={Zap}
                    variant="accent"
                />
                <StatCard
                    title="Success Rate"
                    value={`${platformData?.completionRate ?? 0}%`}
                    trend={platformData?.completionTrend ?? 2}
                    isUp={true}
                    icon={CheckCircle2}
                    variant="accent"
                />
                <StatCard
                    title="Practice Hours"
                    value={`${platformData?.totalHours ?? 0}h`}
                    trend={platformData?.hoursTrend ?? 8}
                    isUp={true}
                    icon={Clock}
                    variant="accent"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card className="matte-surface border-border bg-bg-subtle/40 hover:border-accent/30 col-span-1 min-h-80 overflow-hidden rounded-2xl border shadow-sm transition-all lg:col-span-2">
                    <CardHeader className="border-border border-b px-5 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-text-primary text-xs font-semibold tracking-wide uppercase">
                                    Platform <span className="text-accent">Velocity</span>
                                </CardTitle>
                                <p className="text-text-muted mt-0.5 text-[10px] font-medium opacity-70">
                                    Weekly Submission Distribution
                                </p>
                            </div>
                            <Activity className="text-accent h-4 w-4 opacity-50" />
                        </div>
                    </CardHeader>

                    <CardContent className="p-4">
                        <div className="h-64 w-full">
                            {velocityData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={velocityData}>
                                        <defs>
                                            <linearGradient
                                                id="colorValue"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--ca-accent)"
                                                    stopOpacity={0.15}
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
                                            opacity={0.3}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: 'var(--ca-text-muted)',
                                                fontSize: 9,
                                                fontWeight: 600,
                                            }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{
                                                fill: 'var(--ca-text-muted)',
                                                fontSize: 9,
                                                fontWeight: 600,
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--ca-bg-page)',
                                                border: '1px solid var(--ca-border)',
                                                borderRadius: '12px',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                            }}
                                            itemStyle={{ color: 'var(--ca-text-primary)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="submissions"
                                            stroke="var(--ca-accent)"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-text-muted flex h-full items-center justify-center text-sm font-medium opacity-70">
                                    No submission trend data yet.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="matte-surface border-border bg-bg-subtle/40 hover:border-accent/30 flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all">
                    <CardHeader className="border-border border-b px-5 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-text-primary text-xs font-semibold tracking-wide uppercase">
                                    Top <span className="text-accent">Elite</span>
                                </CardTitle>
                                <p className="text-text-muted mt-0.5 text-[10px] font-medium opacity-70">
                                    Global ranking by platform score
                                </p>
                            </div>
                            <Trophy className="text-accent h-4 w-4 opacity-50" />
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 divide-y divide-white/5 p-0">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((user, idx) => {
                                const points = Number(user?.stats?.score ?? user?.score ?? 0)

                                return (
                                    <div
                                        key={user?._id || user?.userId || idx}
                                        className="group relative flex items-center justify-between border-b border-white/5 bg-transparent px-4 py-3 transition-all hover:bg-white/2"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-bg-muted flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-semibold shadow-inner">
                                                #{idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-text-primary text-sm font-semibold tracking-tight">
                                                    {user.name || user.username || 'Unknown'}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-accent/5 text-accent h-4 rounded-full px-2 text-[9px] font-semibold opacity-80"
                                                    >
                                                        {user.rank || 'GLOBAL'}
                                                    </Badge>
                                                    <p className="text-text-muted text-[10px] font-medium opacity-70">
                                                        POINTS: {points.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-border bg-bg-muted/20 group-hover:border-accent/50 relative size-9 shrink-0 overflow-hidden rounded-xl border transition-all duration-300 group-hover:scale-105">
                                            <img
                                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.name || user.username || 'user'}`}
                                                alt={user.name || user.username || 'User'}
                                                className="h-full w-full object-cover p-1"
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-text-muted flex h-full flex-col items-center justify-center gap-2 py-10 text-xs font-medium tracking-wide opacity-55">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Analyzing ranks...
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, trend, isUp, icon: Icon, variant = 'default' }) {
    return (
        <Card className="matte-surface border-border bg-bg-subtle/50 group hover:border-accent/35 relative overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--ca-border-rgb),0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--ca-border-rgb),0.1)_1px,transparent_1px)] bg-size-[16px_16px] opacity-10" />

            <div
                className={`pointer-events-none absolute -top-8 -right-8 size-24 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${variant === 'accent' ? 'bg-accent/20 opacity-40' : 'bg-accent/10 opacity-0'}`}
            />

            <CardContent className="relative z-10 p-4">
                <div className="mb-2 flex items-start justify-between">
                    <div
                        className={`${variant === 'accent' ? 'bg-accent shadow-accent/20 text-white shadow-lg' : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white'} flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105`}
                    >
                        <Icon size={16} strokeWidth={2.3} />
                    </div>
                    <div
                        className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${isUp ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}
                    >
                        {isUp ? '▲' : '▼'} {Math.abs(trend || 0)}%
                    </div>
                </div>
                <p className="text-text-muted mb-1 text-[11px] font-semibold tracking-wide opacity-75">
                    {title}
                </p>
                <h3 className="text-text-primary text-3xl leading-none font-bold tracking-tight">
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
