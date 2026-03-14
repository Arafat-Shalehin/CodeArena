'use client'

import React, { useState, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import {
    Play,
    CheckCircle2,
    Loader2,
    RotateCcw,
    Copy,
    Check,
    AlignLeft,
    ChevronDown,
    FileCode2,
    Maximize2,
    Minimize2,
} from 'lucide-react'

// ─── Language config ─────────────────────────────────────────────────────────

const LANG_LABELS = {
    python: 'Python 3',
    javascript: 'JavaScript',
    cpp: 'C++',
    java: 'Java',
}

// ─── EditorPanel ─────────────────────────────────────────────────────────────

/**
 * Self-contained Monaco editor panel for the interview shell.
 *
 * Props:
 *  code          – current editor value (controlled by parent)
 *  onChange      – (newCode: string) => void
 *  language      – current language key
 *  onLanguage    – (lang: string) => void
 *  onRun         – () => void  — triggers test execution
 *  onSubmit      – () => void  — triggers submission pipeline
 *  isRunning     – boolean
 *  isSubmitting  – boolean
 *  onMaximize    – () => void
 *  isMaximized   – boolean
 */
export default function EditorPanel({
    code,
    onChange,
    language = 'python',
    onLanguage,
    onRun,
    onSubmit,
    isRunning = false,
    isSubmitting = false,
    onMaximize,
    isMaximized = false,
}) {
    const { resolvedTheme } = useTheme()
    const editorRef = useRef(null)
    const [cursor, setCursor] = useState({ ln: 1, col: 1 })
    const [copied, setCopied] = useState(false)
    const [showLangDropdown, setShowLangDropdown] = useState(false)

    const handleMount = useCallback((editor) => {
        editorRef.current = editor
        editor.onDidChangeCursorPosition((e) => {
            setCursor({ ln: e.position.lineNumber, col: e.position.column })
        })
    }, [])

    const handleFormat = () => {
        editorRef.current?.getAction('editor.action.formatDocument')?.run()
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(code || '')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleReset = () => {
        onChange?.('')
    }

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className="border-border bg-bg-subtle flex h-[42px] flex-shrink-0 items-center justify-between border-b px-3">
                {/* Left: title + lang picker */}
                <div className="flex items-center gap-3">
                    <span className="text-text-primary flex items-center gap-1.5 text-xs font-bold">
                        <FileCode2 size={14} className="text-accent" />
                        Code Editor
                    </span>
                    <div className="bg-border h-4 w-px" />

                    {/* Language Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLangDropdown((v) => !v)}
                            className="bg-bg-muted text-text-primary flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold transition-all hover:opacity-80"
                        >
                            {LANG_LABELS[language] ?? language}
                            <ChevronDown
                                size={13}
                                className={`transition-transform ${showLangDropdown ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {showLangDropdown && (
                            <div className="border-border bg-bg-subtle absolute top-full left-0 z-50 mt-1 w-40 rounded-xl border shadow-2xl">
                                <div className="p-1">
                                    {Object.entries(LANG_LABELS).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                onLanguage?.(key)
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

                {/* Right: toolbar actions */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleFormat}
                        title="Format Code"
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                    >
                        <AlignLeft size={15} />
                    </button>
                    <button
                        onClick={handleReset}
                        title="Reset Code"
                        className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                    >
                        <RotateCcw size={15} />
                    </button>
                    <button
                        onClick={handleCopy}
                        title="Copy Code"
                        className={`rounded-lg p-1.5 transition-all ${
                            copied
                                ? 'text-success bg-success/10'
                                : 'text-text-muted hover:bg-bg-muted hover:text-text-primary'
                        }`}
                    >
                        {copied ? <Check size={15} /> : <Copy size={15} />}
                    </button>

                    <div className="bg-border mx-1 h-4 w-px" />

                    {/* Run */}
                    <button
                        onClick={onRun}
                        disabled={isRunning || isSubmitting}
                        title="Run sample tests"
                        className="bg-bg-muted text-text-primary hover:bg-bg-muted/80 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRunning ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Play size={13} />
                        )}
                        Run
                    </button>

                    {/* Submit */}
                    <button
                        onClick={onSubmit}
                        disabled={isRunning || isSubmitting}
                        title="Submit solution"
                        className="bg-accent hover:bg-accent-hover flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <CheckCircle2 size={13} />
                        )}
                        Submit
                    </button>

                    <div className="bg-border mx-1 h-4 w-px" />

                    {onMaximize && (
                        <button
                            onClick={onMaximize}
                            title={isMaximized ? 'Restore' : 'Maximize'}
                            className="text-text-muted hover:bg-bg-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                        >
                            {isMaximized ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Monaco Editor ───────────────────────────────────────── */}
            <div className="min-h-0 flex-1">
                <Editor
                    height="100%"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    theme={resolvedTheme === 'dark' ? 'vs-dark' : 'vs'}
                    onChange={(v) => onChange?.(v ?? '')}
                    onMount={handleMount}
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

            {/* ─── Status Bar ─────────────────────────────────────────── */}
            <div className="border-border bg-bg-subtle text-text-muted flex h-[26px] flex-shrink-0 items-center justify-between border-t px-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                    <div className="bg-success h-1.5 w-1.5 rounded-full" />
                    {LANG_LABELS[language] ?? language}
                </span>
                <span className="font-mono">
                    Ln <span className="text-text-primary">{cursor.ln}</span>, Col{' '}
                    <span className="text-text-primary">{cursor.col}</span>
                </span>
            </div>
        </div>
    )
}
