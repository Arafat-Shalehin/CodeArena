import React from 'react'
import { Zap, Timer, Users } from 'lucide-react'

const LiveBanner = ({ contest }) => {
    if (!contest) return null

    return (
        <div className="from-accent to-accent-hover group relative overflow-hidden rounded-2xl bg-gradient-to-r p-8 shadow-2xl transition-all">
            <div className="absolute top-0 right-0 scale-150 rotate-12 transform p-8 opacity-10 transition-transform group-hover:scale-110">
                <Zap className="text-text-inverse size-[120px]" />
            </div>
            <div className="relative z-10">
                <div className="bg-bg-page/20 mb-4 inline-flex items-center rounded-full px-4 py-1 backdrop-blur-md">
                    <span className="bg-text-inverse mr-2 h-2 w-2 animate-pulse rounded-full" />
                    <span className="text-text-inverse text-xs font-black tracking-widest uppercase">
                        Live Now
                    </span>
                </div>
                <h2 className="text-text-inverse mb-2 text-3xl font-black">{contest.title}</h2>
                <div className="text-text-inverse mb-8 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Timer className="size-6" />
                        <span className="font-mono text-xl font-bold">
                            {contest.timeRemaining} remaining
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="size-6" />
                        <span className="font-bold">{contest.participants} participants</span>
                    </div>
                </div>
                <button className="text-accent bg-bg-page rounded-xl px-8 py-3 font-black tracking-wider uppercase shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-95">
                    Enter Contest
                </button>
            </div>
        </div>
    )
}

export default LiveBanner
