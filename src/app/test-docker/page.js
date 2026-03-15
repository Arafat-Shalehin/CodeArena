'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from 'next-themes'
import Editor from '@monaco-editor/react'
import ProblemListSidebar from './ProblemListSidebar'
import {
    Play,
    ChevronLeft,
    ChevronRight,
    Shuffle,
    Loader2,
    Sparkles,
    CheckCircle2,
    XCircle,
    Settings2,
    RotateCcw,
    Maximize2,
    Copy,
    List,
    Clock,
    HardDrive,
    Tag,
    ThumbsUp,
    MessageSquare,
    Star,
    ExternalLink,
    Heart,
    GripVertical,
    GripHorizontal,
    Terminal,
    ChevronDown,
    Zap,
    Brain,
    Target,
    TrendingUp,
    Award,
    Shield,
    Lightbulb,
    ArrowRight,
    BarChart3,
} from 'lucide-react'

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

const DIFFICULTY_STYLES = {
    easy: 'difficulty-easy',
    medium: 'difficulty-medium',
    hard: 'difficulty-hard',
}

// ─── Resizable Panel Hook ─────────────────────────────────────────────────────

function useResizable(initialRatio = 0.45, direction = 'horizontal') {
    const [ratio, setRatio] = useState(initialRatio)
    const containerRef = useRef(null)
    const isDragging = useRef(false)

    const onMouseDown = useCallback(
        (e) => {
            e.preventDefault()
            isDragging.current = true
            document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
            document.body.style.userSelect = 'none'
        },
        [direction]
    )

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging.current || !containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            let newRatio
            if (direction === 'horizontal') {
                newRatio = (e.clientX - rect.left) / rect.width
            } else {
                newRatio = (e.clientY - rect.top) / rect.height
            }
            setRatio(Math.max(0.2, Math.min(0.8, newRatio)))
        }

        const onMouseUp = () => {
            isDragging.current = false
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }
    }, [direction])

    return { ratio, containerRef, onMouseDown }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DockerIDEPage() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Resizable panels
    const hSplit = useResizable(0.42, 'horizontal')
    const vSplit = useResizable(0.6, 'vertical')

    useEffect(() => {
        setMounted(true)
    }, [])

    // Core state
    const [language, setLanguage] = useState('python')
    const [code, setCode] = useState(STARTER_CODES.python)
    const [showLangDropdown, setShowLangDropdown] = useState(false)

    // Problem state
    const [problems, setProblems] = useState([])
    const [selectedProblem, setSelectedProblem] = useState(null)
    const [problemIndex, setProblemIndex] = useState(0)
    const [loadingProblems, setLoadingProblems] = useState(true)
    const [leftTab, setLeftTab] = useState('description') // description, editorial, solutions, submissions

    // Execution state
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [consoleTab, setConsoleTab] = useState('testcase') // testcase, result
    const [testInput, setTestInput] = useState('')
    const [testResult, setTestResult] = useState(null)
    const [activeTestCase, setActiveTestCase] = useState(0)

    // AI states
    const [aiFeedback, setAiFeedback] = useState(null)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [submissionId, setSubmissionId] = useState(null)

    // Sidebar state
    const [showProblemList, setShowProblemList] = useState(false)
    const [solvedIds, setSolvedIds] = useState([])

    // Load problems
    useEffect(() => {
        fetchProblems()
    }, [])

    const fetchProblems = async () => {
        setLoadingProblems(true)
        try {
            const res = await fetch('/api/problems')
            const data = await res.json()
            if (data.success && data.data?.length > 0) {
                setProblems(data.data)
                selectProblem(data.data[0], 0)
            }
        } catch (err) {
            console.error('Failed to fetch problems:', err)
        } finally {
            setLoadingProblems(false)
        }
    }

    const selectProblem = async (problem, index) => {
        setProblemIndex(index)
        setLeftTab('description')
        setTestResult(null)
        setAiFeedback(null)
        setSubmissionId(null)
        setActiveTestCase(0)
        setTestInput('')

        // The list API excludes sampleTestCases, so fetch the full problem
        try {
            const res = await fetch(`/api/problems/${problem._id}`)
            const data = await res.json()
            if (data.success && data.data) {
                const fullProblem = data.data
                setSelectedProblem(fullProblem)
                if (fullProblem.sampleTestCases?.length > 0) {
                    setTestInput(fullProblem.sampleTestCases[0].input || '')
                }
                return
            }
        } catch (err) {
            console.error('Failed to fetch problem details:', err)
        }
        // Fallback: use the list data even without sampleTestCases
        setSelectedProblem(problem)
    }

    const navigateProblem = (dir) => {
        const newIndex = (problemIndex + dir + problems.length) % problems.length
        selectProblem(problems[newIndex], newIndex)
    }

    const randomProblem = () => {
        const idx = Math.floor(Math.random() * problems.length)
        selectProblem(problems[idx], idx)
    }

    const handleLanguageChange = (lang) => {
        setLanguage(lang)
        setCode(STARTER_CODES[lang])
        setShowLangDropdown(false)
    }

    // ─── Run Code ───────────────────────────────────────────────────────────

    const runCode = async () => {
        setIsRunning(true)
        setConsoleTab('result')
        setTestResult({ status: 'running' })

        try {
            const res = await fetch('/api/evaluation/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    input: testInput,
                    timeLimit: selectedProblem?.timeLimit || 5000,
                    memoryLimit: selectedProblem?.memoryLimit || 512000,
                }),
            })
            const data = await res.json()

            if (data.success) {
                const r = data.result
                const expected = selectedProblem?.sampleTestCases?.[activeTestCase]?.output?.trim()
                const actual = (r.output || '').trim()

                // Determine verdict based on comparison, not raw executor verdict
                let verdict = r.verdict
                let passed = null
                if (r.success && expected) {
                    passed = actual === expected
                    verdict = passed ? 'ACCEPTED' : 'WRONG_ANSWER'
                } else if (r.success && !expected) {
                    verdict = 'SUCCESS'
                    passed = null // No expected output to compare against
                }
                // If not r.success, keep the executor's verdict (RUNTIME_ERROR, TLE, etc.)

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
    }

    // ─── Submit to Judge ────────────────────────────────────────────────────

    const submitCode = async () => {
        if (!selectedProblem) return
        setIsSubmitting(true)
        setConsoleTab('result')
        setTestResult({ status: 'running' })
        setAiFeedback(null)
        setSubmissionId(null)

        try {
            const testCases = (selectedProblem.sampleTestCases || []).map((tc) => ({
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
                    problemId: selectedProblem._id,
                    testCases,
                    timeLimit: selectedProblem.timeLimit || 5000,
                    memoryLimit: selectedProblem.memoryLimit || 512000,
                    comparisonMode: 'token',
                }),
            })
            const data = await res.json()

            if (data.success) {
                const r = data.result
                const isAccepted = r.verdict === 'ACCEPTED'
                const pub = r.publicTests || {}
                // Map per-test results to { passed, actual, expected } for display
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
                if (r.verdict === 'ACCEPTED' || r.verdict === 'TIME_LIMIT_EXCEEDED') {
                    setSubmissionId('latest')
                }
            } else {
                setTestResult({ status: 'error', error: data.error, message: data.message })
            }
        } catch (err) {
            setTestResult({ status: 'error', error: err.message })
        } finally {
            setIsSubmitting(false)
        }
    }

    // ─── AI Feedback ────────────────────────────────────────────────────────

    const fetchAiFeedback = async () => {
        setIsAiLoading(true)
        try {
            const res = await fetch('/api/evaluation/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    problemTitle: selectedProblem?.title || 'Code Challenge',
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
    }

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div
            className="bg-bg-page flex h-screen w-full flex-col overflow-hidden"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            {/* ═══ Problem List Sidebar ═══ */}
            <ProblemListSidebar
                isOpen={showProblemList}
                onClose={() => setShowProblemList(false)}
                problems={problems}
                selectedProblemId={selectedProblem?._id}
                onSelectProblem={selectProblem}
                solvedIds={solvedIds}
                onShuffle={randomProblem}
            />

            {/* ═══ Top Navbar ═══ */}
            <nav className="border-border bg-bg-subtle flex h-[44px] flex-shrink-0 items-center justify-between border-b px-3">
                {/* Left: Problem List + Nav */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowProblemList(true)}
                        className="text-text-secondary hover:bg-bg-muted flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors"
                    >
                        <List size={14} />
                        <span className="font-medium">Problem List</span>
                    </button>
                    <div className="bg-border mx-1 h-4 w-px" />
                    <button
                        onClick={() => navigateProblem(-1)}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => navigateProblem(1)}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                    <button
                        onClick={randomProblem}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors"
                    >
                        <Shuffle size={16} />
                    </button>
                </div>

                {/* Center: Run + Submit */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={runCode}
                        disabled={isRunning || isSubmitting}
                        className="bg-bg-muted text-text-primary hover:bg-bg-muted/80 flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {isRunning ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Play size={14} />
                        )}
                        Run
                    </button>
                    <button
                        onClick={submitCode}
                        disabled={isRunning || isSubmitting || !selectedProblem}
                        className="bg-accent hover:bg-accent-hover flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={14} />
                        )}
                        Submit
                    </button>
                </div>

                {/* Right: Misc icons */}
                <div className="text-text-muted flex items-center gap-2">
                    {submissionId && (
                        <button
                            onClick={() => {
                                setConsoleTab('result')
                                fetchAiFeedback()
                            }}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-purple-600 hover:bg-purple-500/10 dark:text-purple-400"
                        >
                            <Sparkles size={14} /> AI Analysis
                        </button>
                    )}
                    <button className="hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors">
                        <Settings2 size={18} />
                    </button>
                </div>
            </nav>

            {/* ═══ Main Content (Horizontal Split) ═══ */}
            <div ref={hSplit.containerRef} className="flex flex-1 overflow-hidden">
                {/* ─── Left Panel: Problem Description ─── */}
                <div
                    style={{ width: `${hSplit.ratio * 100}%` }}
                    className="border-border flex flex-col overflow-hidden border-r"
                >
                    {/* Left Tabs */}
                    <div className="border-border bg-bg-subtle flex h-[38px] flex-shrink-0 items-center gap-1 border-b px-3">
                        {[
                            { key: 'description', label: 'Description', icon: '📄' },
                            { key: 'editorial', label: 'Editorial', icon: '📘' },
                            { key: 'solutions', label: 'Solutions', icon: '💡' },
                            { key: 'submissions', label: 'Submissions', icon: '🕐' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setLeftTab(tab.key)}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                    leftTab === tab.key
                                        ? 'bg-bg-muted text-text-primary'
                                        : 'text-text-muted hover:bg-bg-muted/50 hover:text-text-secondary'
                                }`}
                            >
                                <span>{tab.icon}</span> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Left Content */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {loadingProblems ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={24} className="text-text-muted animate-spin" />
                            </div>
                        ) : selectedProblem ? (
                            leftTab === 'description' ? (
                                <ProblemDescription problem={selectedProblem} />
                            ) : leftTab === 'submissions' && submissionId && aiFeedback ? (
                                <AiFeedbackPanel feedback={aiFeedback} />
                            ) : (
                                <div className="text-text-muted flex flex-col items-center justify-center py-20">
                                    <span className="mb-3 text-4xl">🚧</span>
                                    <p className="text-sm">Coming soon</p>
                                </div>
                            )
                        ) : null}
                    </div>

                    {/* Left Footer */}
                    {selectedProblem && (
                        <div className="border-border bg-bg-subtle text-text-muted flex h-[36px] flex-shrink-0 items-center justify-between border-t px-4 text-xs">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <ThumbsUp size={12} /> {selectedProblem.totalSubmissions || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MessageSquare size={12} /> {selectedProblem.testCaseCount || 0}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Star
                                    size={12}
                                    className="hover:text-rank-gold cursor-pointer transition-colors"
                                />
                                <ExternalLink
                                    size={12}
                                    className="hover:text-text-primary cursor-pointer transition-colors"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── Horizontal Drag Handle ─── */}
                <div
                    onMouseDown={hSplit.onMouseDown}
                    className="bg-bg-page hover:bg-accent flex w-[6px] cursor-col-resize items-center justify-center transition-colors"
                >
                    <GripVertical size={10} className="text-text-muted" />
                </div>

                {/* ─── Right Panel: Editor + Console ─── */}
                <div
                    style={{ width: `${(1 - hSplit.ratio) * 100}%` }}
                    className="flex flex-col overflow-hidden"
                >
                    <div ref={vSplit.containerRef} className="flex flex-1 flex-col overflow-hidden">
                        {/* ─── Top Right: Code Editor ─── */}
                        <div
                            style={{ height: `${vSplit.ratio * 100}%` }}
                            className="flex flex-col overflow-hidden"
                        >
                            {/* Editor Header */}
                            <div className="border-border bg-bg-subtle flex h-[38px] flex-shrink-0 items-center justify-between border-b px-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-text-secondary text-xs font-semibold">
                                        {'</>'} Code
                                    </span>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowLangDropdown(!showLangDropdown)}
                                            className="bg-bg-muted text-text-secondary hover:bg-bg-muted/80 flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                                        >
                                            {LANG_LABELS[language]}
                                            <ChevronDown size={12} />
                                        </button>
                                        {showLangDropdown && (
                                            <div className="border-border bg-bg-subtle absolute top-full left-0 z-50 mt-1 w-40 rounded-md border py-1 shadow-xl">
                                                {Object.entries(LANG_LABELS).map(([key, label]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => handleLanguageChange(key)}
                                                        className={`text-text-secondary hover:bg-bg-muted w-full px-3 py-1.5 text-left text-xs transition-colors ${language === key ? 'bg-bg-muted text-text-primary font-bold' : ''}`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-text-muted text-[10px]">| Auto</span>
                                </div>
                                <div className="text-text-muted flex items-center gap-1">
                                    <button
                                        onClick={() => setCode(STARTER_CODES[language])}
                                        className="hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors"
                                        title="Reset Code"
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                    <button
                                        className="hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors"
                                        title="Copy"
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button
                                        className="hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors"
                                        title="Settings"
                                    >
                                        <Settings2 size={14} />
                                    </button>
                                    <button
                                        className="hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors"
                                        title="Fullscreen"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Monaco Editor */}
                            <div className="flex-1">
                                {mounted ? (
                                    <Editor
                                        height="100%"
                                        language={language === 'cpp' ? 'cpp' : language}
                                        value={code}
                                        theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
                                        onChange={(value) => setCode(value || '')}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            fontFamily:
                                                "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                            automaticLayout: true,
                                            scrollBeyondLastLine: false,
                                            wordWrap: 'on',
                                            padding: { top: 12 },
                                            lineNumbers: 'on',
                                            renderLineHighlight: 'line',
                                            cursorBlinking: 'smooth',
                                            smoothScrolling: true,
                                        }}
                                    />
                                ) : (
                                    <div className="bg-bg-page flex h-full items-center justify-center">
                                        <Loader2 className="text-text-muted animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Editor Footer */}
                            <div className="border-border bg-bg-subtle text-text-muted flex h-[24px] flex-shrink-0 items-center justify-end border-t px-3 text-[10px]">
                                <span>Saved</span>
                                <span className="mx-4">Ln 1, Col 1</span>
                            </div>
                        </div>

                        {/* ─── Vertical Drag Handle ─── */}
                        <div
                            onMouseDown={vSplit.onMouseDown}
                            className="bg-bg-page hover:bg-accent flex h-[6px] cursor-row-resize items-center justify-center transition-colors"
                        >
                            <GripHorizontal size={10} className="text-text-muted" />
                        </div>

                        {/* ─── Bottom Right: Console / Test Cases ─── */}
                        <div
                            style={{ height: `${(1 - vSplit.ratio) * 100}%` }}
                            className="bg-bg-page flex flex-col overflow-hidden"
                        >
                            {/* Console Header (Tabs + Actions) */}
                            <div className="border-border bg-bg-subtle flex h-[38px] flex-shrink-0 items-center justify-between border-b px-4">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setConsoleTab('testcase')}
                                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                            consoleTab === 'testcase'
                                                ? 'bg-bg-muted text-text-primary'
                                                : 'text-text-muted hover:bg-bg-muted/50 hover:text-text-secondary'
                                        }`}
                                    >
                                        <CheckCircle2 size={13} className="text-success" /> Testcase
                                    </button>
                                    <button
                                        onClick={() => setConsoleTab('result')}
                                        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                            consoleTab === 'result'
                                                ? 'bg-bg-muted text-text-primary'
                                                : 'text-text-muted hover:bg-bg-muted/50 hover:text-text-secondary'
                                        }`}
                                    >
                                        <Terminal size={13} /> Test Result
                                    </button>
                                    {testResult && testResult.status === 'done' && (
                                        <button
                                            onClick={() => {
                                                setConsoleTab('ai')
                                                fetchAiFeedback()
                                            }}
                                            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                                consoleTab === 'ai'
                                                    ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                                                    : 'text-text-muted hover:bg-bg-muted/50 hover:text-purple-600 dark:hover:text-purple-300'
                                            }`}
                                        >
                                            <Sparkles size={13} /> AI Analysis
                                        </button>
                                    )}
                                </div>
                                <div className="text-text-muted flex items-center gap-1">
                                    <button
                                        className="hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors"
                                        title="Maximize"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                    <button
                                        className="hover:bg-bg-muted hover:text-text-primary rounded p-1 transition-colors"
                                        title="Collapse"
                                    >
                                        <ChevronDown size={14} className="rotate-180" />
                                    </button>
                                </div>
                            </div>

                            {/* Console Content */}
                            <div className="flex-1 overflow-y-auto">
                                {/* ─── Testcase Tab ─── */}
                                {consoleTab === 'testcase' && selectedProblem && (
                                    <div className="p-5">
                                        {/* Case selector pills */}
                                        {selectedProblem.sampleTestCases?.length > 0 && (
                                            <div className="mb-4 flex items-center gap-2">
                                                {selectedProblem.sampleTestCases.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setActiveTestCase(i)
                                                            setTestInput(
                                                                selectedProblem.sampleTestCases[i]
                                                                    .input || ''
                                                            )
                                                        }}
                                                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                                            activeTestCase === i
                                                                ? 'bg-bg-muted text-text-primary'
                                                                : 'text-text-muted hover:bg-bg-muted/50 hover:text-text-secondary'
                                                        }`}
                                                    >
                                                        <CheckCircle2
                                                            size={12}
                                                            className="text-success"
                                                        />
                                                        Case {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Input block */}
                                        <div className="mb-4">
                                            <div className="text-text-muted mb-2 text-xs font-medium">
                                                Input
                                            </div>
                                            <textarea
                                                value={testInput}
                                                onChange={(e) => setTestInput(e.target.value)}
                                                className="bg-bg-subtle border-border text-text-primary focus:border-accent w-full resize-none rounded-lg border p-4 font-mono text-sm transition-colors outline-none"
                                                rows={4}
                                                spellCheck="false"
                                            />
                                        </div>

                                        {/* Expected output preview for active test case */}
                                        {selectedProblem.sampleTestCases?.[activeTestCase]
                                            ?.output && (
                                            <div>
                                                <div className="text-text-muted mb-2 text-xs font-medium">
                                                    Expected Output
                                                </div>
                                                <div className="bg-bg-subtle border-border text-text-primary rounded-lg border p-4 font-mono text-sm transition-colors">
                                                    {
                                                        selectedProblem.sampleTestCases[
                                                            activeTestCase
                                                        ].output
                                                    }
                                                </div>
                                            </div>
                                        )}

                                        {/* Contribute footer */}
                                        <div className="text-text-muted hover:text-text-secondary mt-6 flex items-center justify-center gap-1.5 text-xs transition-colors">
                                            <Heart size={12} /> Contribute a testcase
                                        </div>
                                    </div>
                                )}

                                {/* ─── Test Result Tab ─── */}
                                {consoleTab === 'result' && (
                                    <TestResultPanel
                                        result={testResult}
                                        selectedProblem={selectedProblem}
                                        activeTestCase={activeTestCase}
                                        setActiveTestCase={setActiveTestCase}
                                    />
                                )}

                                {/* ─── AI Analysis Tab ─── */}
                                {consoleTab === 'ai' && (
                                    <div className="p-5">
                                        <AiFeedbackConsole
                                            feedback={aiFeedback}
                                            isLoading={isAiLoading}
                                            onRetry={fetchAiFeedback}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function ProblemDescription({ problem }) {
    return (
        <div>
            {/* Title */}
            <h2 className="text-text-primary mb-2 text-xl font-bold">{problem.title}</h2>

            {/* Badges */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${DIFFICULTY_STYLES[problem.difficulty]}`}
                >
                    {problem.difficulty}
                </span>
                {problem.tags?.map((tag) => (
                    <span
                        key={tag}
                        className="bg-bg-muted text-text-muted flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] transition-colors"
                    >
                        <Tag size={10} /> {tag}
                    </span>
                ))}
            </div>

            {/* Stats bar */}
            <div className="text-text-muted mb-5 flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                    <Clock size={12} /> {problem.timeLimit}ms
                </span>
                <span className="flex items-center gap-1">
                    <HardDrive size={12} /> {(problem.memoryLimit / 1024).toFixed(0)}MB
                </span>
                <span>Acceptance: {problem.acceptanceRate}%</span>
            </div>

            {/* Description */}
            <div className="text-text-secondary mb-6 text-[14px] leading-7 whitespace-pre-wrap">
                {problem.description}
            </div>

            {/* Sample Test Cases */}
            {problem.sampleTestCases?.length > 0 && (
                <div>
                    {problem.sampleTestCases.map((tc, i) => (
                        <div key={i} className="mb-5">
                            <h4 className="text-text-primary mb-2 text-sm font-bold">
                                Example {i + 1}:
                            </h4>
                            <div className="bg-bg-subtle border-border rounded-lg border p-4 font-mono text-sm transition-colors">
                                <div className="mb-1">
                                    <span className="text-text-muted font-bold">Input: </span>
                                    <span className="text-text-primary">{tc.input}</span>
                                </div>
                                <div className="mb-1">
                                    <span className="text-text-muted font-bold">Output: </span>
                                    <span className="text-text-primary">{tc.output}</span>
                                </div>
                                {tc.explanation && (
                                    <div>
                                        <span className="text-text-muted font-bold">
                                            Explanation:{' '}
                                        </span>
                                        <span className="text-text-primary">{tc.explanation}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Constraints */}
            <div className="bg-bg-subtle border-border mt-4 rounded-lg border p-4 text-sm transition-colors">
                <h4 className="text-text-primary mb-2 font-bold">Constraints:</h4>
                <ul className="text-text-muted space-y-1 font-mono text-xs">
                    <li>• Time Limit: {problem.timeLimit}ms</li>
                    <li>• Memory Limit: {(problem.memoryLimit / 1024).toFixed(0)}MB</li>
                    {problem.codeSizeLimit && <li>• Code Size Limit: {problem.codeSizeLimit}KB</li>}
                </ul>
            </div>
        </div>
    )
}

function TestResultPanel({ result, selectedProblem, activeTestCase, setActiveTestCase }) {
    const [viewingCase, setViewingCase] = useState(0)

    if (!result) {
        return (
            <div className="text-text-muted flex h-full flex-col items-center justify-center py-12">
                <Terminal size={28} className="mb-2 opacity-30" />
                <p className="text-xs">Run or Submit your code to see results</p>
            </div>
        )
    }

    if (result.status === 'running') {
        return (
            <div className="text-text-muted flex h-full flex-col items-center justify-center gap-3 py-12">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Judging...</span>
            </div>
        )
    }

    if (result.status === 'error') {
        return (
            <div className="p-5">
                <div className="text-error mb-1 text-xl font-bold">Runtime Error</div>
                <div className="text-text-muted mb-5 text-xs">
                    Something went wrong during execution
                </div>
                <div className="bg-error/5 text-error rounded-lg p-4 font-mono text-sm">
                    {result.error}
                    {result.message && <div className="text-text-muted mt-2">{result.message}</div>}
                </div>
                <div className="text-text-muted hover:text-text-secondary mt-8 flex items-center justify-center gap-1.5 text-xs transition-colors">
                    <Heart size={12} /> Contribute a testcase
                </div>
            </div>
        )
    }

    const isAccepted = result.verdict === 'ACCEPTED'
    const verdictColor = isAccepted ? 'text-success' : 'text-error'
    const verdictLabel = result.verdict?.replace(/_/g, ' ')

    // Build per-case data for display
    const caseResults = result.results || []
    const testCases = selectedProblem?.sampleTestCases || []
    const currentCaseResult = caseResults[viewingCase]
    const currentTestCase = testCases[viewingCase]

    return (
        <div className="p-5">
            {/* ── Verdict Header ── */}
            <div className="mb-1 flex items-baseline gap-3">
                <span className={`text-xl font-bold ${verdictColor}`}>{verdictLabel}</span>
                {result.time !== undefined && (
                    <span className="text-text-muted text-sm">
                        Runtime: <span className="text-text-primary">{result.time} ms</span>
                    </span>
                )}
            </div>
            {result.passedCount !== undefined && (
                <div className="text-text-muted mb-4 text-xs">
                    {result.passedCount}/{result.totalCount} testcases passed
                </div>
            )}
            {result.memory !== undefined && !result.passedCount && (
                <div className="text-text-muted mb-4 text-xs">
                    Memory: <span className="text-text-primary">{result.memory} KB</span>
                </div>
            )}

            {/* ── Case Badges ── */}
            {(caseResults.length > 0 || testCases.length > 0) && (
                <div className="mb-5 flex items-center gap-2">
                    {(caseResults.length > 0 ? caseResults : testCases).map((item, i) => {
                        const passed = caseResults[i]?.passed
                        const isActiveCase = viewingCase === i
                        return (
                            <button
                                key={i}
                                onClick={() => setViewingCase(i)}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    isActiveCase
                                        ? 'bg-bg-muted text-text-primary'
                                        : 'text-text-muted hover:bg-bg-muted/50 hover:text-text-secondary'
                                }`}
                            >
                                {passed !== undefined &&
                                    (passed ? (
                                        <CheckCircle2 size={12} className="text-success" />
                                    ) : (
                                        <XCircle size={12} className="text-error" />
                                    ))}
                                Case {i + 1}
                            </button>
                        )
                    })}
                </div>
            )}

            {/* ── Input / Output / Expected Blocks ── */}
            <div className="space-y-4">
                {/* Input */}
                {currentTestCase?.input && (
                    <div>
                        <div className="text-text-muted mb-2 text-xs font-medium">Input</div>
                        <div className="bg-bg-subtle border-border rounded-lg border p-4 transition-colors">
                            <pre className="text-text-primary font-mono text-sm font-bold whitespace-pre-wrap">
                                {currentTestCase.input}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Output */}
                {(currentCaseResult?.actual !== undefined || result.output !== undefined) && (
                    <div>
                        <div className="text-text-muted mb-2 text-xs font-medium">Output</div>
                        <div className="bg-bg-subtle border-border rounded-lg border p-4 transition-colors">
                            <pre className="text-text-primary font-mono text-sm font-bold whitespace-pre-wrap">
                                {currentCaseResult?.actual ?? result.output ?? ''}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Expected */}
                {(currentCaseResult?.expected !== undefined ||
                    result.expected !== undefined ||
                    currentTestCase?.output) && (
                    <div>
                        <div className="text-text-muted mb-2 text-xs font-medium">Expected</div>
                        <div className="bg-bg-subtle border-border rounded-lg border p-4 transition-colors">
                            <pre className="text-text-primary font-mono text-sm font-bold whitespace-pre-wrap">
                                {currentCaseResult?.expected ??
                                    result.expected ??
                                    currentTestCase?.output ??
                                    ''}
                            </pre>
                        </div>
                    </div>
                )}

                {/* Error */}
                {result.error && (
                    <div>
                        <div className="text-error mb-2 text-xs font-medium">Error</div>
                        <div className="bg-error/5 rounded-lg p-4 transition-colors">
                            <pre className="text-error font-mono text-xs whitespace-pre-wrap">
                                {result.error}
                            </pre>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="text-text-muted hover:text-text-secondary mt-8 flex cursor-pointer items-center justify-center gap-1.5 text-xs transition-colors">
                <Heart size={12} /> Contribute a testcase
            </div>
        </div>
    )
}

function QualityBar({ label, value, maxValue = 5, color }) {
    const percentage = (value / maxValue) * 100
    return (
        <div className="flex items-center gap-3">
            <span className="text-text-muted w-[72px] text-[11px]">{label}</span>
            <div className="bg-bg-page h-[6px] flex-1 overflow-hidden rounded-full transition-colors">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%`, background: color }}
                />
            </div>
            <span className="text-text-muted w-7 text-right font-mono text-[11px]">
                {value}/{maxValue}
            </span>
        </div>
    )
}

function AiFeedbackConsole({ feedback, isLoading, onRetry }) {
    if (isLoading) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-12">
                <div className="relative">
                    <div
                        className="absolute inset-0 animate-ping rounded-full bg-purple-500/20"
                        style={{ animationDuration: '1.5s' }}
                    />
                    <div className="relative rounded-full bg-linear-to-br from-purple-500 to-violet-600 p-3">
                        <Brain size={22} className="animate-pulse text-white" />
                    </div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-300">
                        AI Analyzing Your Code
                    </div>
                    <div className="text-text-muted mt-1 text-[11px]">
                        Powered by Groq · Llama 3.3 70B
                    </div>
                </div>
            </div>
        )
    }

    if (!feedback) {
        return (
            <div className="text-text-muted flex h-full flex-col items-center justify-center gap-4 py-12">
                <div className="rounded-full bg-gradient-to-br from-purple-500/10 to-violet-600/10 p-4">
                    <Sparkles size={28} className="text-purple-400/50" />
                </div>
                <div className="text-center">
                    <div className="text-text-muted hover:text-text-secondary text-sm transition-colors">
                        Get instant AI feedback on your code
                    </div>
                    <div className="text-text-muted hover:text-text-secondary mt-1 text-[11px] transition-colors">
                        Complexity analysis · Code quality · Optimization tips
                    </div>
                </div>
                <button
                    onClick={onRetry}
                    className="mt-1 flex items-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-violet-600 px-5 py-2 text-xs font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] hover:shadow-purple-500/40"
                >
                    <Sparkles size={14} /> Analyze with AI
                </button>
            </div>
        )
    }

    if (feedback.error) {
        return (
            <div className="flex flex-col items-center gap-3 py-8">
                <XCircle size={24} className="text-error/60" />
                <div className="text-error text-sm">{feedback.error}</div>
                <button
                    onClick={onRetry}
                    className="text-text-muted hover:bg-bg-muted hover:text-text-primary mt-1 flex items-center gap-1.5 rounded-md border border-purple-500/30 px-3 py-1.5 text-xs transition-all"
                >
                    <RotateCcw size={12} /> Retry
                </button>
            </div>
        )
    }

    const rating = feedback.rating || 0
    const ratingColor =
        rating >= 8 ? 'var(--ca-success)' : rating >= 5 ? 'var(--ca-warning)' : 'var(--ca-error)'
    const cq = feedback.code_quality || {}

    return (
        <div className="space-y-4">
            {/* ── Top: Rating + Complexity + Algorithm ── */}
            <div className="flex gap-3">
                {/* Rating Circle */}
                <div className="bg-bg-subtle border-border flex min-w-[100px] flex-col items-center justify-center rounded-xl border p-4 transition-colors">
                    <div className="relative flex items-center justify-center">
                        <svg width="56" height="56" viewBox="0 0 56 56">
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                fill="none"
                                stroke="var(--ca-border)"
                                strokeWidth="4"
                            />
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                fill="none"
                                stroke={ratingColor}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${(rating / 10) * 150.8} 150.8`}
                                transform="rotate(-90 28 28)"
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <span
                            className="absolute font-mono text-lg font-bold"
                            style={{ color: ratingColor }}
                        >
                            {rating}
                        </span>
                    </div>
                    <div className="text-text-muted mt-1 text-[10px] font-medium uppercase">
                        Score
                    </div>
                </div>

                {/* Complexity Cards */}
                <div className="grid flex-1 grid-cols-2 gap-2">
                    <div className="bg-bg-subtle border-border rounded-xl border p-3 transition-colors">
                        <div className="mb-1 flex items-center gap-1.5">
                            <Zap size={12} className="text-purple-600 dark:text-purple-400" />
                            <span className="text-text-muted text-[10px] font-bold uppercase">
                                Time
                            </span>
                        </div>
                        <div className="font-mono text-sm font-bold text-purple-700 dark:text-purple-300">
                            {feedback.timeComplexity || '—'}
                        </div>
                    </div>
                    <div className="bg-bg-subtle border-border rounded-xl border p-3 transition-colors">
                        <div className="mb-1 flex items-center gap-1.5">
                            <HardDrive size={12} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-text-muted text-[10px] font-bold uppercase">
                                Space
                            </span>
                        </div>
                        <div className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
                            {feedback.spaceComplexity || '—'}
                        </div>
                    </div>
                    {/* Algorithm badge */}
                    <div className="bg-bg-subtle border-border col-span-2 rounded-xl border p-3 transition-colors">
                        <div className="mb-1 flex items-center gap-1.5">
                            <Brain size={12} className="text-violet-600 dark:text-violet-400" />
                            <span className="text-text-muted text-[10px] font-bold uppercase">
                                Algorithm
                            </span>
                        </div>
                        <div className="text-sm font-medium text-violet-700 dark:text-violet-300">
                            {feedback.algorithm || '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Verdict Explanation ── */}
            {feedback.verdict_explanation && (
                <div className="bg-bg-subtle border-border rounded-xl border p-3 transition-colors">
                    <div className="flex items-start gap-2">
                        <Target size={14} className="text-text-muted mt-0.5 flex-shrink-0" />
                        <p className="text-text-secondary text-xs leading-relaxed">
                            {feedback.verdict_explanation}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Code Quality Bars ── */}
            {(cq.readability || cq.efficiency || cq.correctness) && (
                <div className="bg-bg-subtle border-border rounded-xl border p-4 transition-colors">
                    <div className="mb-3 flex items-center gap-1.5">
                        <BarChart3 size={13} className="text-text-muted" />
                        <span className="text-text-muted text-[10px] font-bold uppercase">
                            Code Quality
                        </span>
                    </div>
                    <div className="space-y-2.5">
                        {cq.readability && (
                            <QualityBar
                                label="Readability"
                                value={cq.readability}
                                color="var(--ca-accent)"
                            />
                        )}
                        {cq.efficiency && (
                            <QualityBar
                                label="Efficiency"
                                value={cq.efficiency}
                                color="var(--ca-info)"
                            />
                        )}
                        {cq.correctness && (
                            <QualityBar
                                label="Correctness"
                                value={cq.correctness}
                                color="var(--ca-success)"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* ── Strengths ── */}
            {feedback.strengths?.length > 0 && (
                <div className="bg-success/5 border-success/20 rounded-xl border p-4 transition-colors">
                    <div className="mb-2.5 flex items-center gap-1.5">
                        <ThumbsUp size={13} className="text-success" />
                        <span className="text-success text-[10px] font-bold uppercase">
                            Strengths
                        </span>
                    </div>
                    <ul className="space-y-2">
                        {feedback.strengths.map((s, i) => (
                            <li
                                key={i}
                                className="text-text-secondary flex items-start gap-2 text-xs leading-relaxed"
                            >
                                <CheckCircle2
                                    size={13}
                                    className="text-success/60 mt-0.5 flex-shrink-0"
                                />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Improvements ── */}
            {feedback.improvements?.length > 0 && (
                <div className="bg-warning/5 border-warning/20 rounded-xl border p-4 transition-colors">
                    <div className="mb-2.5 flex items-center gap-1.5">
                        <Lightbulb size={13} className="text-warning" />
                        <span className="text-warning text-[10px] font-bold uppercase">
                            Improvements
                        </span>
                    </div>
                    <ul className="space-y-2">
                        {feedback.improvements.map((s, i) => (
                            <li
                                key={i}
                                className="text-text-secondary flex items-start gap-2 text-xs leading-relaxed"
                            >
                                <ArrowRight
                                    size={13}
                                    className="text-warning/60 mt-0.5 flex-shrink-0"
                                />
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Optimal Approach ── */}
            {feedback.optimal_approach && (
                <div className="bg-info/5 border-info/20 rounded-xl border p-4 transition-colors">
                    <div className="mb-2 flex items-center gap-1.5">
                        <Award size={13} className="text-info" />
                        <span className="text-info text-[10px] font-bold uppercase">
                            Optimal Approach
                        </span>
                    </div>
                    <p className="text-text-secondary text-xs leading-relaxed">
                        {feedback.optimal_approach}
                    </p>
                </div>
            )}

            {/* ── Re-analyze button ── */}
            <div className="flex justify-center pt-1">
                <button
                    onClick={onRetry}
                    className="border-border text-text-muted hover:border-accent hover:text-accent flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] transition-colors"
                >
                    <RotateCcw size={11} /> Re-analyze
                </button>
            </div>
        </div>
    )
}
