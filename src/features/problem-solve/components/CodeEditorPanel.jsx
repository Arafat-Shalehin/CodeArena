'use client'

import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import {
    ChevronDown,
    ChevronUp,
    RotateCcw,
    Copy,
    Settings2,
    Maximize2,
    Minimize2,
} from 'lucide-react'

import { useProblemSolve, LANG_LABELS } from '@/context/ProblemSolveContext'

export default function CodeEditorPanel({ onMaximize, onCollapse, isMaximized }) {
    const { code, updateCode, language, setLanguage, resetCode } = useProblemSolve()
    const [showLangDropdown, setShowLangDropdown] = useState(false)
    const [cursor, setCursor] = useState({ ln: 1, col: 1 })

    const handleEditorMount = (editor) => {
        editor.onDidChangeCursorPosition((e) => {
            setCursor({ ln: e.position.lineNumber, col: e.position.column })
        })
    }

    return (
        <>
            {/* Header */}
            <div className="flex h-[38px] flex-shrink-0 items-center justify-between border-b border-[#333] px-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-300">{'</>'} Code</span>
                    <div className="relative">
                        <button
                            onClick={() => setShowLangDropdown(!showLangDropdown)}
                            className="flex items-center gap-1 rounded-md bg-[#3a3a3a] px-2.5 py-1 text-xs font-medium text-gray-300 hover:bg-[#444]"
                        >
                            {LANG_LABELS[language]}
                            <ChevronDown size={12} />
                        </button>
                        {showLangDropdown && (
                            <div className="absolute top-full left-0 z-50 mt-1 w-40 rounded-md border border-[#444] bg-[#2a2a2a] py-1 shadow-xl">
                                {Object.entries(LANG_LABELS).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setLanguage(key)
                                            setShowLangDropdown(false)
                                        }}
                                        className={`w-full px-3 py-1.5 text-left text-xs hover:bg-[#3a3a3a] ${
                                            language === key
                                                ? 'bg-[#3a3a3a] text-white'
                                                : 'text-gray-400'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-600">| Auto</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                    <button
                        onClick={resetCode}
                        className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white"
                        title="Reset"
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                        onClick={() => navigator.clipboard.writeText(code)}
                        className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white"
                        title="Copy"
                    >
                        <Copy size={14} />
                    </button>
                    <button
                        className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white"
                        title="Settings"
                    >
                        <Settings2 size={14} />
                    </button>
                    <button
                        onClick={onMaximize}
                        className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white"
                        title={isMaximized ? 'Restore' : 'Fullscreen'}
                    >
                        {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    {onCollapse && (
                        <button
                            onClick={onCollapse}
                            className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white"
                            title="Collapse"
                        >
                            <ChevronUp size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    theme="vs-dark"
                    onChange={(v) => updateCode(v || '')}
                    onMount={handleEditorMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
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
            </div>

            {/* Footer */}
            <div className="flex h-[24px] flex-shrink-0 items-center justify-between border-t border-[#333] px-3 text-[10px] text-gray-600">
                <span>Saved</span>
                <span>
                    Ln {cursor.ln}, Col {cursor.col}
                </span>
            </div>
        </>
    )
}
