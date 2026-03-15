'use client'

import { useEffect } from 'react'
import { io } from 'socket.io-client'
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
}) {
    useEffect(() => {
        if (!user || !(user._id || user.id)) return

        const userId = user._id || user.id
        const newSocket = io(`http://${window.location.hostname}:3002`)

        newSocket.on('connect', () => {
            console.log('[Socket] Connected to realtime server')
            newSocket.emit('join_room', userId)
            newSocket.emit('join_room', `problem:${problemId}`)
        })

        const isCurrentSubmissionEvent = (submissionId, eventProblemId) => {
            if (submissionId && activeSubmissionRoomRef.current) {
                return activeSubmissionRoomRef.current === `submission_${submissionId}`
            }

            if (eventProblemId) {
                return eventProblemId === problemId
            }

            return true
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
            if (!submissionId || !isCurrentSubmissionEvent(submissionId, data.problemId)) {
                return
            }

            if (lastFinalSubmissionIdRef.current === submissionId) {
                return
            }

            const verdict = data.verdict || 'ERROR'
            const totalCount = data.total ?? data.totalCount
            const failedAtCase = data.failedAtCase || data.failedCase || data.caseNumber

            lastFinalSubmissionIdRef.current = submissionId
            finalVerdictHandledRef.current = true

            setTestResult((prev) => {
                const resolvedTotal = totalCount || prev?.totalCount || 0
                const failedProgress =
                    failedAtCase && resolvedTotal > 0
                        ? Math.round((Number(failedAtCase) / Number(resolvedTotal)) * 100)
                        : prev?.progress || 0

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
                    statusMessage: data.message || prev?.statusMessage,
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
                newSocket.emit('leave_room', activeSubmissionRoomRef.current)
                activeSubmissionRoomRef.current = null
            }
        }

        newSocket.on('submission_status', (data) => {
            console.log('[Socket] Submission status:', data)

            if (!isCurrentSubmissionEvent(data.submissionId, data.problemId)) {
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
            console.log('[Socket] Final verdict:', data)
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
                setTestResult((prev) => ({
                    ...prev,
                    status: 'done',
                    stage: 'finalized',
                    stageBadge: '[ ✓ ] Finalizing Results...',
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
                finalizeSubmission(data, 'submit_result')
                return
            }

            if (data.status === 'error' || data.type === 'submission_error') {
                setIsSubmitting(false)
                setIsRunning(false)
                toast.error(data.error || 'Evaluation Error')
            }
        })

        newSocket.on('reaction_update', (data) => {
            if (data.problemId === problemId) {
                // Reaction system component can listen directly
            }
        })

        setSocket(newSocket)
        return () => newSocket.disconnect()
    }, [
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
    ])
}
