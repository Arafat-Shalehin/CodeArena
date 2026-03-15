'use client'

import React, { useEffect } from 'react'

// Monaco Editor
import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'

/**
 * CodeEditor Component
 * Wraps @monaco-editor/react. Configured to fit the CodeArena Dark Theme tokens.
 *
 * @param {Object} props
 * @param {string} props.initialCode - Initial boilerplate code based on language
 */
import { useProblemSolve } from '@/context/ProblemSolveContext'

export default function CodeEditor({ initialCode = '' }) {
    const { code, updateCode, language } = useProblemSolve()
    const { resolvedTheme } = useTheme()

    // Custom editor mounting to set specific CodeArena aesthetics
    const handleEditorDidMount = (editor, monaco) => {
        // Define Dark Theme
        monaco.editor.defineTheme('codearena-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'ff79c6' },
                { token: 'identifier', foreground: 'f8f8f2' },
                { token: 'string', foreground: 'f1fa8c' },
                { token: 'number', foreground: 'bd93f9' },
            ],
            colors: {
                'editor.background': '#0f1117', // Matches var(--ca-bg-page) in dark
                'editor.lineHighlightBackground': '#161b22', // Matches var(--ca-bg-subtle) in dark
                'editorLineNumber.foreground': '#484f58', // Matches var(--ca-text-muted) in dark
                'editorLineNumber.activeForeground': '#02ba4c', // Matches var(--ca-accent)
                'editorIndentGuide.background': '#21262d', // Matches var(--ca-border) in dark
                'editor.selectionBackground': '#3e445166',
            },
        })

        // Define Light Theme
        monaco.editor.defineTheme('codearena-light', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'd73a49' },
                { token: 'identifier', foreground: '24292e' },
                { token: 'string', foreground: '032f62' },
                { token: 'number', foreground: '005cc5' },
            ],
            colors: {
                'editor.background': '#ffffff', // Matches var(--ca-bg-page) in light
                'editor.lineHighlightBackground': '#f7f8fa', // Matches var(--ca-bg-subtle) in light
                'editorLineNumber.foreground': '#9ca3af', // Matches var(--ca-text-muted) in light
                'editorLineNumber.activeForeground': '#02ba4c', // Matches var(--ca-accent)
                'editorIndentGuide.background': '#e5e7eb', // Matches var(--ca-border) in light
                'editor.selectionBackground': '#add6ff',
            },
        })

        monaco.editor.setTheme(resolvedTheme === 'dark' ? 'codearena-dark' : 'codearena-light')
    }

    // Update theme when resolvedTheme changes
    useEffect(() => {
        if (typeof window !== 'undefined' && window.monaco) {
            window.monaco.editor.setTheme(
                resolvedTheme === 'dark' ? 'codearena-dark' : 'codearena-light'
            )
        }
    }, [resolvedTheme])

    const editorTheme = resolvedTheme === 'dark' ? 'codearena-dark' : 'codearena-light'

    return (
        <div className="bg-bg-page relative h-full w-full flex-1">
            <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(value) => updateCode(value)}
                theme={editorTheme}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    lineHeight: 22,
                    padding: { top: 20, bottom: 20 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    renderLineHighlight: 'all',
                    bracketPairColorization: { enabled: true },
                    guides: { indentation: true },
                    fontLigatures: true,
                }}
                onMount={handleEditorDidMount}
            />
        </div>
    )
}
