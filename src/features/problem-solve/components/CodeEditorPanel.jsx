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
    Check,
    AlignLeft,
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

    const editorRef = React.useRef(null)
    const [copied, setCopied] = useState(false)

    const handleEditorMount = (editor) => {
        editorRef.current = editor
        editor.onDidChangeCursorPosition((e) => {
            setCursor({ ln: e.position.lineNumber, col: e.position.column })
        })
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleFormat = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run()
        }
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
            <div className="border-border bg-bg-subtle flex h-10.5 shrink-0 items-center justify-between border-b px-3">
                <div className="flex items-center gap-3">
                    <span className="text-text-primary flex items-center gap-1.5 text-xs font-bold">
                        <FileCode2 size={14} className="text-accent" />
                        Code Editor
                    </span>
                    <div className="bg-border mx-1 h-4 w-px" />
                    <div className="relative">
                        <button
                            onClick={() => setShowLangDropdown(!showLangDropdown)}
                            className="bg-bg-muted hover:bg-bg-muted/80 text-text-primary flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold transition-all"
                        >
                            {LANG_LABELS[language]}
                            <ChevronDown
                                size={14}
                                className={`transition-transform ${showLangDropdown ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {showLangDropdown && (
                            <div className="border-border bg-bg-subtle animate-fade-up absolute top-full left-0 z-50 mt-1 w-44 rounded-xl border shadow-2xl">
                                <div className="p-1">
                                    {Object.entries(LANG_LABELS).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setLanguage(key)
                                                setShowLangDropdown(false)
                                            }}
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                                                language === key
                                                    ? 'bg-accent/10 text-accent font-bold'
                                                    : 'text-text-secondary hover:bg-bg-muted/50 hover:text-text-primary'
                                            }`}
                                        >
                                            {label}
                                            {language === key && <Check size={12} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleFormat}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        title="Format Code"
                    >
                        <AlignLeft size={16} />
                    </button>
                    <button
                        onClick={resetCode}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={16} />
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`rounded-lg p-1.5 transition-all ${copied ? 'text-success bg-success/10' : 'text-text-muted hover:bg-bg-muted hover:text-text-primary'}`}
                        title="Copy Code"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <div className="bg-border mx-1 h-4 w-px" />
                    <button
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        title="Settings"
                    >
                        <Settings2 size={16} />
                    </button>
                    <button
                        onClick={onMaximize}
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        title={isMaximized ? 'Restore' : 'Fullscreen'}
                    >
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    {onCollapse && (
                        <button
                            onClick={onCollapse}
                            className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                            title="Collapse"
                        >
                            <ChevronUp size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* File Tabs Bar */}
            <div className="bg-bg-page border-border no-scrollbar flex h-8.5 shrink-0 items-center gap-1 overflow-x-auto border-b px-2">
                {files.map((file, idx) => (
                    <button
                        key={idx}
                        onClick={() => switchToFile(idx)}
                        className={`group relative flex items-center gap-2 rounded-t-lg px-4 py-1.5 text-[11px] font-bold transition-all ${
                            activeFileIndex === idx
                                ? 'bg-bg-subtle text-accent'
                                : 'text-text-muted hover:bg-bg-muted/30 hover:text-text-secondary'
                        }`}
                    >
                        <FileCode2
                            size={12}
                            className={activeFileIndex === idx ? 'text-accent' : 'opacity-60'}
                        />
                        <span className="max-w-30 truncate">{file.filename}</span>
                        {file.isMain && (
                            <span className="bg-accent/15 text-accent rounded px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase">
                                Main
                            </span>
                        )}
                        {activeFileIndex === idx && (
                            <div className="bg-accent absolute bottom-0 left-0 h-0.5 w-full" />
                        )}
                        {!file.isMain && (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeFile(idx)
                                }}
                                className="hover:bg-bg-muted/80 ml-1 hidden rounded-full p-0.5 group-hover:inline-flex"
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
                            className="w-25 rounded border border-[#555] bg-[#2a2a2a] px-2 py-0.5 text-[11px] text-white outline-none focus:border-emerald-500"
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
            <div className="border-border bg-bg-subtle text-text-muted flex h-7 shrink-0 items-center justify-between border-t px-4 text-[11px] font-medium">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                        <div className="bg-success h-1.5 w-1.5 rounded-full" />
                        {files.length} {files.length > 1 ? 'files' : 'file'} synced
                    </span>
                    <div className="bg-border h-3 w-px" />
                    <span className="text-[10px] uppercase">{language}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-mono">
                        Line <span className="text-text-primary px-0.5">{cursor.ln}</span>, Col{' '}
                        <span className="text-text-primary px-0.5">{cursor.col}</span>
                    </span>
                </div>
            </div>
        </>
    )
}
