'use client'

import React from 'react'
import { CheckCircle, XCircle, Clock, Database, AlertTriangle, ChevronDown } from 'lucide-react'

// Shadcn Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useProblemSolve } from '@/context/ProblemSolveContext'

export default function ExecutionConsole() {
    const { isSubmitting, submissionResult, testCaseResults } = useProblemSolve()

    if (isSubmitting) {
        return (
            <div className="bg-bg-subtle border-border flex h-full flex-col items-center justify-center border-t p-4">
                <div className="border-accent h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                <p className="text-text-muted mt-4 animate-pulse text-sm">Judging in progress...</p>
            </div>
        )
    }

    if (!submissionResult && testCaseResults.length === 0) {
        return (
            <div className="bg-bg-subtle border-border flex h-full flex-col items-center justify-center border-t p-4">
                <p className="text-text-muted text-sm">You must run or submit your code first.</p>
            </div>
        )
    }

    const verdict = submissionResult?.verdict || 'pending'
    const isAccepted = verdict === 'accepted'

    return (
        <div className="bg-bg-subtle border-border flex h-full flex-col overflow-hidden border-t">
            {/* Header Result Line */}
            <div className="bg-bg-page border-border flex shrink-0 items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex items-center gap-1.5 text-sm font-semibold ${isAccepted ? 'text-success' : 'text-error'}`}
                    >
                        {isAccepted ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {verdict.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="bg-border my-auto h-4 w-px" />
                    <div className="text-text-muted flex items-center gap-4 font-mono text-xs">
                        <span className="flex items-center gap-1">
                            <Clock size={12} /> {submissionResult?.executionTime || 0} ms
                        </span>
                        <span className="flex items-center gap-1">
                            <Database size={12} /> {(submissionResult?.memoryUsed || 0).toFixed(1)}{' '}
                            KB
                        </span>
                    </div>
                </div>

                <button className="hover:bg-bg-subtle text-text-muted rounded p-1 transition-colors">
                    <ChevronDown size={18} />
                </button>
            </div>

            {/* Console Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
                <Tabs defaultValue="case-0" className="w-full">
                    <TabsList className="mb-4 flex h-auto flex-wrap items-center justify-start gap-2 bg-transparent p-0">
                        {testCaseResults.map((result, idx) => (
                            <TabsTrigger
                                key={idx}
                                value={`case-${idx}`}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                                    result.verdict === 'success'
                                        ? 'bg-bg-muted text-success data-[state=active]:bg-success/20'
                                        : 'bg-bg-muted text-error data-[state=active]:bg-error/20'
                                }`}
                            >
                                Case {idx + 1}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {testCaseResults.map((result, idx) => (
                        <TabsContent
                            key={idx}
                            value={`case-${idx}`}
                            className="m-0 space-y-4 outline-none"
                        >
                            {result.error && (
                                <div className="bg-error/10 border-error/20 text-error rounded-md border p-3 font-mono text-xs">
                                    <div className="mb-1 flex items-center gap-2 font-bold">
                                        <AlertTriangle size={14} /> Error Output:
                                    </div>
                                    {result.error}
                                </div>
                            )}

                            {result.isSample && result.actualOutput && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-text-muted text-[11px] font-bold tracking-wide uppercase">
                                            Actual Output
                                        </label>
                                        <div
                                            className={`bg-bg-page border-border rounded-md border p-3 font-mono text-xs tracking-wide ${result.verdict === 'success' ? 'text-success' : 'text-error'}`}
                                        >
                                            {result.actualOutput}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!result.isSample && (
                                <div className="text-text-muted text-xs italic">
                                    Output hidden for non-sample test cases.
                                </div>
                            )}

                            <div className="text-text-muted flex gap-4 font-mono text-[10px]">
                                <span>Time: {result.time}ms</span>
                                <span>Memory: {result.memory}KB</span>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}
