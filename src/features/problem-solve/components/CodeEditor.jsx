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
export default function CodeEditor({ initialCode = '' }) {
    // Custom editor mounting to set specific CodeArena aesthetics
    const handleEditorDidMount = (editor, monaco) => {
        // We define a custom theme that matches bg-[#1e1e1e] and inter/mono fonts
        monaco.editor.defineTheme('codearena-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#1e1e1e',
                'editor.lineHighlightBackground': '#2d2d2d',
                'editorLineNumber.foreground': '#858585',
                'editorIndentGuide.background': '#2d2d2d',
            },
        })
        monaco.editor.setTheme('codearena-dark')
    }

    return (
        <div className="relative h-full w-full flex-1 bg-[#1e1e1e]">
            <Editor
                height="100%"
                defaultLanguage="python"
                defaultValue={initialCode}
                theme="vs-dark" // Fallback before codearena-dark kicks in
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: '"JetBrains Mono", monospace',
                    lineHeight: 24,
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    renderLineHighlight: 'all',
                }}
                onMount={handleEditorDidMount}
            />
        </div>
    )
}
