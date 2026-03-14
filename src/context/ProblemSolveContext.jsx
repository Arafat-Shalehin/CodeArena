'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const ProblemSolveContext = createContext()

// ─── Constants ────────────────────────────────────────────────────────────────

const STARTER_CODES = {
    python: `# Write your solution here
import sys
input = sys.stdin.readline

`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    
    return 0;
}
`,
    java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        sc.close();
    }
}
`,
    javascript: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    
});
`,
}

const LANG_LABELS = {
    python: 'Python 3',
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript',
}

export { STARTER_CODES, LANG_LABELS }

export function ProblemSolveProvider({ children, problemId, initialCode, problem, contestId }) {
    const { user, syncUser } = useAuth()
    // Core code state
    const [code, setCode] = useState(initialCode || '')
    const [language, setLanguage] = useState('python')

    // Multi-file state
    const [files, setFiles] = useState([
        { filename: 'solution.py', content: initialCode || '', isMain: true },
    ])
    const [activeFileIndex, setActiveFileIndex] = useState(0)

    // Execution state
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [consoleTab, setConsoleTab] = useState('testcase') // testcase, result, ai
    const [testInput, setTestInput] = useState('')
    const [testResult, setTestResult] = useState(null)
    const [activeTestCase, setActiveTestCase] = useState(0)

    // AI state
    const [aiFeedback, setAiFeedback] = useState(null)
    const [isAiLoading, setIsAiLoading] = useState(false)

    // Console visibility
    const [isConsoleOpen, setIsConsoleOpen] = useState(true)

    // Left panel tab + submission result
    const [leftTab, setLeftTab] = useState('description')
    const [submissionResult, setSubmissionResult] = useState(null)

    // Socket state
    const [socket, setSocket] = useState(null)
    const [latestSubmissionEvent, setLatestSubmissionEvent] = useState(null)

    // Cache state for Run → Submit optimization
    const [cachedCodeHash, setCachedCodeHash] = useState(null)
    const [cachedResult, setCachedResult] = useState(null)

    // Hash function to generate code fingerprint
    const generateCodeHash = (codeStr) => {
        let hash = 0
        for (let i = 0; i < codeStr.length; i++) {
            const char = codeStr.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash // Convert to 32bit integer
        }
        return Math.abs(hash).toString(36)
    }

    // Persist code to localStorage
    useEffect(() => {
        const savedCode = localStorage.getItem(`codearena_code_${problemId}_${language}`)
        if (savedCode) {
            setCode(savedCode)
        } else {
            setCode(STARTER_CODES[language] || '')
        }
    }, [problemId, language])

    // Set initial test input from problem
    useEffect(() => {
        if (problem?.sampleTestCases?.length > 0) {
            setTestInput(problem.sampleTestCases[0].input || '')
        }
    }, [problem])

    const updateCode = (newCode) => {
        setCode(newCode)
        localStorage.setItem(`codearena_code_${problemId}_${language}`, newCode)
        // Sync active file content
        setFiles((prev) => {
            const updated = [...prev]
            if (updated[activeFileIndex]) {
                updated[activeFileIndex] = { ...updated[activeFileIndex], content: newCode }
            }
            return updated
        })
        // 🚀 CLEAR CACHE when code changes
        setCachedCodeHash(null)
        setCachedResult(null)
    }

    // ─── Multi-file helpers ───────────────────────────────────────────────────

    const LANG_EXTENSIONS = { python: '.py', cpp: '.cpp', java: '.java', javascript: '.js' }

    const addFile = (filename) => {
        if (!filename) return
        if (files.some((f) => f.filename === filename)) return
        const newFile = { filename, content: '', isMain: false }
        setFiles((prev) => [...prev, newFile])
        setActiveFileIndex(files.length)
        setCode('')
    }

    const removeFile = (index) => {
        if (files[index]?.isMain) return // Cannot remove main file
        setFiles((prev) => prev.filter((_, i) => i !== index))
        if (activeFileIndex >= index && activeFileIndex > 0) {
            setActiveFileIndex(activeFileIndex - 1)
        }
        // Update code to reflect new active file
        const newIdx = activeFileIndex >= index ? Math.max(0, activeFileIndex - 1) : activeFileIndex
        setCode(files[newIdx]?.content || '')
    }

    const renameFile = (index, newName) => {
        if (!newName || files[index]?.isMain) return
        setFiles((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], filename: newName }
            return updated
        })
    }

    const switchToFile = (index) => {
        setActiveFileIndex(index)
        setCode(files[index]?.content || '')
    }

    const handleLanguageChange = (lang) => {
        setLanguage(lang)
        const ext = LANG_EXTENSIONS[lang] || '.txt'
        const defaultFileName = lang === 'java' ? 'Solution' + ext : 'solution' + ext
        // Reset to single main file for new language
        const savedCode = localStorage.getItem(`codearena_code_${problemId}_${lang}`)
        const newCode = savedCode || STARTER_CODES[lang] || ''
        setFiles([{ filename: defaultFileName, content: newCode, isMain: true }])
        setActiveFileIndex(0)
        if (!savedCode) {
            setCode(STARTER_CODES[lang] || '')
        }
        // 🚀 CLEAR CACHE when language changes
        setCachedCodeHash(null)
        setCachedResult(null)
    }

    const resetCode = () => {
        const ext = LANG_EXTENSIONS[language] || '.txt'
        const defaultFileName = language === 'java' ? 'Solution' + ext : 'solution' + ext
        const starterCode = STARTER_CODES[language] || ''
        setCode(starterCode)
        setFiles([{ filename: defaultFileName, content: starterCode, isMain: true }])
        setActiveFileIndex(0)
        localStorage.removeItem(`codearena_code_${problemId}_${language}`)
        // 🚀 CLEAR CACHE when code is reset
        setCachedCodeHash(null)
        setCachedResult(null)
    }

    // ─── Run Code (Direct Execution - No Submission Record) ───────────────────
    const runCode = useCallback(async () => {
        if (!problem) return
        console.log('[FRONTEND] RUN CODE BUTTON CLICKED')
        console.log('[FRONTEND] Problem ID:', problem._id)
        console.log('[FRONTEND] Code length:', code.length)
        console.log('[FRONTEND] Language:', language)
        console.log('[FRONTEND] Custom input:', testInput)

        setIsRunning(true)
        setConsoleTab('result')
        setIsConsoleOpen(true)
        setTestResult({
            status: 'running',
            totalCount: 1, // 'run' type has 1 execution
            results: [],
        })

        try {
            console.log('[FRONTEND] Sending POST /api/execute (direct execution, no submission)')
            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemId: problem._id,
                    code,
                    files: files.length > 1 ? files : undefined,
                    language,
                    customInput: testInput,
                }),
            })
            const data = await res.json()

            console.log('[FRONTEND] Execution Response:', data)

            if (!data.success) {
                console.error('[FRONTEND] Execution failed:', data.message)
                setTestResult({
                    status: 'error',
                    error: data.message || 'Execution failed',
                    verdict: data.verdict || 'RUNTIME_ERROR',
                })
                setIsRunning(false)
            } else {
                // Display results directly (no submission record created)
                const result = {
                    status: 'done',
                    verdict: data.result?.verdict || 'SUCCESS',
                    time: data.result?.executionTime || 0,
                    memory: data.result?.memoryUsed || 0,
                    output: data.result?.output || '',
                    error: data.result?.error || '',
                    totalCount: 1,
                }
                setTestResult(result)
                setIsRunning(false)

                // 🚀 CACHE THE RESULT for Submit optimization
                const codeHash = generateCodeHash(code)
                setCachedCodeHash(codeHash)
                setCachedResult(result)
                console.log('[FRONTEND] Code execution cached with hash:', codeHash)
                console.log('[FRONTEND] Code execution completed (not saved as submission)')
            }
        } catch (err) {
            console.error('[FRONTEND] RUN CODE ERROR:', err)
            setTestResult({ status: 'error', error: err.message })
            setIsRunning(false)
        }
    }, [code, language, testInput, problem, files])

    // ─── Submit Code (Full Judge via Docker) ─────────────────────────────────

    // ─── Submit Code (Asynchronous via BullMQ) ───────────────────────────────
    const submitCode = useCallback(async () => {
        if (!problem) return
        console.log('[FRONTEND] SUBMIT CODE BUTTON CLICKED')
        console.log('[FRONTEND] Problem ID:', problem._id)
        console.log('[FRONTEND] Problem testCaseCount:', problem.testCaseCount)
        console.log('[FRONTEND] Code length:', code.length)
        console.log('[FRONTEND] Language:', language)

        setIsSubmitting(true)
        setConsoleTab('result')
        setIsConsoleOpen(true)

        // Get test case count for totalCount display
        const totalTestCases = problem.testCaseCount || 0
        console.log('[FRONTEND] Total test cases:', totalTestCases)

        setTestResult({
            status: 'running',
            totalCount: totalTestCases,
            results: [],
        })
        setAiFeedback(null)

        try {
            // 🚀 CHECK CACHE: If code hasn't changed since last Run, use cached result
            const currentCodeHash = generateCodeHash(code)
            console.log('[FRONTEND] Current code hash:', currentCodeHash)
            console.log('[FRONTEND] Cached code hash:', cachedCodeHash)
            console.log('[FRONTEND] Cache exists?', !!cachedResult)

            if (cachedCodeHash === currentCodeHash && cachedResult) {
                console.log('[FRONTEND] 🚀 CACHE HIT! Using cached execution result')
                console.log(
                    '[FRONTEND] Skipping code execution, submitting directly with cached result'
                )

                // Show the cached result
                setTestResult({
                    ...cachedResult,
                    totalCount: totalTestCases,
                })

                // Now submit without executing (using cached result)
                const res = await fetch('/api/submissions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        problemId: problem._id,
                        code,
                        files: files.length > 1 ? files : undefined,
                        language,
                        type: 'submit',
                        contestId: contestId, // 🚀 Pass cached result to skip worker execution
                        cachedResult: {
                            verdict: cachedResult.verdict,
                            executionTime: cachedResult.time || 0,
                            memoryUsed: cachedResult.memory || 0,
                            output: cachedResult.output || '',
                            error: cachedResult.error || '',
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
                    setTestResult({ status: 'error', error: data.message })
                    setIsSubmitting(false)
                } else {
                    const submissionId = data.data._id || data.data.id
                    console.log(
                        '[FRONTEND] Submission created (from cache), joining room:',
                        `submission_${submissionId}`
                    )
                    if (socket) {
                        socket.emit('join_room', `submission_${submissionId}`)
                    }
                    setIsSubmitting(false)
                }
                return
            }

            // CACHE MISS: Execute fresh submission
            console.log('[FRONTEND] 🔄 CACHE MISS! Code has changed, executing fresh submission')
            console.log('[FRONTEND] Sending POST /api/submissions with type=submit')
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problemId: problem._id,
                    code,
                    files: files.length > 1 ? files : undefined,
                    language,
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
                setTestResult({ status: 'error', error: data.message })
                setIsSubmitting(false)
            } else {
                // Join the submission room for real-time updates
                const submissionId = data.data._id || data.data.id
                console.log(
                    '[FRONTEND] Submission created, joining room:',
                    `submission_${submissionId}`
                )
                if (socket) {
                    socket.emit('join_room', `submission_${submissionId}`)
                }
            }
            // Success response means it's queued. Socket.io will handle the rest.
        } catch (err) {
            console.error('[FRONTEND] SUBMIT CODE ERROR:', err)
            setTestResult({ status: 'error', error: err.message })
            setIsSubmitting(false)
        }
    }, [code, language, problem, files, contestId, socket, cachedCodeHash, cachedResult])

    // ─── AI Feedback ─────────────────────────────────────────────────────────

    const fetchAiFeedback = useCallback(
        async (options = { switchTab: true }) => {
            setIsAiLoading(true)
            if (options.switchTab) {
                setConsoleTab('ai')
                setIsConsoleOpen(true)
            }
            try {
                const res = await fetch('/api/evaluation/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code,
                        language,
                        problemTitle: problem?.title || 'Code Challenge',
                        verdict: testResult?.verdict || 'UNKNOWN',
                        executionTime: testResult?.time || 0,
                        memoryUsed: testResult?.memory || 0,
                    }),
                })
                const data = await res.json()
                if (data.success) {
                    setAiFeedback(data.feedback)
                    // Also update submissionResult if it exists
                    setSubmissionResult((prev) =>
                        prev ? { ...prev, aiFeedback: data.feedback } : null
                    )
                } else {
                    setAiFeedback({ error: data.error || 'AI analysis failed' })
                }
            } catch (err) {
                console.error('AI feedback error:', err)
                setAiFeedback({ error: err.message })
            } finally {
                setIsAiLoading(false)
            }
        },
        [code, language, problem, testResult]
    )

    // ─── View Past Submission Details ──────────────────────────────────────
    const viewSubmissionDetails = useCallback(
        async (submissionId) => {
            try {
                const res = await fetch(`/api/submissions/${submissionId}`)
                const data = await res.json()
                if (data.success) {
                    const s = data.data
                    const isRun = s.type === 'run'
                    const verdict = (s.verdict || '').toUpperCase()
                    const isAccepted = verdict === 'ACCEPTED'

                    // 1. Update Test Result (Used for the console panel)
                    const mappedTestResults = (s.testCaseResults || []).map((tr) => ({
                        passed: tr.verdict === 'ACCEPTED',
                        actual: tr.actualOutput ?? '',
                        expected: '(Hidden)', // Backend doesn't return expected for all
                    }))

                    setTestResult({
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

                    // 2. If it's a 'submit', also update the submission result and switch tab
                    if (s.type === 'submit') {
                        setSubmissionResult({
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

                        // Sync user stats on successful submission
                        if (isAccepted) {
                            syncUser()
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to fetch submission details:', err)
            } finally {
                setIsSubmitting(false)
                setIsRunning(false)
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
            // Join specific problem room for live reactions
            newSocket.emit('join_room', `problem:${problemId}`)
        })

        // Real-time test case completion updates
        newSocket.on('test_case_completed', (data) => {
            console.log('[Socket] Test case completed:', data)
            if (data.submissionId) {
                // Update testResult with progress
                setTestResult((prev) => ({
                    ...prev,
                    status: 'running',
                    totalCount: data.totalTestCases || prev?.totalCount,
                    progress: data.progress,
                    results: prev?.results
                        ? [...prev.results, data.testCaseResult]
                        : [data.testCaseResult],
                }))
            }
        })

        // Real-time execution completion (for 'run' type)
        newSocket.on('execution_completed', (data) => {
            console.log('[Socket] Execution completed:', data)
            if (data.submissionId) {
                // Update testResult for run type
                setTestResult({
                    status: 'done',
                    verdict: data.verdict,
                    passed: data.verdict === 'ACCEPTED',
                    time: data.executionTime,
                    memory: data.memoryUsed,
                    results: [{ actual: data.output, error: data.error }],
                    error: data.error,
                })
                setIsRunning(false)
            }
        })

        newSocket.on('submission_update', (data) => {
            console.log('[Socket] Submission update:', data)
            setLatestSubmissionEvent(data)

            // Only handle active notifications if the problem matches
            if (data.problemId === problemId) {
                // Determine if we should clear running/submitting states
                if (data.type === 'submission_evaluated' || data.type === 'submission_error') {
                    // Fetch full details to update the UI
                    viewSubmissionDetails(data.submissionId)

                    // Show notifications
                    if (data.verdict?.toUpperCase() === 'ACCEPTED') {
                        toast.success('Accepted!')
                    } else if (data.status === 'error' || data.type === 'submission_error') {
                        toast.error(data.error || 'Evaluation Error')
                        setIsSubmitting(false)
                        setIsRunning(false)
                    } else if (data.verdict) {
                        toast.error(data.verdict.replace(/_/g, ' '))
                    }
                }
            }
        })

        newSocket.on('reaction_update', (data) => {
            if (data.problemId === problemId) {
                // We'll emit a custom event or store it in context if needed,
                // but since ReactionSystem is inside this tree, we can use a simpler approach.
                // For now, we'll just allow the component to listen directly to the socket.
            }
        })

        setSocket(newSocket)
        return () => newSocket.disconnect()
    }, [user, problemId, viewSubmissionDetails])

    const value = {
        // Code
        code,
        updateCode,
        language,
        setLanguage: handleLanguageChange,
        resetCode,

        // Multi-file
        files,
        activeFileIndex,
        addFile,
        removeFile,
        renameFile,
        switchToFile,

        // Problem
        problem,
        problemId,

        // Execution
        isRunning,
        isSubmitting,
        runCode,
        submitCode,

        // Console
        consoleTab,
        setConsoleTab,
        testInput,
        setTestInput,
        testResult,
        setTestResult,
        activeTestCase,
        setActiveTestCase,
        isConsoleOpen,
        setIsConsoleOpen,

        // AI
        aiFeedback,
        isAiLoading,
        fetchAiFeedback,

        // Left panel
        leftTab,
        setLeftTab,
        submissionResult,
        setSubmissionResult,
        viewSubmissionDetails,

        // Realtime
        socket,
        latestSubmissionEvent,
    }

    return <ProblemSolveContext.Provider value={value}>{children}</ProblemSolveContext.Provider>
}

export function useProblemSolve() {
    const context = useContext(ProblemSolveContext)
    if (!context) {
        throw new Error('useProblemSolve must be used within a ProblemSolveProvider')
    }
    return context
}
