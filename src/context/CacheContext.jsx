'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

const CacheContext = createContext()

export function CacheProvider({ children }) {
    const [cachedCodeHash, setCachedCodeHash] = useState(null)
    const [cachedResult, setCachedResult] = useState(null)

    // Hash function to generate code fingerprint
    const generateCodeHash = useCallback((codeStr) => {
        let hash = 0
        for (let i = 0; i < codeStr.length; i++) {
            const char = codeStr.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash
        }
        return Math.abs(hash).toString(36)
    }, [])

    const setCachedExecution = useCallback(
        (code, result) => {
            const codeHash = generateCodeHash(code)
            setCachedCodeHash(codeHash)
            setCachedResult(result)
        },
        [generateCodeHash]
    )

    const clearCache = useCallback(() => {
        setCachedCodeHash(null)
        setCachedResult(null)
    }, [])

    const value = {
        cachedCodeHash,
        cachedResult,
        generateCodeHash,
        setCachedExecution,
        clearCache,
    }

    return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
}

export function useCache() {
    const context = useContext(CacheContext)
    if (!context) {
        throw new Error('useCache must be used within a CacheProvider')
    }
    return context
}
