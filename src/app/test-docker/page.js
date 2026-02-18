'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
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
    Loader2
} from 'lucide-react';

// Sample codes for different languages
const SAMPLE_CODES = {
    python: {
        file: 'main.py',
        code: `# Simple addition program
a, b = map(int, input().split())
print(f"Sum: {a + b}")`
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
}`
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
}`
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
});`
    },
};

export default function DockerIDEPage() {
    // State
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(SAMPLE_CODES.python.code);
    const [input, setInput] = useState('5 10');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [activeTab, setActiveTab] = useState('TERMINAL'); // TERMINAL, OUTPUT, DEBUG
    const [systemStatus, setSystemStatus] = useState(null);
    const [sidebarActive, setSidebarActive] = useState('EXPLORER'); // EXPLORER, SETTINGS

    // Initial load
    useEffect(() => {
        checkSystemStatus();
    }, []);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setCode(SAMPLE_CODES[lang].code);
    };

    const checkSystemStatus = async () => {
        try {
            const response = await fetch('/api/evaluation/status');
            const data = await response.json();
            setSystemStatus(data);
        } catch (error) {
            console.error('Failed to check system status:', error);
            setSystemStatus({ success: false, error: error.message });
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setActiveTab('OUTPUT');
        setOutput('Running code...\n');

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
            });

            const data = await response.json();

            if (data.success) {
                const { output: execOutput, error: execError, executionTime, memoryUsed, verdict } = data.result;
                let finalOutput = '';

                if (execOutput) finalOutput += execOutput;
                if (execError) finalOutput += `\nError:\n${execError}`;

                finalOutput += `\n\n=== Execution Details ===\n`;
                finalOutput += `Verdict: ${verdict}\n`;
                finalOutput += `Time: ${executionTime}ms\n`;
                finalOutput += `Memory: ${memoryUsed}KB`;

                setOutput(finalOutput);
            } else {
                setOutput(`System Error: ${data.error}\n${data.message || ''}`);
            }
        } catch (error) {
            setOutput(`Network Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden">
            {/* Activity Bar (Leftmost narrow strip) */}
            <div className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-4 border-r border-[#1e1e1e]">
                <button
                    onClick={() => setSidebarActive('EXPLORER')}
                    className={`p-2 rounded ${sidebarActive === 'EXPLORER' ? 'text-white border-l-2 border-blue-500 bg-[#252526]' : 'text-gray-500 hover:text-white'}`}
                    title="Explorer"
                >
                    <FileCode size={24} />
                </button>
                <button
                    onClick={() => {
                        setSidebarActive('SETTINGS');
                        checkSystemStatus();
                    }}
                    className={`p-2 rounded ${sidebarActive === 'SETTINGS' ? 'text-white border-l-2 border-blue-500 bg-[#252526]' : 'text-gray-500 hover:text-white'}`}
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
            <div className="w-64 bg-[#252526] flex flex-col border-r border-[#1e1e1e]">
                <div className="h-10 px-4 flex items-center text-xs font-bold tracking-wider text-gray-400 uppercase bg-[#252526]">
                    {sidebarActive}
                </div>

                {sidebarActive === 'EXPLORER' && (
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-2 py-1 text-xs font-bold text-gray-500 uppercase flex items-center cursor-pointer hover:text-white">
                            <ChevronRight size={14} className="mr-1" />
                            CODEARENA WORKSPACE
                        </div>
                        <div className="mt-1">
                            {Object.keys(SAMPLE_CODES).map((lang) => (
                                <div
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`flex items-center px-4 py-1.5 cursor-pointer text-sm ${language === lang ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'}`}
                                >
                                    <span className={`w-3 h-3 rounded-full mr-2 ${lang === 'python' ? 'bg-blue-400' :
                                        lang === 'javascript' ? 'bg-yellow-400' :
                                            lang === 'java' ? 'bg-red-400' : 'bg-purple-400'
                                        }`}></span>
                                    {SAMPLE_CODES[lang].file}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sidebarActive === 'SETTINGS' && (
                    <div className="flex-1 p-4">
                        <h3 className="text-sm font-semibold mb-4 text-white">System Status</h3>
                        {systemStatus ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Docker Engine</span>
                                    {systemStatus.docker?.available ?
                                        <CheckCircle2 size={16} className="text-green-500" /> :
                                        <XCircle size={16} className="text-red-500" />
                                    }
                                </div>
                                <div className="h-px bg-gray-700 my-2"></div>
                                <div className="space-y-2">
                                    <p className="text-xs text-gray-500 uppercase">Languages</p>
                                    {systemStatus.languages?.map(lang => (
                                        <div key={lang.language} className="flex items-center justify-between text-sm">
                                            <span className="capitalize">{lang.name}</span>
                                            {lang.ready ?
                                                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded">Ready</span> :
                                                <span className="text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded">Error</span>
                                            }
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
                            className="mt-6 w-full py-2 bg-[#007acc] hover:bg-[#0062a3] text-white text-sm rounded flex items-center justify-center gap-2"
                        >
                            Refresh Status
                        </button>
                    </div>
                )}
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                {/* Editor Tabs */}
                <div className="h-9 bg-[#252526] flex items-center overflow-x-auto">
                    <div className="bg-[#1e1e1e] text-white px-3 py-2 text-sm flex items-center border-t-2 border-blue-500 min-w-[120px]">
                        <span className={`w-3 h-3 rounded-full mr-2 ${language === 'python' ? 'bg-blue-400' :
                            language === 'javascript' ? 'bg-yellow-400' :
                                language === 'java' ? 'bg-red-400' : 'bg-purple-400'
                            }`}></span>
                        {SAMPLE_CODES[language].file}
                        <button className="ml-auto text-gray-400 hover:text-white">×</button>
                    </div>
                    {/* Placeholder action bar in tab area */}
                    <div className="ml-auto px-2 flex items-center gap-2">
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className={`p-1.5 rounded hover:bg-[#333] ${isRunning ? 'opacity-50 cursor-not-allowed' : 'text-green-500'}`}
                            title="Run Code (Ctrl+Enter)"
                        >
                            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        </button>
                    </div>
                </div>

                {/* Breadcrumbs / Toolbar */}
                <div className="h-6 bg-[#1e1e1e] flex items-center px-4 text-xs text-gray-500 border-b border-[#2b2b2b]">
                    src &gt; examples &gt; {SAMPLE_CODES[language].file}
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        language={language === 'c++' ? 'cpp' : language}
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            fontFamily: "'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace",
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            padding: { top: 16 }
                        }}
                    />
                </div>

                {/* Bottom Panel (Terminal) */}
                <div className="h-64 bg-[#1e1e1e] border-t border-[#2b2b2b] flex flex-col">
                    {/* Panel Tabs */}
                    <div className="flex items-center px-4 py-2 border-b border-[#2b2b2b] gap-6 text-xs font-semibold tracking-wide">
                        <button
                            onClick={() => setActiveTab('TERMINAL')}
                            className={`${activeTab === 'TERMINAL' ? 'text-white border-b-2 border-white pb-1' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            TERMINAL (INPUT)
                        </button>
                        <button
                            onClick={() => setActiveTab('OUTPUT')}
                            className={`${activeTab === 'OUTPUT' ? 'text-white border-b-2 border-white pb-1' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            OUTPUT
                        </button>
                        <button className="text-gray-500 hover:text-gray-300">DEBUG CONSOLE</button>
                        <div className="ml-auto flex items-center gap-2 text-gray-500">
                            <Trash2 size={14} className="cursor-pointer hover:text-white" onClick={() => { setOutput(''); setInput(''); }} />
                            <Maximize2 size={14} className="cursor-pointer hover:text-white" />
                        </div>
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                        {activeTab === 'TERMINAL' && (
                            <div className="h-full flex flex-col">
                                <label className="text-gray-500 mb-2 text-xs">Standard Input (stdin):</label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="flex-1 bg-[#1e1e1e] text-gray-300 outline-none resize-none border border-[#333] p-2 rounded focus:border-blue-500"
                                    placeholder="Enter input here..."
                                    spellCheck="false"
                                />
                            </div>
                        )}
                        {activeTab === 'OUTPUT' && (
                            <pre className="whitespace-pre-wrap text-gray-300 font-mono">
                                {output || <span className="text-gray-600 italic">No output yet. Click &apos;Run&apos; to execute code.</span>}
                            </pre>
                        )}
                    </div>
                </div>

                {/* Status Bar */}
                <div className="h-6 bg-[#007acc] text-white flex items-center px-3 text-xs justify-between select-none">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><Terminal size={12} /> Ready</span>
                        <span>Ln 1, Col 1</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>UTF-8</span>
                        <span>{language.toUpperCase()}</span>
                        <span className="hover:bg-white/20 px-1 rounded cursor-pointer">Run Application</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
