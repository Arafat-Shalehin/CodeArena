'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Server, Boxes, Clock3, Loader2, RefreshCw } from 'lucide-react'

function HealthBadge({ ok, label }) {
    return (
        <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black tracking-wider uppercase ${
                ok
                    ? 'bg-success/15 text-success border-success/30 border'
                    : 'bg-error/15 text-error border-error/30 border'
            }`}
        >
            {label}
        </span>
    )
}

function StatCard({ title, value, subtitle, icon: Icon }) {
    return (
        <div className="matte-surface border-border bg-bg-subtle/40 rounded-2xl border p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-text-muted text-[10px] font-black tracking-widest uppercase">
                    {title}
                </p>
                <Icon className="text-accent h-4 w-4 opacity-70" />
            </div>
            <p className="text-text-primary text-2xl font-black tracking-tight">{value}</p>
            {subtitle ? (
                <p className="text-text-muted mt-1 text-[10px] font-bold tracking-wide uppercase opacity-70">
                    {subtitle}
                </p>
            ) : null}
        </div>
    )
}

export default function AdminOpsPage() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchOps = async () => {
        try {
            setError('')
            const res = await fetch('/api/admin/ops', { cache: 'no-store' })
            const json = await res.json()
            if (!res.ok || !json?.success) {
                throw new Error(json?.error || `Failed with status ${res.status}`)
            }
            setData(json.data)
        } catch (err) {
            setError(err?.message || 'Failed to fetch ops data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOps()
        const intervalId = setInterval(fetchOps, 10000)
        return () => clearInterval(intervalId)
    }, [])

    const totalQueueBacklog = useMemo(() => {
        if (!data?.queues?.length) return 0
        return data.queues.reduce((sum, q) => sum + (q.waiting || 0) + (q.delayed || 0), 0)
    }, [data])

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <div className="bg-accent/10 flex h-20 w-20 items-center justify-center rounded-2xl">
                    <Loader2 className="text-accent h-10 w-10 animate-spin" />
                </div>
                <p className="text-text-muted text-[10px] font-black tracking-widest uppercase opacity-60">
                    Collecting ops telemetry...
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-text-primary text-3xl font-black tracking-tight uppercase italic">
                        Ops <span className="text-accent">Panel</span>
                    </h1>
                    <p className="text-text-muted mt-1 text-[10px] font-black tracking-widest uppercase opacity-70">
                        Queue, latency and infra health snapshot
                    </p>
                </div>
                <button
                    onClick={fetchOps}
                    className="bg-accent hover:bg-accent/90 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black tracking-widest text-white uppercase"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {error ? (
                <div className="border-error/30 bg-error/10 text-error rounded-xl border px-4 py-3 text-sm font-semibold">
                    {error}
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Submissions (24h)"
                    value={data?.submissions?.total24h ?? 0}
                    subtitle={`Completed ${data?.submissions?.completed24h ?? 0}`}
                    icon={Activity}
                />
                <StatCard
                    title="Queued Now"
                    value={data?.submissions?.queuedNow ?? 0}
                    subtitle={`Backlog ${totalQueueBacklog}`}
                    icon={Clock3}
                />
                <StatCard
                    title="Submit p95"
                    value={
                        data?.submissions?.runtimeMs?.submit?.p95 != null
                            ? `${data.submissions.runtimeMs.submit.p95} ms`
                            : 'N/A'
                    }
                    subtitle={`p50 ${data?.submissions?.runtimeMs?.submit?.p50 ?? 'N/A'} ms`}
                    icon={Boxes}
                />
                <StatCard
                    title="Run p95"
                    value={
                        data?.submissions?.runtimeMs?.run?.p95 != null
                            ? `${data.submissions.runtimeMs.run.p95} ms`
                            : 'N/A'
                    }
                    subtitle={`p50 ${data?.submissions?.runtimeMs?.run?.p50 ?? 'N/A'} ms`}
                    icon={Server}
                />
            </div>

            <div className="matte-surface border-border bg-bg-subtle/40 rounded-2xl border p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <HealthBadge
                        ok={Boolean(data?.infra?.redisConnected)}
                        label={data?.infra?.redisConnected ? 'Redis Connected' : 'Redis Down'}
                    />
                    <HealthBadge
                        ok={Boolean(data?.infra?.dockerAvailable)}
                        label={data?.infra?.dockerAvailable ? 'Docker Ready' : 'Docker Fallback'}
                    />
                    <span className="text-text-muted ml-auto text-[10px] font-bold tracking-widest uppercase">
                        Updated{' '}
                        {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : '--'}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="border-border rounded-xl border p-3">
                        <p className="text-text-muted mb-1 text-[10px] font-black tracking-widest uppercase">
                            Worker Concurrency
                        </p>
                        <p className="text-text-primary text-xl font-black">
                            {data?.infra?.workerConcurrency ?? 0}
                        </p>
                    </div>
                    <div className="border-border rounded-xl border p-3">
                        <p className="text-text-muted mb-1 text-[10px] font-black tracking-widest uppercase">
                            Progress Event Stride
                        </p>
                        <p className="text-text-primary text-xl font-black">
                            {data?.infra?.progressStride ?? 0}
                        </p>
                    </div>
                </div>

                {!data?.infra?.dockerAvailable && data?.infra?.dockerError ? (
                    <p className="text-error mt-3 text-xs font-semibold">
                        Docker error: {data.infra.dockerError}
                    </p>
                ) : null}
            </div>

            <div className="matte-surface border-border bg-bg-subtle/40 overflow-hidden rounded-2xl border shadow-sm">
                <div className="border-border flex items-center justify-between border-b px-5 py-4">
                    <h2 className="text-text-primary text-xs font-black tracking-widest uppercase">
                        Queue Health
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-text-muted border-border border-b text-[10px] font-black tracking-widest uppercase">
                                <th className="px-5 py-3">Queue</th>
                                <th className="px-5 py-3">Waiting</th>
                                <th className="px-5 py-3">Active</th>
                                <th className="px-5 py-3">Failed</th>
                                <th className="px-5 py-3">Delayed</th>
                                <th className="px-5 py-3">Oldest Waiting</th>
                                <th className="px-5 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.queues || []).map((queue) => (
                                <tr key={queue.name} className="border-border/60 border-b text-sm">
                                    <td className="px-5 py-3 font-semibold">{queue.name}</td>
                                    <td className="px-5 py-3">{queue.waiting}</td>
                                    <td className="px-5 py-3">{queue.active}</td>
                                    <td className="px-5 py-3">{queue.failed}</td>
                                    <td className="px-5 py-3">{queue.delayed}</td>
                                    <td className="px-5 py-3">
                                        {queue.oldestWaitingMs
                                            ? `${Math.round(queue.oldestWaitingMs / 1000)} s`
                                            : '0 s'}
                                    </td>
                                    <td className="px-5 py-3">
                                        <HealthBadge
                                            ok={Boolean(queue.healthy)}
                                            label={queue.healthy ? 'Healthy' : 'Error'}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
