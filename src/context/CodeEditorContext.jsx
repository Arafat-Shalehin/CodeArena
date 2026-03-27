'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useProblemSolveStore } from '@/store/problemSolveStore'

const CodeEditorContext = createContext()

const STARTER_CODES = {
    python: `# Write your solution here
import sys
input = sys.stdin.readline

`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    
    return 0;
}
`,
    java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        sc.close();
    }
}
`,
    javascript: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    
});
`,
}

const LANG_LABELS = {
    python: 'Python 3',
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript',
}

export { STARTER_CODES, LANG_LABELS }

export function CodeEditorProvider({ children, problemId, initialCode }) {
    // Get Zustand store first
    const zustandStore = useProblemSolveStore()

    const LANG_EXTENSIONS = { python: '.py', cpp: '.cpp', java: '.java', javascript: '.js' }

    const getSavedLanguage = () => {
        try {
            if (typeof window === 'undefined') return 'python'
            const savedLanguage = localStorage.getItem(`codearena_lang_${problemId}`)
            if (savedLanguage && LANG_LABELS[savedLanguage]) {
                return savedLanguage
            }

            const storeLanguage = useProblemSolveStore.getState().language
            if (storeLanguage && LANG_LABELS[storeLanguage]) {
                return storeLanguage
            }
        } catch (e) {
            console.warn('[CodeEditor] Error reading saved language:', e)
        }
        return 'python'
    }

    const getSavedCodeForLanguage = (lang) => {
        try {
            if (typeof window === 'undefined') return null
            return localStorage.getItem(`codearena_code_${problemId}_${lang}`)
        } catch (e) {
            console.warn('[CodeEditor] Error reading saved code:', e)
            return null
        }
    }

    const [language, setLanguage] = useState(() => getSavedLanguage())
    const [code, setCode] = useState(() => {
        const initialLanguage = getSavedLanguage()
        const savedCode = getSavedCodeForLanguage(initialLanguage)
        if (savedCode) return savedCode
        return initialCode || STARTER_CODES[initialLanguage] || ''
    })
    const [files, setFiles] = useState(() => {
        const initialLanguage = getSavedLanguage()
        const ext = LANG_EXTENSIONS[initialLanguage] || '.txt'
        const filename = initialLanguage === 'java' ? 'Solution' + ext : 'solution' + ext
        const initialContent =
            getSavedCodeForLanguage(initialLanguage) ||
            initialCode ||
            STARTER_CODES[initialLanguage] ||
            ''
        return [{ filename, content: initialContent, isMain: true }]
    })
    const [activeFileIndex, setActiveFileIndex] = useState(0)

    // Only reset when problemId actually changes, not on first mount
    useEffect(() => {
        const savedLanguage = getSavedLanguage()
        setLanguage(savedLanguage)
        setActiveFileIndex(0)
        zustandStore.resetProblemState(problemId)
    }, [problemId])

    // Load persisted code when mounting OR language changes
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem(`codearena_lang_${problemId}`, language)
            }
        } catch (e) {
            console.warn('[CodeEditor] Error persisting language:', e)
        }

        const savedCode = getSavedCodeForLanguage(language)
        const starterCode = STARTER_CODES[language] || ''
        const nextCode = savedCode || starterCode

        const ext = LANG_EXTENSIONS[language] || '.txt'
        const filename = language === 'java' ? 'Solution' + ext : 'solution' + ext

        console.log('[CodeEditor] Loading code for', language, 'on problem', problemId)
        setCode(nextCode)
        setFiles([{ filename, content: nextCode, isMain: true }])

        // Keep store in sync even if user changes language without typing
        zustandStore.setLanguage(language)
        zustandStore.setCurrentProblemId(problemId)
    }, [problemId, language])

    const updateCode = useCallback(
        (newCode) => {
            setCode(newCode)
            // Save to localStorage with problem+language key
            const problemLanguageKey = `codearena_code_${problemId}_${language}`
            if (typeof window !== 'undefined') {
                localStorage.setItem(problemLanguageKey, newCode)
            }
            console.log('[CodeEditor] Saved code to:', problemLanguageKey)

            // Also sync to Zustand for current session
            zustandStore.setCode(newCode)
            zustandStore.setLanguage(language)
            zustandStore.setCurrentProblemId(problemId)

            // Sync active file content
            setFiles((prev) => {
                const updated = [...prev]
                if (updated[activeFileIndex]) {
                    updated[activeFileIndex] = { ...updated[activeFileIndex], content: newCode }
                }
                return updated
            })
        },
        [problemId, language, activeFileIndex, zustandStore]
    )

    const addFile = useCallback(
        (filename) => {
            if (!filename) return
            if (files.some((f) => f.filename === filename)) return
            const newFile = { filename, content: '', isMain: false }
            setFiles((prev) => [...prev, newFile])
            setActiveFileIndex(files.length)
            setCode('')
        },
        [files]
    )

    const removeFile = useCallback(
        (index) => {
            if (files[index]?.isMain) return
            setFiles((prev) => prev.filter((_, i) => i !== index))
            if (activeFileIndex >= index && activeFileIndex > 0) {
                setActiveFileIndex(activeFileIndex - 1)
            }
            const newIdx =
                activeFileIndex >= index ? Math.max(0, activeFileIndex - 1) : activeFileIndex
            setCode(files[newIdx]?.content || '')
        },
        [files, activeFileIndex]
    )

    const renameFile = useCallback(
        (index, newName) => {
            if (!newName || files[index]?.isMain) return
            setFiles((prev) => {
                const updated = [...prev]
                updated[index] = { ...updated[index], filename: newName }
                return updated
            })
        },
        [files]
    )

    const switchToFile = useCallback(
        (index) => {
            setActiveFileIndex(index)
            setCode(files[index]?.content || '')
        },
        [files]
    )

    const handleLanguageChange = useCallback(
        (lang) => {
            if (!LANG_LABELS[lang]) return

            try {
                localStorage.setItem(`codearena_lang_${problemId}`, lang)
            } catch (e) {
                console.warn('[CodeEditor] Error saving language selection:', e)
            }

            setLanguage(lang)
            setActiveFileIndex(0)
        },
        [problemId]
    )

    const resetCode = useCallback(() => {
        const ext = LANG_EXTENSIONS[language] || '.txt'
        const defaultFileName = language === 'java' ? 'Solution' + ext : 'solution' + ext
        const starterCode = STARTER_CODES[language] || ''
        setCode(starterCode)
        setFiles([{ filename: defaultFileName, content: starterCode, isMain: true }])
        setActiveFileIndex(0)
        localStorage.removeItem(`codearena_code_${problemId}_${language}`)

        zustandStore.setCode(starterCode)
        zustandStore.setLanguage(language)
        zustandStore.setCurrentProblemId(problemId)
    }, [language, problemId])

    const value = {
        code,
        updateCode,
        language,
        setLanguage: handleLanguageChange,
        resetCode,
        files,
        activeFileIndex,
        addFile,
        removeFile,
        renameFile,
        switchToFile,
    }

    return <CodeEditorContext.Provider value={value}>{children}</CodeEditorContext.Provider>
}

export function useCodeEditor() {
    const context = useContext(CodeEditorContext)
    if (!context) {
        throw new Error('useCodeEditor must be used within a CodeEditorProvider')
    }
    return context
}
