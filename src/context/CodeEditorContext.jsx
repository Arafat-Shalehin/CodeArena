'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

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
    const [code, setCode] = useState(initialCode || '')
    const [language, setLanguage] = useState('python')
    const [files, setFiles] = useState([
        { filename: 'solution.py', content: initialCode || '', isMain: true },
    ])
    const [activeFileIndex, setActiveFileIndex] = useState(0)

    const LANG_EXTENSIONS = { python: '.py', cpp: '.cpp', java: '.java', javascript: '.js' }

    // Reset files and language when problem changes
    useEffect(() => {
        setLanguage('python')
        setActiveFileIndex(0)
        setFiles([{ filename: 'solution.py', content: '', isMain: true }])
    }, [problemId])

    // Persist code to localStorage
    useEffect(() => {
        const savedCode = localStorage.getItem(`codearena_code_${problemId}_${language}`)
        if (savedCode) {
            setCode(savedCode)
        } else {
            setCode(STARTER_CODES[language] || '')
        }
    }, [problemId, language])

    const updateCode = useCallback(
        (newCode) => {
            setCode(newCode)
            localStorage.setItem(`codearena_code_${problemId}_${language}`, newCode)
            // Sync active file content
            setFiles((prev) => {
                const updated = [...prev]
                if (updated[activeFileIndex]) {
                    updated[activeFileIndex] = { ...updated[activeFileIndex], content: newCode }
                }
                return updated
            })
        },
        [problemId, language, activeFileIndex]
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
            setLanguage(lang)
            const ext = LANG_EXTENSIONS[lang] || '.txt'
            const defaultFileName = lang === 'java' ? 'Solution' + ext : 'solution' + ext
            const savedCode = localStorage.getItem(`codearena_code_${problemId}_${lang}`)
            const newCode = savedCode || STARTER_CODES[lang] || ''
            setFiles([{ filename: defaultFileName, content: newCode, isMain: true }])
            setActiveFileIndex(0)
            if (!savedCode) {
                setCode(STARTER_CODES[lang] || '')
            }
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
