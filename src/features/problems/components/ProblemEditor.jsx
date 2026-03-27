'use client'

import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import {
    Play,
    Send,
    Terminal,
    ChevronRight,
    Loader2,
    Trash2,
    Settings,
    Maximize2,
    Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const SAMPLE_CODES = {
    python: `# Write your Python solution here
def solve():
    # Read input from stdin
    # line = input()
    # print(line)
    pass

if __name__ == "__main__":
    solve()`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your C++ solution here
    return 0;
}`,
    java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your Java solution here
    }
}`,
    javascript: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    // Write your JavaScript solution here
    console.log(line);
});`,
}

/**
 * ProblemEditor Component
 *
 * A multi-language code editor with execution capabilities.
 * Supports running against custom input and submitting against all test cases.
 *
 * Props:
 * - problemId {string} - The ID of the problem being solved
 * - initialLanguage {string} - Default language (default: 'python')
 */
export default function ProblemEditor({ problemId, initialLanguage = 'python' }) {
    const { resolvedTheme } = useTheme()
    const [language, setLanguage] = useState(initialLanguage)
    const [code, setCode] = useState(SAMPLE_CODES[initialLanguage] || '')
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState('OUTPUT') // INPUT, OUTPUT
    const [verdict, setVerdict] = useState(null)
    const [stats, setStats] = useState(null) // { time, memory, passedCount, totalCount }

    const editorRef = useRef(null)

    // Update code template when language changes
    const handleLanguageChange = (lang) => {
        setLanguage(lang)
        if (code === SAMPLE_CODES[language] || code.trim() === '') {
            setCode(SAMPLE_CODES[lang])
        }
    }

    /** Run code against custom input (one-off test) */
    const handleRun = async () => {
        if (isRunning || isSubmitting) return

        setIsRunning(true)
        setActiveTab('OUTPUT')
        setVerdict(null)
        setOutput('Executing test...\n')

        try {
            const res = await fetch('/api/evaluation/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, input }),
            })

            const data = await res.json()

            if (data.success) {
                const {
                    output: execOut,
                    error: execErr,
                    executionTime,
                    memoryUsed,
                    verdict: resVerdict,
                } = data.result
                let finalOut = execOut || ''
                if (execErr) finalOut += `\nError:\n${execErr}`

                setOutput(
                    finalOut ||
                        (resVerdict === 'SUCCESS' ? 'Execution finished with no output.' : '')
                )
                setVerdict(resVerdict)
                setStats({ time: executionTime, memory: memoryUsed })
            } else {
                setOutput(`System Error: ${data.error}\n${data.message || ''}`)
            }
        } catch (err) {
            setOutput(`Network Error: ${err.message}`)
        } finally {
            setIsRunning(false)
        }
    }

    /** Poll for submission results */
    const pollSubmission = async (submissionId) => {
        const MAX_RETRIES = 60 // 60 seconds max
        let retries = 0

        const poll = async () => {
            try {
                const res = await fetch(`/api/submissions/${submissionId}`)
                const json = await res.json()

                if (json.success) {
                    const sub = json.data
                    if (sub.status === 'completed' || sub.status === 'error') {
                        const subVerdict = sub.verdict?.toUpperCase() || 'ERROR'
                        setVerdict(subVerdict)

                        // Note: The structure of json.data from API might differ slightly from
                        // what the previous direct execution returned.
                        setStats({
                            time: sub.executionTime,
                            memory: sub.memoryUsed,
                            // We don't have passedCount/totalCount in the model yet,
                            // but we can add them to the submission model later if needed.
                        })

                        let message = `Verdict: ${subVerdict}\n`
                        if (sub.executionTime !== undefined)
                            message += `Time: ${sub.executionTime}ms\n`
                        if (sub.memoryUsed !== undefined) message += `Memory: ${sub.memoryUsed}KB`
                        if (sub.error) message += `\nError: ${sub.error}`

                        setOutput(message)
                        setIsSubmitting(false)
                        return
                    }

                    // Still processing
                    setOutput(`Status: ${sub.status.toUpperCase()}...\n`)
                }
            } catch (err) {
                console.error('Polling error:', err)
            }

            retries++
            if (retries < MAX_RETRIES) {
                setTimeout(poll, 1000)
            } else {
                setOutput('Submission timed out while waiting for results.')
                setIsSubmitting(false)
            }
        }

        poll()
    }

    /** Submit code against hidden test cases */
    const handleSubmit = async () => {
        if (isRunning || isSubmitting) return

        setIsSubmitting(true)
        setActiveTab('OUTPUT')
        setVerdict(null)
        setOutput('Submitting to judge...\n')

        try {
            // Note: The specific submission route might be /api/problems/[id]/submit
            // per current frontend code, which calls submitCode in submission.controller.js
            const res = await fetch(`/api/problems/${problemId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language }),
            })

            const json = await res.json()

            if (json.success) {
                const submissionId = json.data._id || json.data.id
                setOutput('Queued for evaluation...\n')
                pollSubmission(submissionId)
            } else {
                setVerdict('ERROR')
                setOutput(`Submission Error: ${json.message || json.error || 'Failed to submit'}`)
                setIsSubmitting(false)
            }
        } catch (err) {
            setOutput(`Network Error: ${err.message}`)
            setIsSubmitting(false)
        }
    }

    return (
        <div className="border-border bg-bg-page flex h-full flex-col overflow-hidden rounded-xl border shadow-2xl">
            {/* Header / Toolbar */}
            <div className="border-border bg-bg-subtle flex h-12 items-center justify-between border-b px-4">
                <div className="flex items-center gap-3">
                    <div className="bg-bg-muted border-border flex rounded-md border px-2 py-1">
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="text-text-primary cursor-pointer bg-transparent font-mono text-xs outline-none"
                        >
                            <option value="python">Python 3</option>
                            <option value="cpp">C++ 17</option>
                            <option value="java">Java 11</option>
                            <option value="javascript">JavaScript (Node.js)</option>
                        </select>
                    </div>
                    <span className="text-text-muted font-mono text-[10px] tracking-tighter">
                        ID: {problemId.substring(0, 8)}...
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting}
                        className="h-8 gap-1.5 border border-green-500/20 text-xs text-green-500 hover:bg-green-500/10 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                    >
                        {isRunning ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Play size={14} />
                        )}
                        Run
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isRunning || isSubmitting}
                        className="bg-accent hover:bg-accent-hover shadow-accent/20 h-8 gap-1.5 text-xs text-white shadow-lg"
                    >
                        {isSubmitting ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Send size={14} />
                        )}
                        Submit
                    </Button>
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="relative min-h-75 flex-1">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
                    onMount={(editor) => (editorRef.current = editor)}
                    onChange={(val) => setCode(val || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: { top: 16 },
                        lineNumbersMinChars: 3,
                        glyphMargin: false,
                        folding: true,
                    }}
                />
            </div>

            {/* Bottom Panel (Console) */}
            <div className="border-border bg-bg-page flex h-56 flex-col border-t">
                {/* Panel Tabs */}
                <div className="border-border flex items-center gap-6 border-b px-4 py-2 text-xs font-semibold tracking-wide">
                    <button
                        onClick={() => setActiveTab('OUTPUT')}
                        className={`${activeTab === 'OUTPUT' ? 'border-accent text-text-primary border-b-2 pb-1' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                        CONSOLE{' '}
                        {verdict && (
                            <span
                                className={`ml-2 rounded-sm px-1.5 text-[10px] font-bold uppercase ${verdict === 'ACCEPTED' || verdict === 'SUCCESS' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}
                            >
                                {verdict}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('INPUT')}
                        className={`${activeTab === 'INPUT' ? 'border-accent text-text-primary border-b-2 pb-1' : 'text-text-muted hover:text-text-secondary'}`}
                    >
                        TEST INPUT
                    </button>

                    <div className="text-text-muted ml-auto flex items-center gap-3">
                        {stats && (
                            <div className="mr-4 flex gap-3 font-mono text-[10px] opacity-60">
                                <span>{stats.time}ms</span>
                                <span>{stats.memory}KB</span>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setOutput('')
                                setVerdict(null)
                                setStats(null)
                            }}
                            className="hover:text-text-primary p-1 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                    {activeTab === 'INPUT' ? (
                        <div className="flex h-full flex-col">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="text-text-primary placeholder:text-text-muted custom-scrollbar flex-1 resize-none border-none bg-transparent p-0 outline-none"
                                placeholder="Enter custom input for 'Run'..."
                                spellCheck="false"
                            />
                        </div>
                    ) : (
                        <pre className="text-text-primary custom-scrollbar h-full whitespace-pre-wrap">
                            {output || (
                                <span className="text-text-muted italic">
                                    Click &apos;Run&apos; to test your code or &apos;Submit&apos; to
                                    verify against all cases.
                                </span>
                            )}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    )
}
