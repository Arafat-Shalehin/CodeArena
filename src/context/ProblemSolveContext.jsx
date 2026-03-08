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
    }

    const resetCode = () => {
        const ext = LANG_EXTENSIONS[language] || '.txt'
        const defaultFileName = language === 'java' ? 'Solution' + ext : 'solution' + ext
        const starterCode = STARTER_CODES[language] || ''
        setCode(starterCode)
        setFiles([{ filename: defaultFileName, content: starterCode, isMain: true }])
        setActiveFileIndex(0)
        localStorage.removeItem(`codearena_code_${problemId}_${language}`)
    }

    // ─── Run Code (Single test case via Docker) ──────────────────────────────

    const runCode = useCallback(async () => {
        if (!problem) return
        setIsRunning(true)
        setConsoleTab('result')
        setIsConsoleOpen(true)
        setTestResult({ status: 'running' })

        try {
            const res = await fetch('/api/evaluation/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    files: files.length > 1 ? files : undefined,
                    language,
                    input: testInput,
                    timeLimit: problem.timeLimit || 5000,
                    memoryLimit: problem.memoryLimit || 512000,
                }),
            })
            const data = await res.json()

            if (data.success) {
                const r = data.result
                const expected = problem.sampleTestCases?.[activeTestCase]?.output?.trim()
                const actual = (r.output || '').trim()

                let verdict = r.verdict
                let passed = null
                if (r.success && expected) {
                    passed = actual === expected
                    verdict = passed ? 'ACCEPTED' : 'WRONG_ANSWER'
                } else if (r.success && !expected) {
                    verdict = 'SUCCESS'
                    passed = null
                }

                setTestResult({
                    status: 'done',
                    verdict,
                    passed,
                    output: r.output,
                    expected,
                    error: r.error,
                    time: r.executionTime,
                    memory: r.memoryUsed,
                })
            } else {
                setTestResult({ status: 'error', error: data.error, message: data.message })
            }
        } catch (err) {
            setTestResult({ status: 'error', error: err.message })
        } finally {
            setIsRunning(false)
        }
    }, [code, language, testInput, problem, activeTestCase])

    // ─── Submit Code (Full Judge via Docker) ─────────────────────────────────

    const submitCode = useCallback(async () => {
        if (!problem) return
        setIsSubmitting(true)
        setConsoleTab('result')
        setIsConsoleOpen(true)
        setTestResult({ status: 'running' })
        setAiFeedback(null)

        try {
            const testCases = (problem.sampleTestCases || []).map((tc) => ({
                input: tc.input,
                expectedOutput: tc.output,
                isHidden: false,
            }))

            const res = await fetch('/api/evaluation/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    files: files.length > 1 ? files : undefined,
                    language,
                    problemId: problem._id,
                    testCases,
                    timeLimit: problem.timeLimit || 5000,
                    memoryLimit: problem.memoryLimit || 512000,
                    comparisonMode: 'token',
                    contestId: contestId,
                }),
            })
            const data = await res.json()

            if (data.success) {
                const r = data.result
                // console.log(r)
                const isAccepted = r.verdict === 'ACCEPTED'

                if (isAccepted) {
                    syncUser()
                }

                const pub = r.publicTests || {}
                const mappedResults = (pub.results || []).map((tr) => ({
                    passed: tr.passed,
                    actual: tr.actualOutput ?? '',
                    expected: tr.testCase?.expectedOutput ?? '',
                }))
                // console.log(r.stats?.maxMemoryUsed)
                setTestResult({
                    status: 'done',
                    verdict: r.verdict,
                    passed: isAccepted,
                    passedCount: pub.passed ?? 0,
                    totalCount: pub.total ?? 0,
                    time: r.stats?.executionTime,
                    memory: r.stats?.maxMemoryUsed,
                    results: mappedResults,
                })

                // Auto-switch left panel to submission result
                setSubmissionResult({
                    verdict: r.verdict,
                    passed: isAccepted,
                    passedCount: pub.passed ?? 0,
                    totalCount: pub.total ?? 0,
                    time: r.stats?.executionTime,
                    memory: r.stats?.maxMemoryUsed,
                    submittedCode: code,
                    submittedLanguage: language,
                    submittedAt: new Date().toISOString(),
                })
                setLeftTab('submission-result')
            } else {
                setTestResult({ status: 'error', error: data.error, message: data.message })
            }
        } catch (err) {
            setTestResult({ status: 'error', error: err.message })
        } finally {
            setIsSubmitting(false)
        }
    }, [code, language, problem])

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
    const viewSubmissionDetails = useCallback(async (submissionId) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/submissions/${submissionId}`)
            const data = await res.json()
            if (data.success) {
                const s = data.data
                const isAccepted = s.verdict === 'accepted'

                // Map DB submission to context state shape
                setSubmissionResult({
                    verdict: s.verdict?.toUpperCase(),
                    passed: isAccepted,
                    passedCount:
                        s.testCaseResults?.filter((r) => r.passed || r.verdict === 'accepted')
                            .length || 0,
                    totalCount: s.testCaseResults?.length || 0,
                    time: s.executionTime,
                    memory: s.memoryUsed,
                    submittedCode: s.code,
                    submittedLanguage: s.language,
                    submittedAt: s.createdAt,
                    aiFeedback: s.aiFeedback,
                })
                setLeftTab('submission-result')
            }
        } catch (err) {
            console.error('Failed to fetch submission details:', err)
        } finally {
            setIsSubmitting(false)
        }
    }, [])

    // ─── Socket.io Connection ──────────────────────────────────────────────
    useEffect(() => {
        if (!user || !(user._id || user.id)) return

        const userId = user._id || user.id
        const newSocket = io(`http://${window.location.hostname}:3002`)

        newSocket.on('connect', () => {
            console.log('[Socket] Connected to realtime server')
            newSocket.emit('join_room', userId)
        })

        newSocket.on('submission_update', (data) => {
            console.log('[Socket] Submission update:', data)
            setLatestSubmissionEvent(data)

            // Only handle active notifications if the problem matches
            if (data.problemId === problemId) {
                if (data.type === 'submission_evaluated') {
                    setIsSubmitting(false)

                    if (data.verdict === 'accepted') {
                        toast.success('Accepted!')
                    } else if (data.status === 'error') {
                        toast.error(data.error || 'System Error')
                    } else {
                        toast.error((data.verdict || '').replace('_', ' ').toUpperCase())
                    }

                    // Fetch submission details automatically to verify UI state
                    viewSubmissionDetails(data.submissionId)
                }
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
