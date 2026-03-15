'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'
import { useProblemSolveStore } from '@/store/problemSolveStore'
import {
    CodeEditorProvider,
    useCodeEditor,
    STARTER_CODES,
    LANG_LABELS,
} from '@/context/CodeEditorContext'
import { ExecutionProvider, useExecution } from '@/context/ExecutionContext'
import { RealtimeProvider, useRealtime } from '@/context/RealtimeContext'
import { CacheProvider, useCache } from '@/context/CacheContext'
import { toast } from 'sonner'

const ProblemSolveContext = createContext()

const VALID_LEFT_TABS = new Set([
    'description',
    'editorial',
    'solutions',
    'submissions',
    'submission-result',
])

const getLeftTabStorageKey = (problemId) => `codearena_left_tab_${problemId}`

const readSavedLeftTab = (problemId) => {
    if (typeof window === 'undefined' || !problemId) return 'description'

    try {
        const savedTab = localStorage.getItem(getLeftTabStorageKey(problemId))
        return VALID_LEFT_TABS.has(savedTab) ? savedTab : 'description'
    } catch {
        return 'description'
    }
}

// Re-export for backward compatibility
export { STARTER_CODES, LANG_LABELS }

// Inner component that uses all sub-contexts
function ProblemSolveProviderInner({ children, problemId, initialCode, problem, contestId }) {
    const { user, syncUser } = useAuth()

    // Get Zustand store for persistence
    const zustandStore = useProblemSolveStore()

    // Get sub-contexts
    const codeEditor = useCodeEditor()
    const execution = useExecution()
    const realtime = useRealtime()
    const cache = useCache()

    // Local UI state
    const [isConsoleOpen, setIsConsoleOpen] = useState(true)
    const [leftTab, setLeftTabState] = useState(() => readSavedLeftTab(problemId))

    const setLeftTab = useCallback((nextTab) => {
        setLeftTabState((prevTab) => {
            const resolvedTab = typeof nextTab === 'function' ? nextTab(prevTab) : nextTab
            return VALID_LEFT_TABS.has(resolvedTab) ? resolvedTab : prevTab
        })
    }, [])

    // Persist current left tab per problem so reload can restore the same tab.
    useEffect(() => {
        if (typeof window === 'undefined' || !problemId) return

        try {
            localStorage.setItem(getLeftTabStorageKey(problemId), leftTab)
        } catch {}
    }, [problemId, leftTab])

    // Track previous problemId to only reset when actually changing problems
    const prevProblemIdRef = useRef(null)

    // Reset all states ONLY when problem actually changes, not on first render
    useEffect(() => {
        // Skip reset on initial render
        if (prevProblemIdRef.current === null) {
            prevProblemIdRef.current = problemId
            console.log('[ProblemContext] Initial problem set:', problemId)
            return
        }

        // Only reset if problemId actually changed
        if (prevProblemIdRef.current !== problemId) {
            console.log(
                '[ProblemContext] Problem changed from',
                prevProblemIdRef.current,
                'to',
                problemId
            )
            // Clear execution state for new problem
            execution.setIsRunning(false)
            execution.setIsSubmitting(false)
            execution.setTestResult(null)
            execution.setTestInput('')
            execution.setActiveTestCase(0)
            execution.setConsoleTab('testcase')
            execution.setTestResultData(null)
            execution.setLastSubmittedCode('')
            execution.setLastAnalyzedCode('')
            cache.clearCache()
            setIsConsoleOpen(true)
            setLeftTabState(readSavedLeftTab(problemId))

            prevProblemIdRef.current = problemId
        }
    }, [problemId])

    // Initialize test input from problem
    useEffect(() => {
        if (problem?.sampleTestCases?.length > 0) {
            execution.setTestInput(problem.sampleTestCases[0].input || '')
        }
    }, [problem, execution])

    // ─── Run Code (Direct Execution - No Submission Record) ───────────────────
    const runCode = useCallback(async () => {
        if (!problem) return
        console.log('[FRONTEND] RUN CODE BUTTON CLICKED')
        console.log('[FRONTEND] Problem ID:', problem._id)
        console.log('[FRONTEND] Code length:', codeEditor.code.length)
        console.log('[FRONTEND] Language:', codeEditor.language)
        console.log('[FRONTEND] Custom input:', execution.testInput)

        // 🔥 STORE THE RUN CODE FOR AI ANALYSIS
        execution.setLastSubmittedCode(codeEditor.code)
        execution.setLastSubmittedLanguage(codeEditor.language)

        execution.setIsRunning(true)
        execution.setConsoleTab('result')
        setIsConsoleOpen(true)
        execution.setTestResult({
            status: 'running',
            totalCount: 1,
            results: [],
        })

        try {
            console.log('[FRONTEND] Sending POST /api/execute (direct execution, no submission)')
            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemId: problem._id,
                    code: codeEditor.code,
                    files: codeEditor.files.length > 1 ? codeEditor.files : undefined,
                    language: codeEditor.language,
                    customInput: execution.testInput,
                }),
            })
            const data = await res.json()

            console.log('[FRONTEND] Execution Response:', data)

            if (!data.success) {
                console.error('[FRONTEND] Execution failed:', data.message)
                execution.setTestResult({
                    status: 'error',
                    error: data.message || 'Execution failed',
                    verdict: data.verdict || 'RUNTIME_ERROR',
                })
                execution.setIsRunning(false)
            } else {
                const result = {
                    status: 'done',
                    verdict: data.result?.verdict || 'SUCCESS',
                    time: data.result?.executionTime || 0,
                    memory: data.result?.memoryUsed || 0,
                    output: data.result?.output || '',
                    error: data.result?.error || '',
                    totalCount: 1,
                }
                execution.setTestResult(result)
                execution.setIsRunning(false)

                // 🚀 CACHE THE RESULT for Submit optimization
                cache.setCachedExecution(codeEditor.code, result)
                console.log('[FRONTEND] Code execution completed (not saved as submission)')
            }
        } catch (err) {
            console.error('[FRONTEND] RUN CODE ERROR:', err)
            execution.setTestResult({ status: 'error', error: err.message })
            execution.setIsRunning(false)
        }
    }, [problem?._id, codeEditor.code, codeEditor.language, codeEditor.files, execution.testInput])

    // ─── Submit Code (Full Judge via BullMQ) ───────────────────────────────
    const submitCode = useCallback(async () => {
        if (!problem) return
        console.log('[FRONTEND] SUBMIT CODE BUTTON CLICKED')
        console.log('[FRONTEND] Problem ID:', problem._id)
        console.log('[FRONTEND] Problem testCaseCount:', problem.testCaseCount)
        console.log('[FRONTEND] Code length:', codeEditor.code.length)
        console.log('[FRONTEND] Language:', codeEditor.language)

        // 🔥 STORE THE SUBMITTED CODE FOR AI ANALYSIS
        execution.setLastSubmittedCode(codeEditor.code)
        execution.setLastSubmittedLanguage(codeEditor.language)

        execution.setIsSubmitting(true)
        execution.setConsoleTab('result')
        setIsConsoleOpen(true)

        const totalTestCases = problem.testCaseCount || 0
        console.log('[FRONTEND] Total test cases:', totalTestCases)

        execution.setTestResult({
            status: 'running',
            totalCount: totalTestCases,
            results: [],
            progress: 0,
            statusMessage: 'Queuing submission...',
        })

        // Client-side timeout: 20 seconds
        const submissionTimeout = setTimeout(() => {
            if (execution.isSubmitting) {
                execution.setTestResult((prev) => ({
                    ...prev,
                    status: 'error',
                    error: 'Server is taking longer than expected. Please check your internet or try again.',
                }))
                execution.setIsSubmitting(false)
                toast.error('Submission timeout')
            }
        }, 20000)

        try {
            // 🚀 CHECK CACHE: If code hasn't changed since last Run, use cached result
            const currentCodeHash = cache.generateCodeHash(codeEditor.code)
            console.log('[FRONTEND] Current code hash:', currentCodeHash)
            console.log('[FRONTEND] Cached code hash:', cache.cachedCodeHash)
            console.log('[FRONTEND] Cache exists?', !!cache.cachedResult)

            if (cache.cachedCodeHash === currentCodeHash && cache.cachedResult) {
                console.log('[FRONTEND] 🚀 CACHE HIT! Using cached execution result')

                execution.setTestResult({
                    ...cache.cachedResult,
                    totalCount: totalTestCases,
                })

                const res = await fetch('/api/submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problemId: problem._id,
                        code: codeEditor.code,
                        files: codeEditor.files.length > 1 ? codeEditor.files : undefined,
                        language: codeEditor.language,
                        type: 'submit',
                        contestId: contestId,
                        cachedResult: {
                            verdict: cache.cachedResult.verdict,
                            executionTime: cache.cachedResult.time || 0,
                            memoryUsed: cache.cachedResult.memory || 0,
                            output: cache.cachedResult.output || '',
                            error: cache.cachedResult.error || '',
                        },
                    }),
                })
                const data = await res.json()

                console.log('[FRONTEND] API Response (cached):', {
                    success: data.success,
                    submissionId: data.data?._id,
                })

                if (!data.success) {
                    console.error('[FRONTEND] Submission failed:', data.message)
                    toast.error(data.message || 'Submission failed')
                    execution.setTestResult({ status: 'error', error: data.message })
                    execution.setIsSubmitting(false)
                } else {
                    const submissionId = data.data._id || data.data.id
                    console.log(
                        '[FRONTEND] Submission created (from cache), joining room:',
                        `submission_${submissionId}`
                    )
                    // 💾 Save submission ID to Zustand for persistence
                    zustandStore.setSubmissionId(submissionId)
                    zustandStore.setSubmissionViewId(submissionId)
                    zustandStore.setCurrentPage('submission-details')
                    toast.success('Submission created!')
                    if (realtime.socket) {
                        realtime.socket.emit('join_room', `submission_${submissionId}`)
                    }
                    execution.setIsSubmitting(false)
                }
                return
            }

            // CACHE MISS: Execute fresh submission
            console.log('[FRONTEND] 🔄 CACHE MISS! Code has changed, executing fresh submission')
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemId: problem._id,
                    code: codeEditor.code,
                    files: codeEditor.files.length > 1 ? codeEditor.files : undefined,
                    language: codeEditor.language,
                    type: 'submit',
                    contestId: contestId,
                }),
            })
            const data = await res.json()

            console.log('[FRONTEND] API Response:', {
                success: data.success,
                submissionId: data.data?._id,
            })

            if (!data.success) {
                console.error('[FRONTEND] Submission failed:', data.message)
                toast.error(data.message || 'Submission failed')
                execution.setTestResult({ status: 'error', error: data.message })
                execution.setIsSubmitting(false)
            } else {
                const submissionId = data.data._id || data.data.id
                console.log(
                    '[FRONTEND] Submission created, joining room:',
                    `submission_${submissionId}`
                )
                // 💾 Save submission ID to Zustand for persistence
                zustandStore.setSubmissionId(submissionId)
                zustandStore.setSubmissionViewId(submissionId)
                zustandStore.setCurrentPage('submission-details')
                toast.success('Submission created!')
                if (realtime.socket) {
                    realtime.socket.emit('join_room', `submission_${submissionId}`)
                }
            }
        } catch (err) {
            console.error('[FRONTEND] SUBMIT CODE ERROR:', err)
            clearTimeout(submissionTimeout)
            execution.setTestResult({ status: 'error', error: err.message })
            execution.setIsSubmitting(false)
        }
    }, [
        codeEditor.code,
        codeEditor.language,
        codeEditor.files,
        problem?._id,
        problemId,
        problem?.testCaseCount,
        contestId,
    ])

    // ─── AI Feedback ─────────────────────────────────────────────────────────
    const fetchAiFeedback = useCallback(
        async (options = { switchTab: true }) => {
            // Get the code to analyze (prefer submitted code, fallback to last analyzed)
            const codeToAnalyze =
                execution.lastSubmittedCode || execution.lastAnalyzedCode || codeEditor.code
            const languageToAnalyze = execution.lastSubmittedLanguage || codeEditor.language

            // Create a hash of code for reliable comparison (ignoring whitespace differences)
            const codeHash = (code) => {
                return code?.trim().replace(/\s+/g, ' ') || ''
            }

            const currentCodeHash = codeHash(codeToAnalyze)
            const lastAnalyzedHash = codeHash(execution.lastAnalyzedCode)

            // Check if we already analyzed this exact code - no need to refetch
            if (
                currentCodeHash === lastAnalyzedHash &&
                execution.testResultData?.aiFeedback &&
                !execution.testResultData.aiFeedback.error
            ) {
                console.log(
                    '[FRONTEND] AI feedback already analyzed for this code submission, showing cached result'
                )
                if (options.switchTab) {
                    execution.setConsoleTab('ai')
                }
                return
            }

            console.log('[FRONTEND] New code detected, analyzing...')
            execution.setIsAiLoading(true)
            try {
                const res = await fetch('/api/evaluation/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: codeToAnalyze,
                        language: languageToAnalyze,
                        problemTitle: problem?.title || 'Code Challenge',
                        verdict: execution.testResult?.verdict || 'UNKNOWN',
                        executionTime: execution.testResult?.time || 0,
                        memoryUsed: execution.testResult?.memory || 0,
                    }),
                })
                const data = await res.json()
                if (data.success) {
                    // 🔥 MARK THIS CODE AS ANALYZED
                    execution.setLastAnalyzedCode(codeToAnalyze)
                    execution.setTestResultData({ aiFeedback: data.feedback })
                    // 💾 Save AI feedback to Zustand for persistence
                    zustandStore.setAiFeedback(data.feedback)
                    if (options.switchTab) {
                        execution.setConsoleTab('ai')
                    }
                } else {
                    execution.setTestResultData({
                        aiFeedback: { error: data.error || 'AI analysis failed' },
                    })
                }
            } catch (err) {
                console.error('AI feedback error:', err)
                execution.setTestResultData({ aiFeedback: { error: err.message } })
            } finally {
                execution.setIsAiLoading(false)
            }
        },
        [
            codeEditor.code,
            codeEditor.language,
            problem?.title,
            execution.testResult?.verdict,
            execution.testResult?.time,
            execution.testResult?.memory,
        ]
    )

    // ─── View Past Submission Details ──────────────────────────────────────
    const viewSubmissionDetails = useCallback(
        async (submissionId) => {
            try {
                const res = await fetch(`/api/submissions/${submissionId}`)
                const data = await res.json()
                if (data.success) {
                    const s = data.data
                    const verdict = (s.verdict || '').toUpperCase()
                    const isAccepted = verdict === 'ACCEPTED'

                    const mappedTestResults = (s.testCaseResults || []).map((tr) => ({
                        passed: tr.verdict === 'ACCEPTED',
                        actual: tr.actualOutput ?? '',
                        expected: '(Hidden)',
                    }))

                    execution.setTestResult({
                        status: 'done',
                        verdict: verdict,
                        passed: isAccepted,
                        passedCount:
                            s.testCaseResults?.filter((r) => r.verdict === 'ACCEPTED').length || 0,
                        totalCount: s.testCaseResults?.length || 0,
                        time: s.executionTime,
                        memory: s.memoryUsed,
                        results: mappedTestResults,
                        error: s.error,
                    })

                    if (s.type === 'submit') {
                        // 🔥 STORE THE SUBMISSION CODE FOR AI ANALYSIS
                        execution.setLastSubmittedCode(s.code)
                        execution.setLastSubmittedLanguage(s.language)

                        // 💾 Save submission details to Zustand for persistence
                        zustandStore.setSubmissionId(s._id)
                        zustandStore.setSubmissionDetails(s)
                        if (s.aiFeedback) {
                            zustandStore.setAiFeedback(s.aiFeedback)
                        }

                        realtime.setSubmissionResult({
                            id: s._id,
                            verdict: verdict,
                            passed: isAccepted,
                            passedCount:
                                s.testCaseResults?.filter((r) => r.verdict === 'ACCEPTED').length ||
                                0,
                            totalCount: s.testCaseResults?.length || 0,
                            time: s.executionTime,
                            memory: s.memoryUsed,
                            submittedCode: s.code,
                            submittedLanguage: s.language,
                            submittedAt: s.createdAt,
                            aiFeedback: s.aiFeedback,
                        })
                        setLeftTab('submission-result')

                        if (isAccepted) {
                            syncUser()
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch submission details:', err)
            } finally {
                execution.setIsSubmitting(false)
                execution.setIsRunning(false)
            }
        },
        [syncUser]
    )

    // ─── Socket.io Connection ──────────────────────────────────────────────
    useEffect(() => {
        if (!user || !(user._id || user.id)) return

        const userId = user._id || user.id
        const newSocket = io(`http://${window.location.hostname}:3002`)

        newSocket.on('connect', () => {
            console.log('[Socket] Connected to realtime server')
            newSocket.emit('join_room', userId)
            newSocket.emit('join_room', `problem:${problemId}`)
        })

        newSocket.on('test_case_completed', (data) => {
            console.log('[Socket] Test case completed:', data)
            if (data.submissionId) {
                execution.setTestResult((prev) => ({
                    ...prev,
                    status: 'running',
                    totalCount: data.totalTestCases || prev?.totalCount,
                    progress: data.progress,
                    progressMessage: data.message,
                    results: prev?.results
                        ? [...prev.results, { verdict: data.verdict, caseNumber: data.caseNumber }]
                        : [{ verdict: data.verdict, caseNumber: data.caseNumber }],
                }))
            }
        })

        newSocket.on('test_case_failed', (data) => {
            console.log('[Socket] Test case failed (fail-fast):', data)
            if (data.submissionId) {
                execution.setTestResult((prev) => ({
                    ...prev,
                    status: 'done',
                    verdict: data.verdict,
                    passed: false,
                    failedAtCase: data.caseNumber,
                    totalCount: data.totalTestCases,
                    progressMessage: data.message,
                }))
                execution.setIsSubmitting(false)
                toast.error(`Failed at test case ${data.caseNumber}`)
            }
        })

        newSocket.on('submission_status', (data) => {
            console.log('[Socket] Submission status:', data)
            if (data.problemId === problemId) {
                execution.setTestResult((prev) => ({
                    ...prev,
                    status: 'running',
                    statusMessage: data.message,
                    totalCount: data.totalTestCases || prev?.totalCount,
                    progress: data.progress || 0,
                }))
            }
        })

        newSocket.on('execution_completed', (data) => {
            console.log('[Socket] Execution completed:', data)
            if (data.submissionId) {
                execution.setTestResult({
                    status: 'done',
                    verdict: data.verdict,
                    passed: data.verdict === 'ACCEPTED',
                    time: data.executionTime,
                    memory: data.memoryUsed,
                    results: [{ actual: data.output, error: data.error }],
                    error: data.error,
                })
                execution.setIsRunning(false)
            }
        })

        newSocket.on('submission_update', (data) => {
            console.log('[Socket] Submission update:', data)
            realtime.setLatestSubmissionEvent(data)

            if (data.problemId === problemId) {
                // Handle new event types: 'run_result', 'submit_result'
                const isRunResult = data.type === 'run_result'
                const isSubmitResult = data.type === 'submit_result'
                const isEvaluated =
                    data.type === 'submission_evaluated' || isRunResult || isSubmitResult

                if (isEvaluated) {
                    // Clear timeout since verdict arrived
                    // Note: timeout is stored in closure, here we just mark it resolved

                    // 1. Immediately update execution result from socket data
                    if (isRunResult || isSubmitResult) {
                        execution.setTestResult({
                            status: 'done',
                            verdict: data.verdict,
                            passed: data.verdict === 'ACCEPTED' || data.verdict === 'EXECUTED',
                            time: data.executionTime,
                            memory: data.memoryUsed,
                            results: data.testResults || [],
                            totalCount: data.totalCount,
                            passedCount: data.passedCount,
                            error: data.error,
                        })
                        execution.setIsSubmitting(false)
                        execution.setIsRunning(false)
                    }

                    // 2. For submit_result, immediately set submission result and switch tab
                    if (isSubmitResult) {
                        // Set submission result for SubmissionResultTab
                        realtime.setSubmissionResult({
                            id: data.submissionId,
                            verdict: data.verdict,
                            passed: data.verdict === 'ACCEPTED',
                            passedCount: data.passedCount || 0,
                            totalCount: data.totalCount || 0,
                            time: data.executionTime,
                            memory: data.memoryUsed,
                            submittedCode: '(Loading...)',
                            submittedLanguage: 'Loading',
                            submittedAt: new Date().toISOString(),
                        })

                        // Switch to submission result tab
                        setLeftTab('submission-result')

                        // Asynchronously fetch full submission details
                        viewSubmissionDetails(data.submissionId).catch(console.error)
                    }

                    // 3. Show notifications
                    if (
                        data.verdict?.toUpperCase() === 'ACCEPTED' ||
                        data.verdict?.toUpperCase() === 'EXECUTED'
                    ) {
                        if (isSubmitResult) {
                            toast.success('Accepted!')
                        } else if (isRunResult) {
                            toast.success('Executed!')
                        }
                    } else if (data.status === 'error' || data.type === 'submission_error') {
                        toast.error(data.error || 'Evaluation Error')
                    } else if (data.verdict && !isRunResult) {
                        toast.error(data.verdict.replace(/_/g, ' '))
                    }
                }
            }
        })

        newSocket.on('reaction_update', (data) => {
            if (data.problemId === problemId) {
                // Reaction system component can listen directly
            }
        })

        realtime.setSocket(newSocket)
        return () => newSocket.disconnect()
    }, [user, problemId, viewSubmissionDetails, execution])

    const value = {
        // From CodeEditor context
        code: codeEditor.code,
        updateCode: codeEditor.updateCode,
        language: codeEditor.language,
        setLanguage: codeEditor.setLanguage,
        resetCode: codeEditor.resetCode,
        files: codeEditor.files,
        activeFileIndex: codeEditor.activeFileIndex,
        addFile: codeEditor.addFile,
        removeFile: codeEditor.removeFile,
        renameFile: codeEditor.renameFile,
        switchToFile: codeEditor.switchToFile,

        // From Execution context
        isRunning: execution.isRunning,
        isSubmitting: execution.isSubmitting,
        runCode,
        submitCode,
        consoleTab: execution.consoleTab,
        setConsoleTab: execution.setConsoleTab,
        testInput: execution.testInput,
        setTestInput: execution.setTestInput,
        testResult: execution.testResult,
        setTestResult: execution.setTestResult,
        activeTestCase: execution.activeTestCase,
        setActiveTestCase: execution.setActiveTestCase,
        testResultData: execution.testResultData,
        fetchAiFeedback,
        aiFeedback: execution.testResultData?.aiFeedback,
        isAiLoading: execution.isAiLoading,

        // From Realtime context
        socket: realtime.socket,
        latestSubmissionEvent: realtime.latestSubmissionEvent,
        submissionResult: realtime.submissionResult,
        viewSubmissionDetails,

        // From Cache context
        cachedCodeHash: cache.cachedCodeHash,
        cachedResult: cache.cachedResult,

        // Local UI state
        isConsoleOpen,
        setIsConsoleOpen,
        leftTab,
        setLeftTab,

        // Status
        isLoaded: codeEditor.isLoaded,

        // Problem context
        problem,
        problemId,
    }

    return <ProblemSolveContext.Provider value={value}>{children}</ProblemSolveContext.Provider>
}

// Main provider that wraps all sub-providers
export function ProblemSolveProvider({ children, problemId, initialCode, problem, contestId }) {
    return (
        <CodeEditorProvider initialCode={initialCode} problemId={problemId}>
            <ExecutionProvider>
                <RealtimeProvider>
                    <CacheProvider>
                        <ProblemSolveProviderInner
                            problemId={problemId}
                            initialCode={initialCode}
                            problem={problem}
                            contestId={contestId}
                        >
                            {children}
                        </ProblemSolveProviderInner>
                    </CacheProvider>
                </RealtimeProvider>
            </ExecutionProvider>
        </CodeEditorProvider>
    )
}

export function useProblemSolve() {
    const context = useContext(ProblemSolveContext)
    if (!context) {
        throw new Error('useProblemSolve must be used within a ProblemSolveProvider')
    }
    return context
}
