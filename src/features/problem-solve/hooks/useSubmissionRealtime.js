'use client'

import { useEffect } from 'react'
import { io } from 'socket.io-client'
import { toast } from 'sonner'

/**
 * useSubmissionRealtime Hook
 *
 * Manages real-time communication with the submission judging server via Socket.IO.
 * This hook handles the entire lifecycle of submission tracking, from initial submission
 * to final verdict, including live test case progress updates.
 *
 * ─── Architecture Overview ──────────────────────────────────────────────────────
 *
 * Connection Flow:
 * 1. Creates Socket.IO connection to realtime server (port 3002)
 * 2. Joins user-specific room for notifications
 * 3. Joins problem-specific room for context
 * 4. Joins submission-specific room when code is submitted
 *
 * Socket Events Received:
 * - submission_status: Live progress during judging (case-by-case updates)
 * - judging_started: Notification that judging has begun
 * - test_case_result: Individual test case completion
 * - test_case_result_batched: Batched test case results (optimized)
 * - final_verdict: Final submission result (ACCEPTED, WA, TLE, etc.)
 * - execution_completed: Direct execution (Run button) results
 * - submission_update: General submission state updates
 *
 * Socket Events Sent:
 * - join_room: Subscribe to a specific room (user, problem, submission)
 * - leave_room: Unsubscribe from a room when switching problems
 *
 * ─── Submission Lifecycle ───────────────────────────────────────────────────────
 *
 * 1. User clicks "Submit" → POST /api/submissions
 * 2. API creates submission record, returns submissionId
 * 3. Frontend joins `submission_${submissionId}` room
 * 4. Backend worker picks up submission, emits `judging_started`
 * 5. Worker processes test cases, emits `test_case_result` for each
 * 6. Worker completes all cases, emits `final_verdict`
 * 7. Frontend displays results, navigates to submission details
 *
 * ─── Retry Logic ────────────────────────────────────────────────────────────────
 *
 * Socket room joining uses exponential backoff retry:
 * - Max attempts: 50
 * - Retry delay: 100ms
 * - Total timeout: ~5 seconds before giving up
 *
 * Fallback polling:
 * - If no final verdict within 30 seconds, poll /api/submissions/:id
 * - Ensures users get results even if socket events are lost
 *
 * ─── State Management ───────────────────────────────────────────────────────────
 *
 * Uses refs to track:
 * - activeSubmissionRoomRef: Current submission room to avoid duplicate handling
 * - finalVerdictHandledRef: Prevents processing duplicate final_verdict events
 * - lastFinalSubmissionIdRef: Tracks last processed submission for deduplication
 *
 * @param {Object} params - Hook parameters
 * @param {Object} params.user - Current authenticated user
 * @param {string} params.problemId - ID of the problem being solved
 * @param {Function} params.setSocket - Setter for socket instance
 * @param {Function} params.setLatestSubmissionEvent - Setter for latest event
 * @param {Function} params.setSubmissionResult - Setter for submission results
 * @param {Function} params.setIsSubmitting - Setter for submitting state
 * @param {Function} params.setIsRunning - Setter for running state
 * @param {Function} params.setTestResult - Setter for test result state
 * @param {Function} params.viewSubmissionDetails - Function to fetch submission details
 * @param {Function} params.setLeftTab - Function to switch left panel tabs
 * @param {Function} params.syncUser - Function to sync user stats after acceptance
 * @param {Object} params.activeSubmissionRoomRef - Ref tracking active submission room
 * @param {Object} params.finalVerdictHandledRef - Ref preventing duplicate verdicts
 * @param {Object} params.lastFinalSubmissionIdRef - Ref for submission deduplication
 *
 * @returns {void}
 */

/**
 * Get stage badge text for submission progress
 *
 * Maps internal stage names to user-friendly status messages.
 *
 * @param {string} stage - Current judging stage
 * @param {number} currentCase - Current test case number (1-indexed)
 * @param {number} totalCount - Total number of test cases
 * @returns {string} Formatted status badge text
 */
function getStageBadge(stage, currentCase, totalCount) {
    if (stage === 'compile' || stage === 'compiling' || stage === 'queued') {
        return '[ ⟳ ] Compiling...'
    }

    if (stage === 'judging_started') {
        stage = 'running'
    }

    if (stage === 'running') {
        const current = currentCase || 0
        const total = totalCount || 0
        if (current > 0 && total > 0) {
            return `[ ⚙ ] Running Case ${current}/${total}...`
        }
        return '[ ⚙ ] Running Cases...'
    }

    if (stage === 'finalizing' || stage === 'finalized') {
        return '[ ✓ ] Finalizing Results...'
    }

    return '[ ⟳ ] Compiling...'
}

export function useSubmissionRealtime({
    user,
    problemId,
    setSocket,
    setLatestSubmissionEvent,
    setSubmissionResult,
    setIsSubmitting,
    setIsRunning,
    setTestResult,
    viewSubmissionDetails,
    setLeftTab,
    syncUser,
    activeSubmissionRoomRef,
    finalVerdictHandledRef,
    lastFinalSubmissionIdRef,
}) {
    const userId = user?._id || user?.id || null

    useEffect(() => {
        if (!problemId) return

        console.log(
            '[Socket] Creating socket connection to http://' + window.location.hostname + ':3002'
        )
        const newSocket = io(`http://${window.location.hostname}:3002`)

        newSocket.on('connect', () => {
            console.log('[Socket] ✓ Connected to realtime server on port 3002')
            console.log('[Socket] Socket ID:', newSocket.id)
            console.log('[Socket] Socket connected property:', newSocket.connected)

            if (userId) {
                newSocket.emit('join_room', userId)
            }

            newSocket.emit('join_room', `problem:${problemId}`)

            // If there's an active submission, rejoin it after reconnection
            if (activeSubmissionRoomRef.current) {
                console.log(
                    '[Socket] Rejoining active submission room:',
                    activeSubmissionRoomRef.current
                )
                newSocket.emit('join_room', activeSubmissionRoomRef.current)
            }
        })

        newSocket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected from realtime server:', reason)
        })

        const isCurrentSubmissionEvent = (submissionId, eventProblemId) => {
            // First priority: match exact submission if actively waiting for one
            if (activeSubmissionRoomRef.current && submissionId) {
                const matches = activeSubmissionRoomRef.current === `submission_${submissionId}`
                if (!matches) {
                    console.log('[Socket] Event submission ID mismatch:', {
                        expecting: activeSubmissionRoomRef.current,
                        got: submissionId,
                    })
                }
                return matches
            }

            // Fallback: if no active submission room, match by problem ID
            if (eventProblemId) {
                return eventProblemId === problemId
            }

            // Last resort: if both IDs are missing, process it (legacy events)
            return !submissionId && !eventProblemId
        }

        const updateRunningState = (data = {}) => {
            const totalCount = data.total ?? data.totalCount ?? data.totalTestCases
            const currentCase = data.current ?? data.currentCase ?? data.caseNumber
            const progressByCase =
                totalCount && currentCase ? Math.round((currentCase / totalCount) * 100) : undefined
            const normalizedStatus = String(data.status || 'running').toLowerCase()
            const stage = data.stage || (normalizedStatus === 'failed' ? 'finalizing' : 'running')

            setTestResult((prev) => {
                const prevResults = prev?.results || []
                const hasCaseNumber = Number.isFinite(Number(currentCase))
                const normalizedCaseNumber = hasCaseNumber ? Number(currentCase) : null

                let nextResults = prevResults
                if (normalizedCaseNumber !== null) {
                    const filteredResults = prevResults.filter(
                        (item) => Number(item.caseNumber) !== normalizedCaseNumber
                    )
                    nextResults = [
                        ...filteredResults,
                        {
                            caseNumber: normalizedCaseNumber,
                            verdict: data.verdict,
                            status: normalizedStatus,
                            executionTime: data.executionTime,
                            memoryUsed: data.memoryUsed,
                        },
                    ].sort((a, b) => Number(a.caseNumber) - Number(b.caseNumber))
                }

                const resolvedTotalCount = totalCount || prev?.totalCount || 0
                const resolvedCurrentCase =
                    (normalizedCaseNumber !== null ? normalizedCaseNumber : prev?.currentCase) || 0
                const resolvedProgress =
                    data.progress ??
                    progressByCase ??
                    prev?.progress ??
                    (resolvedTotalCount > 0
                        ? Math.round((resolvedCurrentCase / resolvedTotalCount) * 100)
                        : 0)

                return {
                    ...prev,
                    status: 'running',
                    stage,
                    stageBadge:
                        data.stageBadge ||
                        getStageBadge(stage, resolvedCurrentCase, resolvedTotalCount),
                    currentCase: resolvedCurrentCase,
                    totalCount: resolvedTotalCount,
                    progress: resolvedProgress,
                    statusMessage: data.message || prev?.statusMessage,
                    progressMessage: data.message || prev?.progressMessage,
                    failedAtCase:
                        data.failedAtCase ||
                        (normalizedStatus === 'failed' ? resolvedCurrentCase : prev?.failedAtCase),
                    results: nextResults,
                    verdict: data.verdict || prev?.verdict,
                    time: data.executionTime ?? prev?.time,
                    memory: data.memoryUsed ?? prev?.memory,
                }
            })
        }

        const finalizeSubmission = (data, source = 'final_verdict') => {
            const submissionId = data.submissionId
            if (!submissionId) {
                console.warn('[Socket] Cannot finalize: missing submissionId')
                return
            }

            if (!isCurrentSubmissionEvent(submissionId, data.problemId)) {
                console.log('[Socket] Ignoring event for different submission:', { submissionId })
                return
            }

            if (lastFinalSubmissionIdRef.current === submissionId) {
                console.log('[Socket] Final verdict already processed for this submission')
                return
            }

            const verdict = data.verdict || 'ERROR'
            const totalCount = data.total ?? data.totalCount
            const failedAtCase = data.failedAtCase || data.failedCase || data.caseNumber

            lastFinalSubmissionIdRef.current = submissionId
            finalVerdictHandledRef.current = true

            console.log('[Socket] Finalizing submission with verdict:', verdict)

            setTestResult((prev) => {
                const resolvedTotal = totalCount || prev?.totalCount || 0
                const failedProgress =
                    failedAtCase && resolvedTotal > 0
                        ? Math.round((Number(failedAtCase) / Number(resolvedTotal)) * 100)
                        : prev?.progress || 100

                return {
                    ...prev,
                    status: 'done',
                    stage: 'finalized',
                    stageBadge: '[ ✓ ] Finalizing Results...',
                    verdict,
                    passed: verdict === 'ACCEPTED' || verdict === 'EXECUTED',
                    passedCount: data.passedCount ?? prev?.passedCount ?? 0,
                    totalCount: resolvedTotal,
                    failedAtCase: failedAtCase || prev?.failedAtCase,
                    progress:
                        verdict === 'ACCEPTED' || verdict === 'EXECUTED' ? 100 : failedProgress,
                    progressMessage: data.message || prev?.progressMessage,
                    statusMessage: data.message || `Verdict: ${verdict}`,
                    time: data.executionTime ?? prev?.time,
                    memory: data.memoryUsed ?? prev?.memory,
                    error: data.error ?? prev?.error,
                }
            })

            setIsSubmitting(false)
            setIsRunning(false)

            if (source === 'run_result') {
                if (verdict === 'EXECUTED' || verdict === 'ACCEPTED') {
                    toast.success('Executed!')
                } else if (verdict) {
                    toast.error(verdict.replace(/_/g, ' '))
                }
                return
            }

            if (verdict === 'ACCEPTED') {
                toast.success('Accepted!')
                syncUser()
            } else if (data.status === 'error' || verdict === 'ERROR') {
                toast.error(data.error || 'Evaluation Error')
            } else {
                toast.error(verdict.replace(/_/g, ' '))
            }

            setSubmissionResult({
                id: submissionId,
                verdict,
                passed: verdict === 'ACCEPTED',
                passedCount: data.passedCount || 0,
                totalCount: totalCount || 0,
                time: data.executionTime,
                memory: data.memoryUsed,
                submittedCode: '(Loading...)',
                submittedLanguage: 'Loading',
                submittedAt: new Date().toISOString(),
            })

            setLeftTab('submission-result')
            viewSubmissionDetails(submissionId).catch(console.error)

            if (activeSubmissionRoomRef.current === `submission_${submissionId}`) {
                console.log('[Socket] Leaving submission room:', activeSubmissionRoomRef.current)
                newSocket.emit('leave_room', activeSubmissionRoomRef.current)
                activeSubmissionRoomRef.current = null
            }
        }

        newSocket.on('submission_status', (data) => {
            console.log('[Socket] Submission status received:', {
                submissionId: data.submissionId,
                stage: data.stage,
                verdict: data.verdict,
                progress: data.progress,
                status: data.status,
                message: data.message,
                allData: data,
            })

            if (!isCurrentSubmissionEvent(data.submissionId, data.problemId)) {
                console.log('[Socket] Ignoring event - not for current submission')
                return
            }

            const rawStage = data.stage || 'running'
            const stage = rawStage === 'judging_started' ? 'running' : rawStage
            const currentCase = data.current ?? data.caseNumber
            const totalCount = data.total ?? data.totalCount ?? data.totalTestCases

            updateRunningState({
                ...data,
                stage,
                currentCase,
                totalCount,
                stageBadge: getStageBadge(stage, currentCase, totalCount),
            })
        })

        newSocket.on('judging_started', (data) => {
            console.log('[Socket] Judging started:', data)

            if (!isCurrentSubmissionEvent(data.submissionId, data.problemId)) {
                return
            }

            setIsSubmitting(true)
            updateRunningState({
                ...data,
                stage: 'running',
                stageBadge: getStageBadge('running', 0, data.total),
                progress: 0,
            })
        })

        newSocket.on('test_case_result', (data) => {
            console.log('[Socket] Test case result:', data)

            if (!isCurrentSubmissionEvent(data.submissionId, data.problemId)) {
                return
            }

            const normalizedStatus = String(data.status || '').toLowerCase()
            const totalCount = data.total ?? data.totalCount
            const currentCase = data.current ?? data.caseNumber
            const failedAtCase =
                data.failedAtCase ||
                data.failedCase ||
                (normalizedStatus === 'failed' ? currentCase : null)
            const stage = normalizedStatus === 'failed' ? 'finalizing' : data.stage || 'running'

            updateRunningState({
                ...data,
                totalCount,
                currentCase,
                failedAtCase,
                stage,
                stageBadge: getStageBadge(stage, currentCase, totalCount),
            })

            if (normalizedStatus === 'failed' && currentCase) {
                toast.error(`Failed at test case ${currentCase}`)
            }
        })

        // Optimized batched test case result (new format)
        newSocket.on('test_case_result_batched', (data) => {
            console.log('[Socket] Test case result (batched):', data)

            if (!isCurrentSubmissionEvent(data.submissionId, data.problemId)) {
                return
            }

            const normalizedStatus = String(data.status || '').toLowerCase()
            const totalCount = data.total ?? data.totalCount
            const currentCase = data.current ?? data.caseNumber
            const failedAtCase =
                data.failedAtCase ||
                data.failedCase ||
                (normalizedStatus === 'failed' ? currentCase : null)
            const stage = normalizedStatus === 'failed' ? 'finalizing' : data.stage || 'running'

            updateRunningState({
                ...data,
                totalCount,
                currentCase,
                failedAtCase,
                stage,
                stageBadge: getStageBadge(stage, currentCase, totalCount),
            })

            if (normalizedStatus === 'failed' && currentCase) {
                toast.error(`Failed at test case ${currentCase}`)
            }
        })

        // Backward-compatibility events while clients migrate
        newSocket.on('test_case_completed', (data) => {
            console.log('[Socket] Test case completed:', data)

            if (!isCurrentSubmissionEvent(data.submissionId, data.problemId)) {
                return
            }

            updateRunningState({
                ...data,
                status: 'running',
                current: data.caseNumber,
                total: data.totalTestCases,
                stage: 'running',
                stageBadge: getStageBadge('running', data.caseNumber, data.totalTestCases),
            })
        })

        newSocket.on('test_case_failed', (data) => {
            console.log('[Socket] Test case failed (fail-fast):', data)

            if (!isCurrentSubmissionEvent(data.submissionId, data.problemId)) {
                return
            }

            updateRunningState({
                ...data,
                status: 'failed',
                current: data.caseNumber,
                total: data.totalTestCases,
                failedAtCase: data.caseNumber,
                stage: 'finalizing',
                stageBadge: getStageBadge('finalizing', data.caseNumber, data.totalTestCases),
            })

            if (data.caseNumber) {
                toast.error(`Failed at test case ${data.caseNumber}`)
            }
        })

        newSocket.on('final_verdict', (data) => {
            console.log('[Socket] Final verdict received:', data)
            console.log('[Socket] Current active room:', activeSubmissionRoomRef.current)
            console.log('[Socket] Event submission ID:', data.submissionId)

            // Ensure we're handling the right submission
            if (!data.submissionId) {
                console.warn('[Socket] Final verdict missing submissionId')
                return
            }

            finalizeSubmission(data, 'final_verdict')
        })

        newSocket.on('submission_room_close', (data) => {
            if (!data?.submissionId) return

            const roomId = `submission_${data.submissionId}`
            if (activeSubmissionRoomRef.current === roomId) {
                newSocket.emit('leave_room', roomId)
                activeSubmissionRoomRef.current = null
            }
        })

        newSocket.on('execution_completed', (data) => {
            console.log('[Socket] Execution completed:', data)

            if (data.submissionId) {
                finalizeSubmission(data, 'run_result')
                return
            }

            setTestResult({
                status: 'done',
                verdict: data.verdict,
                passed: data.verdict === 'ACCEPTED' || data.verdict === 'EXECUTED',
                time: data.executionTime,
                memory: data.memoryUsed,
                results: [{ actual: data.output, error: data.error }],
                error: data.error,
            })
            setIsRunning(false)
            setIsSubmitting(false)
        })

        newSocket.on('submission_update', (data) => {
            console.log('[Socket] Submission update:', data)
            setLatestSubmissionEvent(data)

            if (!isCurrentSubmissionEvent(data.submissionId, data.problemId)) {
                return
            }

            const isRunResult = data.type === 'run_result'
            const isSubmitResult = data.type === 'submit_result'

            if (isRunResult) {
                console.log('[Socket] Run result received, updating test result')
                setTestResult((prev) => ({
                    ...prev,
                    status: 'done',
                    stage: 'finalized',
                    stageBadge: '[ ✓ ] Results Ready',
                    verdict: data.verdict,
                    passed: data.verdict === 'ACCEPTED' || data.verdict === 'EXECUTED',
                    time: data.executionTime,
                    memory: data.memoryUsed,
                    results: data.testResults || prev?.results || [],
                    totalCount: data.totalCount || prev?.totalCount || 0,
                    passedCount: data.passedCount ?? prev?.passedCount,
                    error: data.error,
                    progress: 100,
                }))
                setIsSubmitting(false)
                setIsRunning(false)

                if (data.verdict?.toUpperCase() === 'EXECUTED') {
                    toast.success('Executed!')
                } else if (data.verdict && data.verdict.toUpperCase() !== 'ACCEPTED') {
                    toast.error(data.verdict.replace(/_/g, ' '))
                }
                return
            }

            if (isSubmitResult) {
                console.log('[Socket] Submit result received, finalizing')
                finalizeSubmission(data, 'submit_result')
                return
            }

            if (data.status === 'error' || data.type === 'submission_error') {
                console.error('[Socket] Submission error:', data.error)
                setIsSubmitting(false)
                setIsRunning(false)
                setTestResult((prev) => ({
                    ...prev,
                    status: 'error',
                    error: data.error || 'Evaluation Error',
                }))
                toast.error(data.error || 'Evaluation Error')
            }
        })

        newSocket.on('reaction_update', (data) => {
            if (data.problemId === problemId) {
                // Reaction system component can listen directly
            }
        })

        newSocket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error)
        })

        newSocket.on('error', (error) => {
            console.error('[Socket] Socket error:', error)
        })

        newSocket.on('connect_timeout', () => {
            console.error('[Socket] Connection timeout')
        })

        setSocket(newSocket)
        return () => {
            setSocket(null)
            newSocket.disconnect()
        }
    }, [
        userId,
        problemId,
        setSocket,
        setLatestSubmissionEvent,
        setSubmissionResult,
        setIsSubmitting,
        setIsRunning,
        setTestResult,
        viewSubmissionDetails,
        setLeftTab,
        syncUser,
        activeSubmissionRoomRef,
        finalVerdictHandledRef,
        lastFinalSubmissionIdRef,
    ])
}
