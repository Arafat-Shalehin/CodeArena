'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

const ExecutionContext = createContext()

export function ExecutionProvider({ children }) {
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [testResult, setTestResult] = useState(null)
    const [activeTestCase, setActiveTestCase] = useState(0)
    const [consoleTab, setConsoleTab] = useState('testcase')
    const [testInput, setTestInput] = useState('')
    const [testResultData, setTestResultData] = useState(null)
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [lastSubmittedCode, setLastSubmittedCode] = useState('')
    const [lastSubmittedLanguage, setLastSubmittedLanguage] = useState('')
    const [lastAnalyzedCode, setLastAnalyzedCode] = useState('')
    const [lastAnalyzedVerdict, setLastAnalyzedVerdict] = useState('')
    const [submissionIdForAi, setSubmissionIdForAi] = useState(null)

    const value = useMemo(
        () => ({
            isRunning,
            setIsRunning,
            isSubmitting,
            setIsSubmitting,
            testResult,
            setTestResult,
            activeTestCase,
            setActiveTestCase,
            consoleTab,
            setConsoleTab,
            testInput,
            setTestInput,
            testResultData,
            setTestResultData,
            isAiLoading,
            setIsAiLoading,
            lastSubmittedCode,
            setLastSubmittedCode,
            lastSubmittedLanguage,
            setLastSubmittedLanguage,
            lastAnalyzedCode,
            setLastAnalyzedCode,
            lastAnalyzedVerdict,
            setLastAnalyzedVerdict,
            submissionIdForAi,
            setSubmissionIdForAi,
        }),
        [
            isRunning,
            isSubmitting,
            testResult,
            activeTestCase,
            consoleTab,
            testInput,
            testResultData,
            isAiLoading,
            lastSubmittedCode,
            lastSubmittedLanguage,
            lastAnalyzedCode,
            lastAnalyzedVerdict,
            submissionIdForAi,
        ]
    )

    return <ExecutionContext.Provider value={value}>{children}</ExecutionContext.Provider>
}

export function useExecution() {
    const context = useContext(ExecutionContext)
    if (!context) {
        throw new Error('useExecution must be used within an ExecutionProvider')
    }
    return context
}
