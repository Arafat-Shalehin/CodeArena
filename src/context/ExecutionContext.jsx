'use client'

import React, { createContext, useContext, useState } from 'react'

const ExecutionContext = createContext()

export function ExecutionProvider({ children }) {
    const [isRunning, setIsRunning] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [testResult, setTestResult] = useState(null)
    const [activeTestCase, setActiveTestCase] = useState(0)
    const [consoleTab, setConsoleTab] = useState('output')
    const [testInput, setTestInput] = useState('')
    const [testResultData, setTestResultData] = useState(null)

    const value = {
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
    }

    return <ExecutionContext.Provider value={value}>{children}</ExecutionContext.Provider>
}

export function useExecution() {
    const context = useContext(ExecutionContext)
    if (!context) {
        throw new Error('useExecution must be used within an ExecutionProvider')
    }
    return context
}
