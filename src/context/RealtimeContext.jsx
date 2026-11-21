'use client'

import React, { createContext, useContext, useState } from 'react'

const RealtimeContext = createContext()

export function RealtimeProvider({ children }) {
    const [socket, setSocket] = useState(null)
    const [isEnabled, setIsEnabled] = useState(true)
    const [latestSubmissionEvent, setLatestSubmissionEvent] = useState(null)
    const [submissionResult, setSubmissionResult] = useState(null)

    const value = {
        socket,
        setSocket,
        isEnabled,
        setIsEnabled,
        latestSubmissionEvent,
        setLatestSubmissionEvent,
        submissionResult,
        setSubmissionResult,
    }

    return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export function useRealtime() {
    const context = useContext(RealtimeContext)
    if (!context) {
        throw new Error('useRealtime must be used within a RealtimeProvider')
    }
    return context
}
