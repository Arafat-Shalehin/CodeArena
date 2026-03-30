'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
    Users, Trophy, FileText, AlertTriangle, 
    Plus, Loader2, PlayCircle, History, 
    BarChart3, CheckCircle2, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Radar, RadarChart, 
    PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts'
import axios from 'axios'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [interviewHistory, setInterviewHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // আপনার পাঠানো API গুলো থেকে ডাটা ফেচ করা
                const [platformRes, historyRes] = await Promise.all([
                    axios.get('/api/stats/platform'),
                    axios.get('/api/interview/history?limit=5') // ইন্টারভিউ হিস্ট্রি এপিআই
                ])
                
                setStats(platformRes.data.data)
                setInterviewHistory(historyRes.data.data)
            } catch (error) {
                console.error("Dashboard Error:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-accent" size={40} /></div>

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
            {/* Top Row: Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={stats?.totalParticipants || "0"} icon={Users} color="bg-blue-600" />
                <StatCard title="Total Problems" value="450+" icon={FileText} color="bg-purple-600" />
                <StatCard title="Interviews Taken" value={stats?.totalInterviews || "1.2k"} icon={PlayCircle} color="bg-emerald-600" />
                <StatCard title="Avg. Success" value="78%" icon={Trophy} color="bg-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Interview Performance Analysis (Chart) */}
                <Card className="lg:col-span-8 rounded-[2rem] border-border bg-bg-subtle shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-border/50 pb-6">
                        <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
                            <BarChart3 className="text-accent" /> Interview Trend Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats?.chartData || []}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Quick Interview Launch */}
                <Card className="lg:col-span-4 rounded-[2rem] border-accent/20 bg-accent/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <PlayCircle size={150} />
                    </div>
                    <CardContent className="p-8 flex flex-col h-full justify-between relative z-10">
                        <div>
                            <h2 className="text-3xl font-black uppercase italic leading-none mb-2">Ready for an Interview?</h2>
                            <p className="text-sm text-text-secondary font-medium">Test your skills with AI-powered code analysis and real-time feedback.</p>
                        </div>
                        <div className="space-y-4 mt-8">
                            <Button className="w-full bg-accent hover:bg-accent/90 text-white font-black py-6 rounded-2xl italic tracking-widest shadow-lg shadow-accent/30">
                                START NEW SESSION
                            </Button>
                            <Button variant="outline" className="w-full py-6 rounded-2xl font-black border-2">
                                BROWSE PROBLEMS
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Recent Interview Sessions (Table Context) */}
                <Card className="lg:col-span-12 rounded-[2rem] border-border bg-bg-subtle shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
                            <History size={20} className="text-accent" /> Recent Interview Sessions
                        </CardTitle>
                        <Button variant="ghost" className="text-xs font-black text-accent uppercase tracking-widest">View All History</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted border-b border-border/50">
                                        <th className="text-left pb-4">Problem Name</th>
                                        <th className="text-left pb-4">Started At</th>
                                        <th className="text-left pb-4">Status</th>
                                        <th className="text-right pb-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {interviewHistory.length > 0 ? interviewHistory.map((session) => (
                                        <tr key={session._id} className="group hover:bg-bg-page/50 transition-colors">
                                            <td className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-bg-page flex items-center justify-center text-accent border border-border">
                                                        <FileText size={18} />
                                                    </div>
                                                    <span className="font-bold text-text-primary">
                                                        {session.problemIds?.[0]?.title || "Multi-Problem Session"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-text-muted font-medium">
                                                {new Date(session.startedAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 size={12} /> Completed
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <Button size="sm" variant="ghost" className="rounded-lg font-bold text-xs hover:bg-accent hover:text-white transition-all">
                                                    Review Result
                                                </Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="py-10 text-center text-text-muted font-bold italic">No recent interview sessions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color }) {
    return (
        <Card className="rounded-[1.5rem] border-border bg-bg-subtle hover:shadow-2xl transition-all group overflow-hidden relative">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-1">{title}</p>
                    <h3 className="text-3xl font-black text-text-primary italic tracking-tight">{value}</h3>
                </div>
                <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:rotate-12 transition-transform`}>
                    <Icon size={24} />
                </div>
            </CardContent>
        </Card>
    )
}