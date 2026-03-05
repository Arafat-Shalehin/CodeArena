'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

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

export function ProblemSolveProvider({ children, problemId, initialCode, problem }) {
    // Core code state
    const [code, setCode] = useState(initialCode || '')
    const [language, setLanguage] = useState('python')

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
    }

    const handleLanguageChange = (lang) => {
        setLanguage(lang)
        // Don't override localStorage-saved code
        const savedCode = localStorage.getItem(`codearena_code_${problemId}_${lang}`)
        if (!savedCode) {
            setCode(STARTER_CODES[lang] || '')
        }
    }

    const resetCode = () => {
        setCode(STARTER_CODES[language] || '')
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
                    language,
                    problemId: problem._id,
                    testCases,
                    timeLimit: problem.timeLimit || 5000,
                    memoryLimit: problem.memoryLimit || 512000,
                    comparisonMode: 'token',
                }),
            })
            const data = await res.json()

            if (data.success) {
                const r = data.result
                const isAccepted = r.verdict === 'ACCEPTED'
                const pub = r.publicTests || {}
                const mappedResults = (pub.results || []).map((tr) => ({
                    passed: tr.passed,
                    actual: tr.actualOutput ?? '',
                    expected: tr.testCase?.expectedOutput ?? '',
                }))
                setTestResult({
                    status: 'done',
                    verdict: r.verdict,
                    passed: isAccepted,
                    passedCount: pub.passed ?? 0,
                    totalCount: pub.total ?? 0,
                    time: r.stats?.executionTime,
                    memory: r.stats?.memoryUsed,
                    results: mappedResults,
                })

                // Auto-switch left panel to submission result
                setSubmissionResult({
                    verdict: r.verdict,
                    passed: isAccepted,
                    passedCount: pub.passed ?? 0,
                    totalCount: pub.total ?? 0,
                    time: r.stats?.executionTime,
                    memory: r.stats?.memoryUsed,
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

    const fetchAiFeedback = useCallback(async () => {
        setIsAiLoading(true)
        setConsoleTab('ai')
        setIsConsoleOpen(true)
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
            } else {
                setAiFeedback({ error: data.error || 'AI analysis failed' })
            }
        } catch (err) {
            console.error('AI feedback error:', err)
            setAiFeedback({ error: err.message })
        } finally {
            setIsAiLoading(false)
        }
    }, [code, language, problem, testResult])

    const value = {
        // Code
        code,
        updateCode,
        language,
        setLanguage: handleLanguageChange,
        resetCode,

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
