'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const ProblemSolveContext = createContext()

export function ProblemSolveProvider({ children, problemId, initialCode }) {
    const [code, setCode] = useState(initialCode || '')
    const [language, setLanguage] = useState('javascript')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isRunning, setIsRunning] = useState(false)
    const [submissionResult, setSubmissionResult] = useState(null)
    const [testCaseResults, setTestCaseResults] = useState([])

    // Persist code to localStorage
    useEffect(() => {
        const savedCode = localStorage.getItem(`codearena_code_${problemId}_${language}`)
        if (savedCode) {
            setCode(savedCode)
        }
    }, [problemId, language])

    const updateCode = (newCode) => {
        setCode(newCode)
        localStorage.setItem(`codearena_code_${problemId}_${language}`, newCode)
    }

    const value = {
        code,
        updateCode,
        language,
        setLanguage,
        isSubmitting,
        setIsSubmitting,
        isRunning,
        setIsRunning,
        submissionResult,
        setSubmissionResult,
        testCaseResults,
        setTestCaseResults,
        problemId,
    }

    return <ProblemSolveContext.Provider value={value}>{children}</ProblemSolveContext.Provider>
}

export function useProblemSolve() {
    const context = useContext(ProblemSolveContext)
    if (!context) {
        throw new Error('useProblemSolve must be used within a ProblemSolveProvider')
    }
    return context
}
