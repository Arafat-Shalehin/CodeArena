'use client'

import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import {
    Play,
    Terminal,
    FileCode,
    Settings,
    Cpu,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Copy,
    Trash2,
    Maximize2,
    Minimize2,
    ChevronRight,
    Loader2,
    Sparkles,
} from 'lucide-react'

// Sample codes for different languages
const SAMPLE_CODES = {
    python: {
        file: 'main.py',
        code: `# Simple addition program
a, b = map(int, input().split())
print(f"Sum: {a + b}")`,
    },
    cpp: {
        file: 'solution.cpp',
        code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << "Sum: " << a + b << endl;
    }
    return 0;
}`,
    },
    java: {
        file: 'Solution.java',
        code: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            System.out.println("Sum: " + (a + b));
        }
        sc.close();
    }
}`,
    },
    javascript: {
        file: 'script.js',
        code: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    const parts = line.split(' ');
    if (parts.length >= 2) {
        const a = parseInt(parts[0]);
        const b = parseInt(parts[1]);
        console.log("Sum:", a + b);
    }
    rl.close();
});`,
    },
}

export default function DockerIDEPage() {
    // State
    const [language, setLanguage] = useState('python')
    const [code, setCode] = useState(SAMPLE_CODES.python.code)
    const [input, setInput] = useState('5 10')
    const [output, setOutput] = useState('')
    const [isRunning, setIsRunning] = useState(false)
    const [activeTab, setActiveTab] = useState('TERMINAL') // TERMINAL, OUTPUT, DEBUG, AI_ANALYSIS
    const [systemStatus, setSystemStatus] = useState(null)
    const [sidebarActive, setSidebarActive] = useState('EXPLORER') // EXPLORER, SETTINGS

    // AI States
    const [aiFeedback, setAiFeedback] = useState(null)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [submissionId, setSubmissionId] = useState(null)

    // Initial load
    useEffect(() => {
        checkSystemStatus()
    }, [])

    const handleLanguageChange = (lang) => {
        setLanguage(lang)
        setCode(SAMPLE_CODES[lang].code)
    }

    const checkSystemStatus = async () => {
        try {
            const response = await fetch('/api/evaluation/status')
            const data = await response.json()
            setSystemStatus(data)
        } catch (error) {
            console.error('Failed to check system status:', error)
            setSystemStatus({ success: false, error: error.message })
        }
    }

    const runCode = async () => {
        setIsRunning(true)
        setActiveTab('OUTPUT')
        setOutput('Running code...\n')
        setAiFeedback(null)
        setSubmissionId(null)

        try {
            const response = await fetch('/api/evaluation/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    input,
                    timeLimit: 5000,
                    memoryLimit: 512000,
                }),
            })

            const data = await response.json()

            if (data.success) {
                const {
                    output: execOutput,
                    error: execError,
                    executionTime,
                    memoryUsed,
                    verdict,
                } = data.result
                let finalOutput = ''

                if (execOutput) finalOutput += execOutput
                if (execError) finalOutput += `\\nError:\\n\${execError}`

                // For demo purposes in the sandbox, we mock or fetch the latest submission if the API does not return it directly.
                // In a true environment, POST /judge should return the inserted Submission _id.
                // We'll set a flag to allow manual polling or simulate an ID if we integrated it fully.
                if (verdict === 'ACCEPTED' || verdict === 'TIME_LIMIT_EXCEEDED') {
                    finalOutput += `\\n\\n✨ AI Performance Analysis is running in the background. Check the 'AI ANALYSIS' tab shortly.`
                    // In a real app, `data.submissionId` would be returned here.
                    // For the sake of this sandbox, we'll assume the problem ID is a dummy hash.
                    setSubmissionId('demo-sandbox-id')
                }

                finalOutput += `\\n\\n=== Execution Details ===\\n`
                finalOutput += `Verdict: \${verdict}\\n`
                finalOutput += `Time: \${executionTime}ms\\n`
                finalOutput += `Memory: \${memoryUsed}KB`

                setOutput(finalOutput)
            } else {
                setOutput(`System Error: \${data.error}\\n\${data.message || ''}`)
            }
        } catch (error) {
            setOutput(`Network Error: \${error.message}`)
        } finally {
            setIsRunning(false)
        }
    }

    const fetchAiFeedback = async () => {
        if (!submissionId) return

        setIsAiLoading(true)
        try {
            // In a real app, this would be the actual MongoDB _id
            // Since this is the sandbox, we might need a modified route to fetch by latest user submission
            // We will simulate the request hitting our new endpoint
            const response = await fetch(`/api/submissions/\${submissionId}/feedback`)
            const data = await response.json()

            if (data.status === 'READY') {
                setAiFeedback(data.feedback)
            } else if (data.status === 'PROCESSING') {
                // Keep it null to show processing
            } else {
                setAiFeedback({ error: data.message })
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsAiLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#1e1e1e] font-sans text-gray-300">
            {/* Activity Bar (Leftmost narrow strip) */}
            <div className="flex w-12 flex-col items-center gap-4 border-r border-[#1e1e1e] bg-[#333333] py-4">
                <button
                    onClick={() => setSidebarActive('EXPLORER')}
                    className={`\${ sidebarActive === 'EXPLORER' ? 'border-l-2 text-white' : 'text-gray-500 hover:text-white'} rounded border-blue-500 bg-[#252526] p-2`}
                    title="Explorer"
                >
                    <FileCode size={24} />
                </button>
                <button
                    onClick={() => {
                        setSidebarActive('SETTINGS')
                        checkSystemStatus()
                    }}
                    className={`\${ sidebarActive === 'SETTINGS' ? 'border-l-2 text-white' : 'text-gray-500 hover:text-white'} rounded border-blue-500 bg-[#252526] p-2`}
                    title="System Status"
                >
                    <Cpu size={24} />
                </button>
                <div className="flex-grow" />
                <button className="p-2 text-gray-500 hover:text-white" title="Settings">
                    <Settings size={24} />
                </button>
            </div>

            {/* Sidebar (Explorer / Status) */}
            <div className="flex w-64 flex-col border-r border-[#1e1e1e] bg-[#252526]">
                <div className="flex h-10 items-center bg-[#252526] px-4 text-xs font-bold tracking-wider text-gray-400 uppercase">
                    {sidebarActive}
                </div>

                {sidebarActive === 'EXPLORER' && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex cursor-pointer items-center px-2 py-1 text-xs font-bold text-gray-500 uppercase hover:text-white">
                            <ChevronRight size={14} className="mr-1" />
                            CODEARENA WORKSPACE
                        </div>
                        <div className="mt-1">
                            {Object.keys(SAMPLE_CODES).map((lang) => (
                                <div
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`\${ language === lang ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:text-gray-200'} flex cursor-pointer items-center px-4 py-1.5 text-sm hover:bg-[#2a2d2e]`}
                                >
                                    <span
                                        className={`\${ lang === 'python' ? 'bg-blue-400' : lang === 'javascript' ? 'bg-yellow-400' : lang === 'java' ? 'bg-red-400' : 'bg-purple-400' } mr-2 h-3 w-3 rounded-full`}
                                    ></span>
                                    {SAMPLE_CODES[lang].file}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sidebarActive === 'SETTINGS' && (
                    <div className="flex-1 p-4">
                        <h3 className="mb-4 text-sm font-semibold text-white">System Status</h3>
                        {systemStatus ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Docker Engine</span>
                                    {systemStatus.docker?.available ? (
                                        <CheckCircle2 size={16} className="text-green-500" />
                                    ) : (
                                        <XCircle size={16} className="text-red-500" />
                                    )}
                                </div>
                                <div className="my-2 h-px bg-gray-700"></div>
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 uppercase">Languages</p>
                                    {systemStatus.languages?.map((lang) => (
                                        <div
                                            key={lang.language}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="capitalize">{lang.name}</span>
                                            {lang.ready ? (
                                                <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-500">
                                                    Ready
                                                </span>
                                            ) : (
                                                <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs text-red-500">
                                                    Error
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={24} className="animate-spin text-blue-500" />
                            </div>
                        )}
                        <button
                            onClick={checkSystemStatus}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-[#007acc] py-2 text-sm text-white hover:bg-[#0062a3]"
                        >
                            Refresh Status
                        </button>
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className="flex min-w-0 flex-1 flex-col bg-[#1e1e1e]">
                {/* Editor Tabs */}
                <div className="flex h-9 items-center overflow-x-auto bg-[#252526]">
                    <div className="flex min-w-[120px] items-center border-t-2 border-blue-500 bg-[#1e1e1e] px-3 py-2 text-sm text-white">
                        <span
                            className={`\${ language === 'python' ? 'bg-blue-400' : language === 'javascript' ? 'bg-yellow-400' : language === 'java' ? 'bg-red-400' : 'bg-purple-400' } mr-2 h-3 w-3 rounded-full`}
                        ></span>
                        {SAMPLE_CODES[language].file}
                        <button className="ml-auto text-gray-400 hover:text-white">×</button>
                    </div>
                    {/* Placeholder action bar in tab area */}
                    <div className="ml-auto flex items-center gap-2 px-2">
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className={`\${ isRunning ? 'cursor-not-allowed opacity-50' : 'text-green-500'} rounded p-1.5 hover:bg-[#333]`}
                            title="Run Code (Ctrl+Enter)"
                        >
                            {isRunning ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Play size={16} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Breadcrumbs / Toolbar */}
                <div className="flex h-6 items-center border-b border-[#2b2b2b] bg-[#1e1e1e] px-4 text-xs text-gray-500">
                    src &gt; examples &gt; {SAMPLE_CODES[language].file}
                </div>

                {/* Monaco Editor */}
                <div className="relative flex-1">
                    <Editor
                        height="100%"
                        language={language === 'c++' ? 'cpp' : language}
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            fontFamily:
                                "'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace",
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            padding: { top: 16 },
                        }}
                    />
                </div>

                {/* Bottom Panel (Terminal) */}
                <div className="flex h-64 flex-col border-t border-[#2b2b2b] bg-[#1e1e1e]">
                    {/* Panel Tabs */}
                    <div className="flex items-center gap-6 border-b border-[#2b2b2b] px-4 py-2 text-xs font-semibold tracking-wide">
                        <button
                            onClick={() => setActiveTab('TERMINAL')}
                            className={`\${ activeTab === 'TERMINAL' ? 'border-b-2 text-white' : 'text-gray-500 hover:text-gray-300'} border-white pb-1`}
                        >
                            TERMINAL (INPUT)
                        </button>
                        <button
                            onClick={() => setActiveTab('OUTPUT')}
                            className={`\${ activeTab === 'OUTPUT' ? 'border-b-2 text-white' : 'text-gray-500 hover:text-gray-300'} border-white pb-1`}
                        >
                            OUTPUT
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('AI_ANALYSIS')
                                if (!aiFeedback) fetchAiFeedback()
                            }}
                            className={`\${activeTab === 'AI_ANALYSIS' ? 'border-b-2 text-purple-400' : 'text-gray-500 hover:text-purple-300'} flex items-center gap-1 border-purple-500 pb-1`}
                        >
                            <Sparkles size={14} /> AI ANALYSIS
                        </button>
                        <button className="text-gray-500 hover:text-gray-300">DEBUG CONSOLE</button>
                        <div className="ml-auto flex items-center gap-2 text-gray-500">
                            <Trash2
                                size={14}
                                className="cursor-pointer hover:text-white"
                                onClick={() => {
                                    setOutput('')
                                    setInput('')
                                }}
                            />
                            <Maximize2 size={14} className="cursor-pointer hover:text-white" />
                        </div>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
                        {activeTab === 'TERMINAL' && (
                            <div className="flex h-full flex-col">
                                <label className="mb-2 text-xs text-gray-500">
                                    Standard Input (stdin):
                                </label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="flex-1 resize-none rounded border border-[#333] bg-[#1e1e1e] p-2 text-gray-300 outline-none focus:border-blue-500"
                                    placeholder="Enter input here..."
                                    spellCheck="false"
                                />
                            </div>
                        )}
                        {activeTab === 'OUTPUT' && (
                            <pre className="font-mono whitespace-pre-wrap text-gray-300">
                                {output || (
                                    <span className="text-gray-600 italic">
                                        No output yet. Click &apos;Run&apos; to execute code.
                                    </span>
                                )}
                            </pre>
                        )}
                        {activeTab === 'AI_ANALYSIS' && (
                            <div className="flex h-full flex-col font-sans">
                                {!submissionId ? (
                                    <div className="flex h-full items-center justify-center text-gray-500">
                                        Run an Accepted or TLE solution to generate AI Feedback.
                                    </div>
                                ) : isAiLoading ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 text-purple-400">
                                        <Loader2 size={24} className="animate-spin" />
                                        <span>Gemini is analyzing your code...</span>
                                    </div>
                                ) : aiFeedback ? (
                                    aiFeedback.error ? (
                                        <div className="text-red-400">{aiFeedback.error}</div>
                                    ) : (
                                        <div className="space-y-4 text-gray-300">
                                            <div className="flex gap-4">
                                                <div className="flex-1 rounded border border-[#333] bg-[#252526] p-3">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase">
                                                        Time Complexity
                                                    </h4>
                                                    <p className="mt-1 font-mono text-lg text-purple-400">
                                                        {aiFeedback.timeComplexity}
                                                    </p>
                                                </div>
                                                <div className="flex-1 rounded border border-[#333] bg-[#252526] p-3">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase">
                                                        Space Complexity
                                                    </h4>
                                                    <p className="mt-1 font-mono text-lg text-blue-400">
                                                        {aiFeedback.spaceComplexity}
                                                    </p>
                                                </div>
                                                <div className="flex-1 rounded border border-[#333] bg-[#252526] p-3">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase">
                                                        Code Rating
                                                    </h4>
                                                    <p className="mt-1 font-mono text-lg text-green-400">
                                                        {aiFeedback.rating} / 10
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="rounded border border-[#333] bg-[#252526] p-4">
                                                <h4 className="mb-2 text-xs font-bold text-green-500 uppercase">
                                                    Strengths
                                                </h4>
                                                <ul className="list-inside list-disc space-y-1 text-sm">
                                                    {aiFeedback.strengths?.map((str, i) => (
                                                        <li key={i}>{str}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="rounded border border-[#333] bg-[#252526] p-4">
                                                <h4 className="mb-2 text-xs font-bold text-yellow-500 uppercase">
                                                    Improvements & Alternative Approaches
                                                </h4>
                                                <ul className="list-inside list-disc space-y-1 text-sm">
                                                    {aiFeedback.improvements?.map((imp, i) => (
                                                        <li key={i}>{imp}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center gap-4 text-gray-500">
                                        <Sparkles size={32} className="opacity-50" />
                                        <button
                                            onClick={fetchAiFeedback}
                                            className="rounded border border-purple-500/50 px-4 py-2 text-purple-400 transition-colors hover:bg-purple-500/10"
                                        >
                                            Fetch AI Analysis
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Bar */}
                <div className="flex h-6 items-center justify-between bg-[#007acc] px-3 text-xs text-white select-none">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Terminal size={12} /> Ready
                        </span>
                        <span>Ln 1, Col 1</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>UTF-8</span>
                        <span>{language.toUpperCase()}</span>
                        <span className="cursor-pointer rounded px-1 hover:bg-white/20">
                            Run Application
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
