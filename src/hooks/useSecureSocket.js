// src/hooks/useSecureSocket.js
// Hook to establish secure authenticated Socket.IO connections

import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'

/**
 * Hook for authenticated Socket.IO connections with auto-refresh
 *
 * @param {string} namespace - Socket.IO namespace (e.g., '/interview', '/submission')
 * @param {object} options - Connection options
 * @param {function} options.onConnect - Callback on successful connection
 * @param {function} options.onDisconnect - Callback on disconnect
 * @param {function} options.onError - Callback on error
 * @param {boolean} options.autoReconnect - Auto reconnect on disconnect (default: true)
 * @param {string} options.sessionId - Optional session ID for scoped access
 * @param {string} options.scope - Token scope (default: 'general')
 *
 * @returns {object} Socket instance and connection state
 */
export function useSecureSocket(namespace = '', options = {}) {
    const { user } = useAuth()
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isEnabled, setIsEnabled] = useState(true)
    const [error, setError] = useState(null)
    const socketRef = useRef(null)
    const tokenRef = useRef(null)
    const refreshTimerRef = useRef(null)
    const tokenRequestRef = useRef(null)
    const connectingRef = useRef(false)
    const connectRef = useRef(null)
    const connectGenRef = useRef(0)

    const {
        onConnect,
        onDisconnect,
        onError,
        autoReconnect = true,
        sessionId,
        scope = 'general',
    } = options

    /**
     * Fetch WebSocket token from backend
     */
    const fetchWsToken = useCallback(async () => {
        if (tokenRequestRef.current) {
            return tokenRequestRef.current
        }

        try {
            const promise = fetch('/api/auth/ws-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId, scope }),
                credentials: 'include',
            }).then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Token fetch failed: ${response.status}`)
                }

                const data = await response.json()
                if (!data.success) {
                    throw new Error(data.error || 'Token generation failed')
                }

                tokenRef.current = data.wsToken
                return data
            })

            tokenRequestRef.current = promise
            return await promise
        } catch (err) {
            console.error('[useSecureSocket] Token fetch error:', err.message)
            setError(err.message)
            onError?.(err)
            throw err
        } finally {
            tokenRequestRef.current = null
        }
    }, [sessionId, scope, onError])

    /**
     * Connect to Socket.IO with authentication
     */
    const connect = useCallback(async () => {
        if (!user) {
            console.warn('[useSecureSocket] User not authenticated, skipping connection')
            return
        }

        const gen = ++connectGenRef.current

        if (socketRef.current?.connected) {
            console.log('[useSecureSocket] Already connected')
            return
        }

        try {
            connectingRef.current = true

            // Get fresh token before connecting
            const data = await fetchWsToken()
            // console.log("Socket Console Data: ", data);

            if (gen !== connectGenRef.current) return

            if (data && data.enabled === false) {
                console.log(
                    `[useSecureSocket] Real-time sockets are disabled on the server (serverless mode). Bypassing connection to namespace: ${namespace}`
                )
                setIsEnabled(false)
                setIsConnected(false)
                connectingRef.current = false
                return
            }

            const { wsToken, socketUrl } = data
            if (!wsToken) {
                throw new Error('WebSocket token is empty')
            }
            //console.log("Socket Console: ", socketUrl);

            let socketUrl_ = process.env.NEXT_PUBLIC_SOCKET_URL || socketUrl

            // Localhost protocol sanitization
            if (typeof window !== 'undefined') {
                const isLocalhost =
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1'
                const isPageHttp = window.location.protocol === 'http:'

                if (isLocalhost && isPageHttp && socketUrl_) {
                    socketUrl_ = socketUrl_.replace(/^https:\/\//i, 'http://')
                }
            }

            if (!socketUrl_ || socketUrl_ === 'undefined' || socketUrl_.includes('undefined')) {
                console.error('[useSecureSocket] Invalid socket URL:', socketUrl_)
                throw new Error('Socket server URL is not configured correctly')
            }

            console.log(`[useSecureSocket] Connecting to ${socketUrl_}${namespace}`)

            const newSocket = io(`${socketUrl_}${namespace}`, {
                auth: {
                    token: wsToken,
                },
                reconnection: autoReconnect,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
                transports: ['websocket', 'polling'],
            })

            newSocket.on('connect', () => {
                console.log(`[useSecureSocket] Connected to ${namespace}`)
                setIsConnected(true)
                setError(null)
                onConnect?.()

                // Schedule token refresh 50 minutes from now (token expires in 60 minutes)
                scheduleTokenRefresh(50 * 60 * 1000)
            })

            newSocket.on('disconnect', (reason) => {
                console.log(`[useSecureSocket] Disconnected: ${reason}`)
                setIsConnected(false)
                onDisconnect?.(reason)

                // Clear token refresh timer
                if (refreshTimerRef.current) {
                    clearTimeout(refreshTimerRef.current)
                }
            })

            newSocket.on('auth_error', (error) => {
                console.error('[useSecureSocket] Authentication error:', error)
                setError(`Auth error: ${error.message}`)
                onError?.(new Error(error.message))
                newSocket.disconnect()
            })

            newSocket.on('connect_error', (error) => {
                // Use warn instead of error to prevent Next.js dev overlay popup for expected Vercel socket limitations
                console.warn('[useSecureSocket] Connection error:', error.message)
                setError(error.message)
                onError?.(error)
            })

            newSocket.on('error', (error) => {
                console.warn('[useSecureSocket] Socket error:', error)
                setError(error)
                onError?.(new Error(error))
            })

            socketRef.current = newSocket
            setSocket(newSocket)
        } catch (err) {
            console.warn('[useSecureSocket] Connection failed:', err.message)
            setError(err.message)
        } finally {
            if (gen === connectGenRef.current) {
                connectingRef.current = false
            }
        }
    }, [user, namespace, fetchWsToken, onConnect, onDisconnect, onError, autoReconnect])

    useEffect(() => {
        connectRef.current = connect
    }, [connect])

    /**
     * Refresh token before expiry
     */
    const scheduleTokenRefresh = useCallback(
        (delay) => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current)
            }

            refreshTimerRef.current = setTimeout(async () => {
                try {
                    console.log('[useSecureSocket] Refreshing authentication token')
                    const { wsToken } = await fetchWsToken()
                    tokenRef.current = wsToken

                    // Force reconnect to apply the updated auth token
                    if (socketRef.current?.connected) {
                        socketRef.current.removeAllListeners()
                        socketRef.current.disconnect()
                        socketRef.current = null
                        setSocket(null)
                        setIsConnected(false)
                    }
                    await connect()
                } catch (err) {
                    console.error('[useSecureSocket] Token refresh failed:', err.message)
                    // Token refresh failed, will attempt on next connect
                }
            }, delay)
        },
        [fetchWsToken, connect]
    )

    /**
     * Cleanup on unmount or user change
     */
    useEffect(() => {
        if (!user) {
            // Disconnect if user logs out
            socketRef.current?.disconnect()
            socketRef.current = null
            setSocket(null)
            setIsConnected(false)
            return
        }

        // Connect when user is available
        connectRef.current?.()

        return () => {
            // Increment generation to invalidate any in-flight connect call
            connectGenRef.current++

            // Cleanup timeout
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current)
            }

            // Ensure socket is closed on unmount/re-mount to avoid duplicate connections in dev.
            socketRef.current?.removeAllListeners()
            socketRef.current?.disconnect()
            socketRef.current = null
            setSocket(null)
            setIsConnected(false)
        }
    }, [user])

    const disconnect = useCallback(() => {
        socketRef.current?.removeAllListeners()
        socketRef.current?.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)

        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current)
        }
    }, [])

    return {
        socket: socketRef.current,
        isConnected,
        isEnabled,
        error,
        connect,
        disconnect,
    }
}
