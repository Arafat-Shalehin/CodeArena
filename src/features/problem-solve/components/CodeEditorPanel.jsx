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
    Plus,
    X,
    FileCode2,
} from 'lucide-react'

import { useProblemSolve, LANG_LABELS } from '@/context/ProblemSolveContext'

export default function CodeEditorPanel({ onMaximize, onCollapse, isMaximized }) {
    const {
        code,
        updateCode,
        language,
        setLanguage,
        resetCode,
        files,
        activeFileIndex,
        addFile,
        removeFile,
        switchToFile,
    } = useProblemSolve()
    const [showLangDropdown, setShowLangDropdown] = useState(false)
    const [cursor, setCursor] = useState({ ln: 1, col: 1 })
    const [showAddFile, setShowAddFile] = useState(false)
    const [newFileName, setNewFileName] = useState('')

    const handleEditorMount = (editor) => {
        editor.onDidChangeCursorPosition((e) => {
            setCursor({ ln: e.position.lineNumber, col: e.position.column })
        })
    }

    const LANG_EXTENSIONS = { python: '.py', cpp: '.cpp', java: '.java', javascript: '.js' }

    const handleAddFile = () => {
        if (!newFileName.trim()) return
        const ext = LANG_EXTENSIONS[language] || '.txt'
        const filename = newFileName.includes('.') ? newFileName.trim() : newFileName.trim() + ext
        addFile(filename)
        setNewFileName('')
        setShowAddFile(false)
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

            {/* File Tabs Bar */}
            <div className="flex h-[32px] flex-shrink-0 items-center gap-0 overflow-x-auto border-b border-[#333] bg-[#252525] px-1">
                {files.map((file, idx) => (
                    <button
                        key={idx}
                        onClick={() => switchToFile(idx)}
                        className={`group flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
                            activeFileIndex === idx
                                ? 'border-b-2 border-emerald-500 bg-[#1e1e1e] text-white'
                                : 'text-gray-500 hover:bg-[#2e2e2e] hover:text-gray-300'
                        }`}
                    >
                        <FileCode2 size={12} className="flex-shrink-0 text-gray-500" />
                        <span className="max-w-[120px] truncate">{file.filename}</span>
                        {file.isMain && (
                            <span className="rounded bg-emerald-600/20 px-1 py-0.5 text-[8px] font-bold text-emerald-400">
                                MAIN
                            </span>
                        )}
                        {!file.isMain && (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeFile(idx)
                                }}
                                className="ml-0.5 hidden rounded p-0.5 group-hover:inline-flex hover:bg-[#555]"
                                title="Remove file"
                            >
                                <X size={10} />
                            </span>
                        )}
                    </button>
                ))}

                {/* Add File Button */}
                {!showAddFile ? (
                    <button
                        onClick={() => setShowAddFile(true)}
                        className="ml-1 flex items-center gap-1 rounded px-1.5 py-1 text-[10px] text-gray-600 hover:bg-[#333] hover:text-gray-300"
                        title="Add file"
                    >
                        <Plus size={12} />
                    </button>
                ) : (
                    <div className="ml-1 flex items-center gap-1">
                        <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddFile()
                                if (e.key === 'Escape') {
                                    setShowAddFile(false)
                                    setNewFileName('')
                                }
                            }}
                            placeholder="filename"
                            className="w-[100px] rounded border border-[#555] bg-[#2a2a2a] px-2 py-0.5 text-[11px] text-white outline-none focus:border-emerald-500"
                            autoFocus
                        />
                        <button
                            onClick={handleAddFile}
                            className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] text-white hover:bg-emerald-700"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => {
                                setShowAddFile(false)
                                setNewFileName('')
                            }}
                            className="rounded px-1 py-0.5 text-[10px] text-gray-500 hover:text-white"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}
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
                <span>{files.length > 1 ? `${files.length} files` : 'Saved'}</span>
                <span>
                    Ln {cursor.ln}, Col {cursor.col}
                </span>
            </div>
        </>
    )
}
