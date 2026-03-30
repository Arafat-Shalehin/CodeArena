'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
    Users, Trophy, FileText, AlertTriangle, 
    Plus, Loader2, TrendingUp, Activity, Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar 
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
                // ১. প্ল্যাটফর্মের রিয়েল স্ট্যাটস এবং ৭ দিনের ট্রেন্ড ফেচ করা [cite: 202]
                const [statsRes, leaderRes] = await Promise.all([
                    axios.get('/api/stats/platform'),
                    axios.get('/api/interview/leaderboard') // লিডারবোর্ড এপিআই 
                ])
                
                if (statsRes.data.success) setPlatformData(statsRes.data.data)
                if (leaderRes.data.success) setLeaderboard(leaderRes.data.data.slice(0, 5))
            } catch (error) {
                console.error("Dashboard error:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        // ২. Socket.io কানেকশন (রিয়েল টাইম আপডেটের জন্য) [cite: 164, 220]
        const socket = io('http://localhost:3002') // আপনার লাইভ পোর্ট [cite: 195]
        socket.on('new_submission', (data) => {
            // সাবমিশন হলে অটোমেটিক স্ট্যাটাস আপডেট করার লজিক এখানে দিতে পারেন
            console.log("New Activity:", data)
        })

        return () => socket.disconnect()
    }, [])

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-accent" size={48} /></div>

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase italic text-text-primary tracking-tighter">System Analytics</h1>
                    <p className="text-text-muted font-bold text-sm">Real-time performance metrics</p>
                </div>
                <Button className="bg-accent hover:bg-accent/90 text-white font-black rounded-xl px-6 italic">
                    <Plus className="mr-2 h-5 w-5" /> NEW PROBLEM
                </Button>
            </div>

            {/* Main Stats [cite: 214] */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 7-Day Performance Graph  */}
                <Card className="lg:col-span-8 rounded-[2rem] border-border bg-bg-subtle overflow-hidden shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-black italic uppercase flex items-center gap-2">
                            <TrendingUp className="text-accent" /> Submission Activity (7 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] pr-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={platformData?.submissionsHistory.map((val, i) => ({ day: `Day ${i+1}`, value: val }))}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Performers (Interview Context)  */}
                <Card className="lg:col-span-4 rounded-[2rem] border-border bg-bg-subtle shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-black italic uppercase text-accent">Top Talent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {leaderboard.map((user, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-bg-page hover:scale-[1.02] transition-transform cursor-pointer border border-transparent hover:border-accent/20">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center font-black text-accent">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-text-primary leading-none mb-1">{user.name}</p>
                                        <p className="text-[10px] uppercase font-black text-text-muted">Score: {user.score}%</p>
                                    </div>
                                </div>
                                <div className={`text-xs font-black ${user.score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {user.score > 80 ? 'PRO' : 'ELITE'}
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
        <Card className="rounded-[1.5rem] border-border bg-bg-subtle shadow-sm group hover:border-accent/50 transition-all">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon size={24} />
                    </div>
                    <div className={`flex items-center text-xs font-black italic ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isUp ? '▲' : '▼'} {Math.abs(trend)}%
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">{title}</p>
                <h3 className="text-3xl font-black text-text-primary italic tracking-tighter">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
            </CardContent>
        </Card>
    )
}