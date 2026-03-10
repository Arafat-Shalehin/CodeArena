'use client'

import React from 'react'

// Monaco Editor
import Editor from '@monaco-editor/react'

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

    // Custom editor mounting to set specific CodeArena aesthetics
    const handleEditorDidMount = (editor, monaco) => {
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
                'editor.background': '#0f0f0f', // Matches bg-page approximately
                'editor.lineHighlightBackground': '#1a1a1a',
                'editorLineNumber.foreground': '#4b5563',
                'editorLineNumber.activeForeground': '#a78bfa',
                'editorIndentGuide.background': '#2d2d2d',
                'editor.selectionBackground': '#3e445166',
            },
        })
        monaco.editor.setTheme('codearena-dark')
    }

    return (
        <div className="relative h-full w-full flex-1 bg-[#0f0f0f]">
            <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(value) => updateCode(value)}
                theme="codearena-dark"
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
