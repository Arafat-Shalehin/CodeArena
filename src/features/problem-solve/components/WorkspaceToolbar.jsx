'use client'

import React from 'react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import {
    Settings,
    History,
    RotateCcw,
    Maximize,
    Play,
    CheckCircle2,
    Loader2,
    Sparkles,
} from 'lucide-react'

import { useProblemSolve } from '@/context/ProblemSolveContext'

export default function WorkspaceToolbar() {
    const {
        language,
        setLanguage,
        resetCode,
        runCode,
        submitCode,
        isRunning,
        isSubmitting,
        testResult,
        fetchAiFeedback,
    } = useProblemSolve()

    return (
        <div className="border-border bg-bg-subtle flex h-11 shrink-0 items-center justify-between border-b px-3">
            {/* Left: Language + Actions */}
            <div className="flex items-center gap-2">
                {/* Language Selector */}
                <div className="w-[140px]">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-bg-page hover:bg-bg-muted h-7 border-none px-2 text-xs shadow-none transition-colors focus:ring-0">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                            <SelectItem value="python">
                                <span className="text-success mr-1 font-bold">Py</span> Python 3
                            </SelectItem>
                            <SelectItem value="cpp">
                                <span className="text-primary mr-1 font-bold">C++</span> C++
                            </SelectItem>
                            <SelectItem value="javascript">
                                <span className="text-warning mr-1 font-bold">Js</span> JavaScript
                            </SelectItem>
                            <SelectItem value="java">
                                <span className="text-error mr-1 font-bold">Jv</span> Java
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="bg-border mx-1 h-4 w-px" />

                <button
                    onClick={resetCode}
                    className="hover:bg-bg-muted text-text-muted rounded p-1 transition-colors"
                    title="Reset Code"
                >
                    <RotateCcw size={16} />
                </button>
                <button className="hover:bg-bg-muted text-text-muted rounded p-1 transition-colors">
                    <Settings size={16} />
                </button>
            </div>

            {/* Center: Run + Submit */}
            <div className="flex items-center gap-2">
                <button
                    onClick={runCode}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center gap-1.5 rounded-md bg-[#333] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#444] disabled:opacity-50"
                >
                    {isRunning ? (
                        <Loader2 size={13} className="animate-spin" />
                    ) : (
                        <Play size={13} />
                    )}
                    Run
                </button>
                <button
                    onClick={submitCode}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center gap-1.5 rounded-md bg-[#2cbb5d] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#26a34f] disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <Loader2 size={13} className="animate-spin" />
                    ) : (
                        <CheckCircle2 size={13} />
                    )}
                    Submit
                </button>
                {testResult?.status === 'done' && (
                    <button
                        onClick={fetchAiFeedback}
                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-purple-400 transition-colors hover:bg-purple-500/10"
                    >
                        <Sparkles size={13} /> AI
                    </button>
                )}
            </div>

            {/* Right: Misc */}
            <div className="flex items-center gap-1">
                <button className="hover:bg-bg-muted text-text-muted rounded p-1 transition-colors">
                    <Maximize size={16} />
                </button>
            </div>
        </div>
    )
}
