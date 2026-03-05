'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { ChevronDown, RotateCcw, Copy, Settings2, Maximize2, GripHorizontal } from 'lucide-react'

import { useProblemSolve, LANG_LABELS } from '@/context/ProblemSolveContext'
import ExecutionConsole from './ExecutionConsole'

// ─── Resizable Panel Hook ───────────────────────────────────────────────────

function useResizable(initialRatio = 0.6, direction = 'vertical') {
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

// ─── CodeWorkspace ──────────────────────────────────────────────────────────

export default function CodeWorkspace({ problem }) {
    const { code, updateCode, language, setLanguage, resetCode } = useProblemSolve()

    const vSplit = useResizable(0.6, 'vertical')
    const [showLangDropdown, setShowLangDropdown] = useState(false)

    const handleLanguageChange = (lang) => {
        setLanguage(lang)
        setShowLangDropdown(false)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
    }

    if (!problem) return null

    return (
        <div ref={vSplit.containerRef} className="flex flex-1 flex-col gap-1.5 overflow-hidden">
            <div
                style={{ height: `${vSplit.ratio * 100}%` }}
                className="flex flex-col overflow-hidden rounded-lg bg-[#282828]"
            >
                {/* Editor Header */}
                <div className="flex h-[38px] flex-shrink-0 items-center justify-between border-b border-[#333] bg-[#282828] px-3">
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
                                            onClick={() => handleLanguageChange(key)}
                                            className={`w-full px-3 py-1.5 text-left text-xs hover:bg-[#3a3a3a] ${language === key ? 'bg-[#3a3a3a] text-white' : 'text-gray-400'}`}
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
                            title="Reset Code"
                        >
                            <RotateCcw size={14} />
                        </button>
                        <button
                            onClick={handleCopy}
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
                            className="rounded p-1 hover:bg-[#3a3a3a] hover:text-white"
                            title="Fullscreen"
                        >
                            <Maximize2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1">
                    <Editor
                        height="100%"
                        language={language === 'cpp' ? 'cpp' : language}
                        value={code}
                        theme="vs-dark"
                        onChange={(value) => updateCode(value || '')}
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

                {/* Editor Footer */}
                <div className="flex h-[24px] flex-shrink-0 items-center justify-end border-t border-[#333] bg-[#282828] px-3 text-[10px] text-gray-600">
                    <span>Saved</span>
                    <span className="mx-4">Ln 1, Col 1</span>
                </div>
            </div>

            {/* ─── Vertical Drag Handle ─── */}
            <div
                onMouseDown={vSplit.onMouseDown}
                className="flex h-[6px] cursor-row-resize items-center justify-center bg-[#1a1a1a] transition-colors hover:bg-[#007acc]"
            >
                <GripHorizontal size={10} className="text-gray-600" />
            </div>

            {/* ─── Bottom: Console / Test Cases ─── */}
            <div
                style={{ height: `${(1 - vSplit.ratio) * 100}%` }}
                className="flex flex-col overflow-hidden rounded-lg bg-[#282828]"
            >
                <ExecutionConsole />
            </div>
        </div>
    )
}
