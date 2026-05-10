'use client'

import { useEffect } from 'react'
import { useSecureSocket } from '@/hooks/useSecureSocket'
import { toast } from 'sonner'

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
    onProblemSolved,
}) {
    const userId = user?._id || user?.id || null
    const { socket, isConnected } = useSecureSocket('/', { scope: 'submission' })

    // Join rooms and set up socket when connection is established
    useEffect(() => {
        if (!isConnected || !socket || !problemId) return

        console.log('[Socket] Connected to realtime server')
        console.log('[Socket] Socket ID:', socket.id)

        if (userId) {
            socket.emit('join_room', userId)
        }

        socket.emit('join_room', `problem:${problemId}`)

        // If there's an active submission, rejoin it after reconnection
        if (activeSubmissionRoomRef.current) {
            console.log(
                '[Socket] Rejoining active submission room:',
                activeSubmissionRoomRef.current
            )
            socket.emit('join_room', activeSubmissionRoomRef.current)
        }

        setSocket(socket)
    }, [isConnected, socket, userId, problemId, activeSubmissionRoomRef, setSocket])

    // Define event handlers
    useEffect(() => {
        if (!isConnected || !socket) return

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
                if (onProblemSolved && problemId) {
                    onProblemSolved(problemId)
                }
                // Recalculate stats (including activityCalendar) then refresh user
                fetch('/api/user/sync', { method: 'POST' })
                    .then((res) => res.json())
                    .then(() => syncUser())
                    .catch(console.error)
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
                socket.emit('leave_room', activeSubmissionRoomRef.current)
                activeSubmissionRoomRef.current = null
            }
        }

        socket.on('submission_status', (data) => {
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

        socket.on('judging_started', (data) => {
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

        socket.on('test_case_result', (data) => {
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

        // Backward-compatibility events while clients migrate
        socket.on('test_case_completed', (data) => {
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

        socket.on('test_case_failed', (data) => {
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

        socket.on('final_verdict', (data) => {
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

        socket.on('submission_room_close', (data) => {
            if (!data?.submissionId) return

            const roomId = `submission_${data.submissionId}`
            if (activeSubmissionRoomRef.current === roomId) {
                socket.emit('leave_room', roomId)
                activeSubmissionRoomRef.current = null
            }
        })

        socket.on('execution_completed', (data) => {
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

        socket.on('submission_update', (data) => {
            const lifecycleUpdateTypes = new Set([
                'submission_queued',
                'submission_running',
                'submission_evaluated',
                'submit_result',
                'run_result',
                'submission_error',
            ])

            if (!lifecycleUpdateTypes.has(data.type)) {
                return
            }

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

        socket.on('reaction_update', (data) => {
            if (data.problemId === problemId) {
                // Reaction system component can listen directly
            }
        })

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error)
        })

        socket.on('error', (error) => {
            console.error('[Socket] Socket error:', error)
        })

        socket.on('connect_timeout', () => {
            console.error('[Socket] Connection timeout')
        })

        // Clean up listeners on unmount
        return () => {
            socket.off('submission_status')
            socket.off('submission_room_close')
            socket.off('judging_started')
            socket.off('test_case_result')
            socket.off('test_case_completed')
            socket.off('test_case_failed')
            socket.off('final_verdict')
            socket.off('execution_completed')
            socket.off('submission_update')
            socket.off('reaction_update')
            socket.off('connect_error')
            socket.off('error')
            socket.off('connect_timeout')
        }
    }, [
        isConnected,
        socket,
        problemId,
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
        onProblemSolved,
    ])
}
