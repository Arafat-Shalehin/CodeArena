'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import {
    Trophy,
    Target,
    Clock,
    Users,
    ChevronLeft,
    Share2,
    Download,
    CheckCircle2,
    XCircle,
    Zap,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function PersonalResultPage() {
    const { id: contestId } = useParams()
    const router = useRouter()
    const { width, height } = useWindowSize()

    const resultRef = useRef(null)
    const [isSharing, setIsSharing] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const { data, error, isLoading, mutate } = useSWR(
        contestId ? `/api/contests/${contestId}/my-result` : null,
        fetcher,
        {
            // Poll aggressively while results are not consistent, stop when they are
            refreshInterval: (latestData) => {
                const d = latestData?.data
                if (!d) return 5000 // Still loading or no data, keep polling
                if (d.isResultConsistent) return 0 // Results finalized, stop polling
                return 5000 // Pending submissions exist, poll every 5s
            },
        }
    )

    const result = data?.data
    const isReady = data?.success && result
    const isResultConsistent = result?.isResultConsistent ?? false
    const pendingCount = result?.pendingCount ?? 0

    // Listen for the worker's 'contest:result_finalized' signal via Socket.IO
    // This instantly kills polling and triggers a final SWR revalidation
    useEffect(() => {
        if (!contestId || isResultConsistent) return

        let socket
        try {
            const { io } = require('socket.io-client')
            socket = io(`http://${window.location.hostname}:3002`)

            socket.on('connect', () => {
                console.log('[ResultPage] Socket connected, listening for result_finalized')
            })

            socket.on('contest:result_finalized', (payload) => {
                console.log('[ResultPage] Received contest:result_finalized:', payload)
                if (payload.contestId === contestId) {
                    // Immediately revalidate SWR to get the final, consistent data
                    mutate()
                }
            })
        } catch (err) {
            console.warn('[ResultPage] Socket connection failed, relying on polling:', err)
        }

        return () => {
            if (socket) socket.disconnect()
        }
    }, [contestId, isResultConsistent, mutate])

    // Format penalty (seconds to HH:MM:SS)
    const formatPenalty = (seconds) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const handleShare = async () => {
        setIsSharing(true)
        const shareUrl = window.location.href
        const shareData = {
            title: `CodeArena Contest: ${result?.contestTitle || 'Result'}`,
            text: `I placed #${result?.rank} out of ${result?.totalParticipants} in ${result?.contestTitle}! Check out my result.`,
            url: shareUrl,
        }

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(shareUrl)
                toast.success('Result link copied to clipboard!')
            }
        } catch (error) {
            console.error('Error sharing:', error)
            if (error.name !== 'AbortError') {
                toast.error('Failed to share result.')
            }
        } finally {
            setIsSharing(false)
        }
    }

    const handleDownload = async () => {
        if (!resultRef.current) return

        setIsDownloading(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 150))
            const dataUrl = await toPng(resultRef.current, {
                cacheBust: true,
                backgroundColor: '#0a0a0a',
                skipFonts: true,
                filter: (node) => {
                    // Skip cross-origin link stylesheets that cause CORS errors
                    if (node.tagName === 'LINK' && node.rel === 'stylesheet') return false
                    return true
                },
                style: { margin: 0 },
            })
            const link = document.createElement('a')
            link.download = `CodeArena_Result_${result?.contestTitle?.replace(/\s+/g, '_') || 'Contest'}.png`
            link.href = dataUrl
            link.click()
            toast.success('Result downloaded successfully!')
        } catch (error) {
            console.error('Failed to generate image:', error)
            toast.error('Failed to download result image.')
        } finally {
            setIsDownloading(false)
        }
    }

    console.log(result)

    if (isLoading) {
        return (
            <div className="bg-bg-page flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    >
                        <Zap className="text-accent size-12" />
                    </motion.div>
                    <p className="text-text-muted font-black tracking-widest uppercase">
                        Analyzing Performance...
                    </p>
                </div>
            </div>
        )
    }

    if (error || (data && !data.success)) {
        return (
            <div className="bg-bg-page flex min-h-screen flex-col items-center justify-center p-6 text-center">
                <XCircle className="text-error mb-4 size-16 opacity-20" />
                <h1 className="text-text-primary text-2xl font-black">Result Not Ready</h1>
                <p className="text-text-muted mt-2 max-w-md font-medium">
                    {data?.message ||
                        "We couldn't find your result for this contest. You may not have participated or the results are still being processed."}
                </p>
                <Button
                    variant="outline"
                    className="mt-8 gap-2"
                    onClick={() => router.push(`/contests/${contestId}`)}
                >
                    <ChevronLeft size={16} />
                    Back to Contest
                </Button>
            </div>
        )
    }

    // --- RACE CONDITION GATE ---
    // If submissions are still being evaluated by BullMQ workers,
    // show a waiting screen instead of displaying stale 0-score data.
    if (!isResultConsistent) {
        return (
            <div className="bg-bg-page flex min-h-screen items-center justify-center">
                <div className="flex max-w-md flex-col items-center gap-6 px-6 text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    >
                        <Zap className="text-accent size-16" />
                    </motion.div>
                    <h2 className="text-text-primary text-2xl font-black tracking-tight">
                        {pendingCount > 0
                            ? `Processing ${pendingCount} pending submission${pendingCount > 1 ? 's' : ''}...`
                            : 'Finalizing your results...'}
                    </h2>
                    <p className="text-text-muted text-sm leading-relaxed font-medium">
                        Your code is being evaluated against test cases. Results will appear
                        automatically once complete.
                    </p>
                    <div className="text-text-muted flex items-center gap-2 text-xs">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Auto-refreshing every 2 seconds</span>
                    </div>
                </div>
            </div>
        )
    }

    const isWinner = result?.rank <= 3

    return (
        <div className="bg-bg-page relative min-h-screen overflow-hidden pb-20">
            {isWinner && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.1}
                />
            )}

            {/* Background Glow */}
            <div className="pointer-events-none fixed inset-0">
                <div className="bg-accent/5 absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
                <div className="bg-success/5 absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full blur-[100px]" />
            </div>

            <div className="relative container mx-auto max-w-5xl px-4 pt-12 md:px-6">
                {/* Header Actions */}
                <div className="mb-12 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-text-muted hover:text-text-primary gap-2 font-bold tracking-widest uppercase"
                        onClick={() => router.push(`/contests/${contestId}`)}
                    >
                        <ChevronLeft size={16} />
                        Arena
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="hover:border-accent rounded-xl transition-all hover:text-white"
                            onClick={handleShare}
                            disabled={isSharing || !isReady}
                        >
                            {isSharing ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Share2 size={16} />
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="hover:border-accent rounded-xl transition-all hover:text-white"
                            onClick={handleDownload}
                            disabled={isDownloading || !isReady}
                        >
                            {isDownloading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Exportable Content Area */}
                <div ref={resultRef} className="relative -mx-4 rounded-3xl p-4 sm:-mx-8 sm:p-8">
                    {/* Inner wrapper to apply background matching the page solely for the export capture */}

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        <div className="bg-accent/10 border-accent/20 text-accent mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[10px] font-black tracking-widest uppercase">
                            <Zap size={12} fill="currentColor" />
                            Contest Summary
                        </div>
                        <h1 className="text-text-primary mb-4 text-4xl font-black tracking-tighter italic md:text-6xl">
                            {result?.contestTitle}
                        </h1>
                        <p className="text-text-muted text-lg font-medium">
                            Excellent work! Here is how you performed against others.
                        </p>
                    </motion.div>

                    {/* Rank Trophy Section */}
                    <div className="grid gap-8 md:grid-cols-12 lg:gap-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="md:col-span-5"
                        >
                            <Card className="bg-bg-subtle border-border relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl p-12 text-center shadow-2xl">
                                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 to-transparent" />

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 260,
                                        damping: 20,
                                        delay: 0.4,
                                    }}
                                    className="relative mb-8"
                                >
                                    <div
                                        className={`absolute inset-0 opacity-20 blur-3xl ${
                                            result?.rank === 1
                                                ? 'bg-rank-gold'
                                                : result?.rank === 2
                                                  ? 'bg-rank-silver'
                                                  : result?.rank === 3
                                                    ? 'bg-rank-bronze'
                                                    : 'bg-accent'
                                        }`}
                                    />
                                    <Trophy
                                        className={`relative size-32 ${
                                            result?.rank === 1
                                                ? 'text-rank-gold drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]'
                                                : result?.rank === 2
                                                  ? 'text-rank-silver drop-shadow-[0_0_25px_rgba(192,192,192,0.5)]'
                                                  : result?.rank === 3
                                                    ? 'text-rank-bronze drop-shadow-[0_0_25px_rgba(205,127,50,0.5)]'
                                                    : 'text-text-muted opacity-40'
                                        }`}
                                    />
                                </motion.div>

                                <div className="relative">
                                    <p className="text-text-muted mb-1 text-xs font-black tracking-widest uppercase">
                                        Your Standing
                                    </p>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-text-primary text-7xl font-black tabular-nums">
                                            #{result?.rank}
                                        </span>
                                        <span className="text-text-muted text-xl font-bold">
                                            / {result?.totalParticipants}
                                        </span>
                                    </div>
                                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                                        <div className="text-text-muted rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black tracking-wide uppercase">
                                            Top{' '}
                                            {Math.max(
                                                1,
                                                Math.round(
                                                    (result?.rank / result?.totalParticipants) * 100
                                                )
                                            )}
                                            %
                                        </div>
                                        <div className="bg-success/10 border-success/20 text-success rounded-lg border px-3 py-1 text-[10px] font-black tracking-wide uppercase">
                                            Verified Result
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Stats Grid */}
                        <div className="flex flex-col gap-6 md:col-span-7">
                            <div className="grid grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Card className="bg-bg-subtle border-border rounded-2xl p-6">
                                        <Target className="text-accent mb-4 size-6" />
                                        <p className="text-text-muted mb-1 text-[10px] font-black tracking-widest uppercase">
                                            Problems Solved
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-text-primary text-3xl font-black tabular-nums">
                                                {result?.solvedCount}
                                            </span>
                                            <span className="text-text-muted text-sm font-bold">
                                                / {result?.totalProblems}
                                            </span>
                                        </div>
                                        <div className="bg-border mt-3 h-1.5 w-full overflow-hidden rounded-full">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(result?.solvedCount / result?.totalProblems) * 100}%`,
                                                }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="bg-accent h-full"
                                            />
                                        </div>
                                    </Card>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <Card className="bg-bg-subtle border-border text-success rounded-2xl p-6">
                                        <Zap className="mb-4 size-6 fill-current" />
                                        <p className="text-text-muted mb-1 text-[10px] font-black tracking-widest uppercase">
                                            Total Points
                                        </p>
                                        <span className="text-text-primary text-3xl font-black tabular-nums">
                                            {result?.score}
                                        </span>
                                    </Card>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Card className="bg-bg-subtle border-border rounded-2xl p-6">
                                        <Clock className="text-rank-gold mb-4 size-6" />
                                        <p className="text-text-muted mb-1 text-[10px] font-black tracking-widest uppercase">
                                            Time Penalty
                                        </p>
                                        <span className="text-text-primary font-mono text-3xl font-black tabular-nums">
                                            {formatPenalty(result?.penalty)}
                                        </span>
                                    </Card>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Card className="bg-bg-subtle border-border rounded-2xl p-6">
                                        <Users className="text-accent mb-4 size-6" />
                                        <p className="text-text-muted mb-1 text-[10px] font-black tracking-widest uppercase">
                                            Competitors
                                        </p>
                                        <span className="text-text-primary text-3xl font-black tabular-nums">
                                            {result?.totalParticipants}
                                        </span>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Recent Performance summary */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Card className="bg-bg-subtle border-border overflow-hidden rounded-2xl">
                                    <div className="border-border flex items-center justify-between border-b p-6">
                                        <h3 className="text-text-primary text-xs font-black tracking-widest uppercase">
                                            Submission Integrity
                                        </h3>
                                        <div className="text-success flex items-center gap-1 text-[10px] font-black uppercase">
                                            <CheckCircle2 size={12} />
                                            Verified
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 p-6">
                                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                                            <p className="text-text-muted mb-1 text-[8px] font-black tracking-widest uppercase">
                                                Accuracy
                                            </p>
                                            <p className="text-text-primary text-xl font-black">
                                                94.2%
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
                                            <p className="text-text-muted mb-1 text-[8px] font-black tracking-widest uppercase">
                                                Avg Complexity
                                            </p>
                                            <p className="text-text-primary text-xl font-black">
                                                O(N log N)
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <Button
                        onClick={() => router.push(`/contests/${contestId}/results`)}
                        className="bg-accent hover:bg-accent/90 h-12 w-full rounded-xl px-8 font-black tracking-tighter text-white uppercase sm:w-auto"
                    >
                        View Official Leaderboard
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/contests')}
                        className="h-12 w-full rounded-xl px-8 font-black tracking-tighter uppercase sm:w-auto"
                    >
                        Discover New Contests
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
