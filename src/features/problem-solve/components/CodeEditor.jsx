'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import LazyCodeEditor from '@/components/ui/LazyCodeEditor.jsx'

/**
 * CodeEditor Component
 * Lazy-loaded Monaco Editor wrapper for CodeArena.
 *
 * This component uses LazyCodeEditor to defer loading the Monaco Editor
 * until it's needed, reducing initial bundle size by ~200KB+.
 *
 * @param {Object} props
 * @param {string} props.initialCode - Initial boilerplate code based on language
 */
import { useProblemSolve } from '@/context/ProblemSolveContext'

export default function CodeEditor({ initialCode = '' }) {
    const { code, updateCode, language } = useProblemSolve()
    const { resolvedTheme } = useTheme()

    const editorTheme = resolvedTheme === 'dark' ? 'codearena-dark' : 'codearena-light'

    return (
        <div className="bg-bg-page relative h-full w-full flex-1">
            <LazyCodeEditor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(value) => updateCode(value)}
                theme={editorTheme}
            />
        </div>
    )
}
