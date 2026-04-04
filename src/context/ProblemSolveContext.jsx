'use client'

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from 'react'
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
import { useSubmissionRealtime } from '@/features/problem-solve/hooks/useSubmissionRealtime'

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
function ProblemSolveProviderInner({
    children,
    problemId,
    initialCode,
    problem,
    contestId,
    disableAI,
    mode,
    onProblemSolved,
}) {
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
    const activeSubmissionRoomRef = useRef(null)
    const finalVerdictHandledRef = useRef(false)
    const lastFinalSubmissionIdRef = useRef(null)
    const realtimeSocketRef = useRef(null)

    useEffect(() => {
        realtimeSocketRef.current = realtime.socket
    }, [realtime.socket])

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
            execution.setLastAnalyzedVerdict('')

            if (realtime.socket && activeSubmissionRoomRef.current) {
                realtime.socket.emit('leave_room', activeSubmissionRoomRef.current)
            }

            activeSubmissionRoomRef.current = null
            finalVerdictHandledRef.current = false
            lastFinalSubmissionIdRef.current = null
            cache.clearCache()
            setIsConsoleOpen(true)
            setLeftTabState(readSavedLeftTab(problemId))

            prevProblemIdRef.current = problemId
        }
    }, [problemId])

    // Initialize test input from problem
    const firstSampleTestInput = problem?.sampleTestCases?.[0]?.input || ''
    const setTestInput = execution.setTestInput

    useEffect(() => {
        if (!problem?.sampleTestCases?.length) return
        setTestInput(firstSampleTestInput)
    }, [problemId, firstSampleTestInput, setTestInput])

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
            currentCase: 0,
            stage: 'queued',
            stageBadge: '[ ⟳ ] Compiling...',
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
                    const roomId = `submission_${submissionId}`

                    // Join submission room with retry logic and latest socket instance.
                    let joinAttempts = 0
                    const maxAttempts = 50
                    const attemptJoinRoom = () => {
                        joinAttempts++
                        const socket = realtimeSocketRef.current
                        const socketConnected = Boolean(socket?.connected)
                        const socketId = socket?.id

                        console.log(
                            `[FRONTEND] Join attempt ${joinAttempts} (cached): socket.connected=${socketConnected}, socket.id=${socketId}, roomId=${roomId}`
                        )

                        if (socketConnected && socket) {
                            console.log(
                                '[FRONTEND] Socket connected (cached), emitting join_room event'
                            )
                            if (activeSubmissionRoomRef.current) {
                                console.log(
                                    '[FRONTEND] Leaving previous room (cached):',
                                    activeSubmissionRoomRef.current
                                )
                                socket.emit('leave_room', activeSubmissionRoomRef.current)
                            }

                            console.log('[FRONTEND] Emitting join_room for (cached):', roomId)
                            socket.emit('join_room', roomId)
                            activeSubmissionRoomRef.current = roomId
                            finalVerdictHandledRef.current = false
                            lastFinalSubmissionIdRef.current = null
                            return
                        }

                        if (joinAttempts < maxAttempts) {
                            setTimeout(attemptJoinRoom, 100)
                            return
                        }

                        console.error(
                            '[FRONTEND] Failed to join submission room (cached) after',
                            maxAttempts,
                            'attempts. Socket state:',
                            {
                                socketExists: Boolean(socket),
                                socketConnected,
                                socketId,
                            }
                        )
                    }
                    attemptJoinRoom()
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
                const roomId = `submission_${submissionId}`

                // Join submission room with retry logic using socket.connected
                let joinAttempts = 0
                const maxAttempts = 50
                const attemptJoinRoom = () => {
                    joinAttempts++
                    const socket = realtimeSocketRef.current
                    const socketConnected = Boolean(socket?.connected)
                    const socketId = socket?.id
                    console.log(
                        `[FRONTEND] Join attempt ${joinAttempts}: socket.connected=${socketConnected}, socket.id=${socketId}, roomId=${roomId}`
                    )

                    if (socketConnected && socket) {
                        console.log('[FRONTEND] Socket connected, emitting join_room event')
                        if (activeSubmissionRoomRef.current) {
                            console.log(
                                '[FRONTEND] Leaving previous room:',
                                activeSubmissionRoomRef.current
                            )
                            socket.emit('leave_room', activeSubmissionRoomRef.current)
                        }
                        console.log('[FRONTEND] Emitting join_room for:', roomId)
                        socket.emit('join_room', roomId)
                        activeSubmissionRoomRef.current = roomId
                        finalVerdictHandledRef.current = false
                        lastFinalSubmissionIdRef.current = null
                        return
                    } else if (joinAttempts < maxAttempts) {
                        setTimeout(attemptJoinRoom, 100)
                        return
                    } else {
                        console.error(
                            '[FRONTEND] Failed to join submission room after',
                            maxAttempts,
                            'attempts. Socket state:',
                            {
                                socketExists: Boolean(socket),
                                socketConnected,
                                socketId,
                            }
                        )
                    }
                }
                attemptJoinRoom()

                // 🔄 FALLBACK: Poll submission status after 30 seconds if no final verdict received
                setTimeout(() => {
                    if (!finalVerdictHandledRef.current) {
                        console.log(
                            '[FRONTEND] No final verdict received within 30s, polling status for submission:',
                            submissionId
                        )
                        fetch(`/api/submissions/${submissionId}`)
                            .then((res) => res.json())
                            .then((pollData) => {
                                if (pollData.success && pollData.data) {
                                    const s = pollData.data
                                    const verdict = (s.verdict || '').toUpperCase()
                                    console.log('[FRONTEND] Polled submission status:', verdict)

                                    if (verdict && verdict !== 'PENDING') {
                                        // Update status indicators if solved
                                        if (verdict === 'ACCEPTED' && onProblemSolved) {
                                            onProblemSolved(problemId)
                                        }

                                        // Update testResult with the actual verdict
                                        execution.setTestResult({
                                            status: 'done',
                                            verdict: verdict,
                                            passed:
                                                verdict === 'ACCEPTED' || verdict === 'EXECUTED',
                                            passedCount: (s.testCaseResults || []).filter(
                                                (r) => r.verdict === 'ACCEPTED'
                                            ).length,
                                            totalCount: s.testCaseResults?.length || 0,
                                            time: s.executionTime,
                                            memory: s.memoryUsed,
                                            results: (s.testCaseResults || []).map((tr) => ({
                                                passed: tr.verdict === 'ACCEPTED',
                                                actual: tr.actualOutput ?? '',
                                                expected: '(Hidden)',
                                            })),
                                            error: s.error,
                                        })
                                        execution.setIsSubmitting(false)
                                    }
                                }
                            })
                            .catch((err) => console.error('[FRONTEND] Status poll error:', err))
                    }
                }, 30000)
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
        onProblemSolved,
    ])

    // ─── AI Feedback ─────────────────────────────────────────────────────────
    const fetchAiFeedback = useCallback(
        async (options = { switchTab: true }) => {
            if (disableAI) {
                log.info('AI feedback is disabled in this mode')
                toast.info('AI features are disabled during contests')
                return
            }
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
            const currentVerdict = (execution.testResult?.verdict || 'UNKNOWN').toUpperCase()
            const lastAnalyzedVerdict = (execution.lastAnalyzedVerdict || '').toUpperCase()

            // Reuse cached AI feedback only when both code AND verdict context match.
            if (
                currentCodeHash === lastAnalyzedHash &&
                currentVerdict === lastAnalyzedVerdict &&
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
                    execution.setLastAnalyzedVerdict(currentVerdict)
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
            execution.lastSubmittedCode,
            execution.lastSubmittedLanguage,
            execution.lastAnalyzedCode,
            execution.lastAnalyzedVerdict,
            execution.testResultData?.aiFeedback,
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

                        if (isAccepted && onProblemSolved) {
                            onProblemSolved(problemId)
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
        [syncUser, onProblemSolved, problemId]
    )

    useSubmissionRealtime({
        user,
        problemId,
        setSocket: realtime.setSocket,
        setLatestSubmissionEvent: realtime.setLatestSubmissionEvent,
        setSubmissionResult: realtime.setSubmissionResult,
        setIsSubmitting: execution.setIsSubmitting,
        setIsRunning: execution.setIsRunning,
        setTestResult: execution.setTestResult,
        viewSubmissionDetails,
        setLeftTab,
        syncUser,
        activeSubmissionRoomRef,
        finalVerdictHandledRef,
        lastFinalSubmissionIdRef,
        onProblemSolved,
    })

    const value = useMemo(
        () => ({
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
            setSubmissionResult: realtime.setSubmissionResult,
            viewSubmissionDetails,

            // From Cache context
            cachedCodeHash: cache.cachedCodeHash,
            cachedResult: cache.cachedResult,

            // Local UI state
            isConsoleOpen,
            setIsConsoleOpen,
            leftTab,
            setLeftTab,

            // Problem context
            problem,
            problemId,
            disableAI,
            mode,
        }),
        [
            codeEditor.code,
            codeEditor.updateCode,
            codeEditor.language,
            codeEditor.setLanguage,
            codeEditor.resetCode,
            codeEditor.files,
            codeEditor.activeFileIndex,
            codeEditor.addFile,
            codeEditor.removeFile,
            codeEditor.renameFile,
            codeEditor.switchToFile,
            execution.isRunning,
            execution.isSubmitting,
            runCode,
            submitCode,
            execution.consoleTab,
            execution.setConsoleTab,
            execution.testInput,
            execution.setTestInput,
            execution.testResult,
            execution.setTestResult,
            execution.activeTestCase,
            execution.setActiveTestCase,
            execution.testResultData,
            fetchAiFeedback,
            execution.isAiLoading,
            realtime.socket,
            realtime.latestSubmissionEvent,
            realtime.submissionResult,
            viewSubmissionDetails,
            cache.cachedCodeHash,
            cache.cachedResult,
            isConsoleOpen,
            leftTab,
            setLeftTab,
            problem,
            problemId,
            disableAI,
            mode,
        ]
    )

    return <ProblemSolveContext.Provider value={value}>{children}</ProblemSolveContext.Provider>
}

// Main provider that wraps all sub-providers
export function ProblemSolveProvider({
    children,
    problemId,
    initialCode,
    problem,
    contestId,
    disableAI = false,
    mode = 'practice',
    onProblemSolved,
}) {
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
                            disableAI={disableAI}
                            mode={mode}
                            onProblemSolved={onProblemSolved}
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
