'use client'

import React, { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
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
    output: process.stdout
});

rl.on('line', (line) => {
    // Write your JavaScript solution here
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
                const { output: execOut, error: execErr, executionTime, memoryUsed, verdict: resVerdict } = data.result
                let finalOut = execOut || ''
                if (execErr) finalOut += `\nError:\n${execErr}`

                setOutput(finalOut || (resVerdict === 'SUCCESS' ? 'Execution finished with no output.' : ''))
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

    /** Submit code against hidden test cases */
    const handleSubmit = async () => {
        if (isRunning || isSubmitting) return

        setIsSubmitting(true)
        setActiveTab('OUTPUT')
        setVerdict(null)
        setOutput('Submitting to judge...\n')

        try {
            const res = await fetch(`/api/problems/${problemId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language }),
            })

            const json = await res.json()

            if (json.success) {
                const { verdict: subVerdict, passedCount, totalCount, maxTime, maxMemory } = json.data
                setVerdict(subVerdict)
                setStats({ time: maxTime, memory: maxMemory, passedCount, totalCount })

                let message = `Verdict: ${subVerdict}\n`
                message += `Tests Passed: ${passedCount}/${totalCount}\n`
                message += `Max Time: ${maxTime}ms\n`
                message += `Max Memory: ${maxMemory}KB`

                setOutput(message)
            } else {
                setVerdict('ERROR')
                setOutput(`Submission Error: ${json.error || 'Failed to submit'}`)
            }
        } catch (err) {
            setOutput(`Network Error: ${err.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex h-full flex-col border border-border rounded-xl bg-[#1e1e1e] overflow-hidden shadow-2xl">
            {/* Header / Toolbar */}
            <div className="flex h-12 items-center justify-between border-b border-[#2b2b2b] bg-[#252526] px-4">
                <div className="flex items-center gap-3">
                    <div className="flex bg-[#1e1e1e] rounded-md px-2 py-1 border border-[#3c3c3c]">
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer font-mono"
                        >
                            <option value="python">Python 3</option>
                            <option value="cpp">C++ 17</option>
                            <option value="java">Java 11</option>
                            <option value="javascript">Node.js</option>
                        </select>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono tracking-tighter">ID: {problemId.substring(0, 8)}...</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRun}
                        disabled={isRunning || isSubmitting}
                        className="h-8 gap-1.5 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10 border border-green-500/20"
                    >
                        {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        Run
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isRunning || isSubmitting}
                        className="h-8 gap-1.5 text-xs bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20"
                    >
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Submit
                    </Button>
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="relative flex-1 min-h-[300px]">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    theme="vs-dark"
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
            <div className="flex h-56 flex-col border-t border-[#2b2b2b] bg-[#1e1e1e]">
                {/* Panel Tabs */}
                <div className="flex items-center gap-6 border-b border-[#2b2b2b] px-4 py-2 text-xs font-semibold tracking-wide">
                    <button
                        onClick={() => setActiveTab('OUTPUT')}
                        className={`${activeTab === 'OUTPUT' ? 'border-b-2 border-accent pb-1 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        CONSOLE {verdict && <span className={`ml-2 text-[10px] uppercase font-bold px-1.5 rounded-sm ${verdict === 'ACCEPTED' || verdict === 'SUCCESS' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>{verdict}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('INPUT')}
                        className={`${activeTab === 'INPUT' ? 'border-b-2 border-accent pb-1 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        TEST INPUT
                    </button>

                    <div className="ml-auto flex items-center gap-3 text-gray-500">
                        {stats && (
                            <div className="flex gap-3 mr-4 text-[10px] font-mono opacity-60">
                                <span>{stats.time}ms</span>
                                <span>{stats.memory}KB</span>
                            </div>
                        )}
                        <button
                            onClick={() => { setOutput(''); setVerdict(null); setStats(null); }}
                            className="p-1 hover:text-white transition-colors"
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
                                className="flex-1 resize-none bg-transparent text-gray-300 outline-none border-none p-0 custom-scrollbar"
                                placeholder="Enter custom input for 'Run'..."
                                spellCheck="false"
                            />
                        </div>
                    ) : (
                        <pre className="whitespace-pre-wrap text-gray-300 custom-scrollbar h-full">
                            {output || (
                                <span className="text-gray-600 italic">
                                    Click &apos;Run&apos; to test your code or &apos;Submit&apos; to verify against all cases.
                                </span>
                            )}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    )
}
