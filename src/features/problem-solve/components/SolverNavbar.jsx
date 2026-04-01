import React from 'react'
import Link from 'next/link'
import {
    Play,
    ChevronLeft,
    ChevronRight,
    Shuffle,
    Loader2,
    CheckCircle2,
    List,
    User as UserIcon,
    Settings2,
    Sparkles,
} from 'lucide-react'
import AreanaLogo from '@/shared/components/ui/AreanaLogo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import NotificationBell from '@/components/layout/NotificationBell'

export default function SolverNavbar({
    setShowProblemList,
    navigateProblem,
    randomProblem,
    runCode,
    submitCode,
    isRunning,
    isSubmitting,
    isAuthenticated,
    user,
    testResult,
    fetchAiFeedback,
}) {
    return (
        <nav className="border-border bg-bg-subtle flex h-12 shrink-0 items-center justify-between border-b px-2 sm:px-4">
            {/* Left */}
            <div className="flex items-center gap-1">
                <AreanaLogo
                    href="/feed"
                    className="mr-2 scale-90 transition-transform hover:scale-95 sm:mr-4"
                />
                <div className="bg-border mr-2 hidden h-6 w-px sm:block" />
                <button
                    onClick={() => setShowProblemList(true)}
                    className="hover:bg-bg-muted text-text-secondary hover:text-text-primary flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors sm:px-3"
                    aria-label="Open problem list"
                >
                    <List size={16} />
                    <span className="hidden font-semibold sm:inline">Problem List</span>
                </button>
                <div className="bg-border mx-2 hidden h-4 w-px sm:block" />
                <button
                    onClick={() => navigateProblem(-1)}
                    className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                    aria-label="Previous problem"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={() => navigateProblem(1)}
                    className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                    aria-label="Next problem"
                >
                    <ChevronRight size={20} />
                </button>
                <button
                    onClick={randomProblem}
                    className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                    aria-label="Random problem"
                >
                    <Shuffle size={18} />
                </button>
            </div>
            {/* Center - Run/Submit buttons */}
            <div className="flex items-center gap-1 sm:gap-2">
                <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="bg-bg-muted hover:bg-border flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50 sm:gap-1.5 sm:px-4"
                    aria-label="Run code"
                >
                    {isRunning ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Play size={14} />
                    )}
                    <span className="hidden sm:inline">Run</span>
                </button>
                <button
                    onClick={submitCode}
                    disabled={isSubmitting}
                    className="bg-accent hover:bg-accent/80 flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-bold text-white transition-colors disabled:opacity-50 sm:gap-1.5 sm:px-4"
                    aria-label="Submit code"
                >
                    {isSubmitting ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <CheckCircle2 size={14} />
                    )}
                    <span className="hidden sm:inline">Submit</span>
                </button>
            </div>
            {/* Right */}
            <div className="flex items-center gap-1 text-gray-400 sm:gap-2">
                <button className="hover:bg-bg-muted hover:text-text-primary hidden rounded p-1 transition-colors sm:block">
                    <Settings2 size={18} />
                </button>

                <div className="bg-border hidden h-6 w-px sm:block" />
                <div className="hidden sm:block">
                    <NotificationBell />
                </div>

                <Link
                    href={isAuthenticated ? '/profile' : '/login'}
                    className="border-border bg-bg-page hover:bg-bg-muted group flex items-center gap-2 rounded-full border px-2 py-1 transition-all"
                >
                    <Avatar className="border-accent/20 group-hover:border-accent/40 size-7 border transition-colors">
                        {isAuthenticated && user ? (
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.avatarSeed || user.name || user.email}`}
                                alt={user.name}
                            />
                        ) : null}
                        <AvatarFallback className="bg-accent/10 text-accent text-[10px] font-bold">
                            <UserIcon size={11} />
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-text-secondary group-hover:text-text-primary text-xs font-semibold">
                        {isAuthenticated ? 'Profile' : 'Sign In'}
                    </span>
                </Link>
            </div>
        </nav>
    )
}
