import { useEffect, useState, useRef } from 'react'
import { useSecureSocket } from '@/hooks/useSecureSocket'

export class MockInterviewSocket {
    constructor(sessionId) {
        this.sessionId = sessionId
        this.listeners = {}
        this.processedMessageIds = new Set()
        this.initializedMessages = false
        this.pollingTimer = null
        this.simulationTimer = null
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = []
        }
        this.listeners[event].push(callback)
        return this
    }

    off(event, callback) {
        if (!this.listeners[event]) return this
        if (!callback) {
            delete this.listeners[event]
            return this
        }
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
        return this
    }

    emit(event, payload) {
        this.handleEmit(event, payload).catch(err => {
            console.error(`[MockInterviewSocket] Error handling event ${event}:`, err)
        })
        return this
    }

    async handleEmit(event, payload) {
        console.log(`[MockInterviewSocket] emit: ${event}`, payload)
        if (event === 'interview:join' || event === 'interview:pong') {
            return
        }

        try {
            if (event === 'interview:chat_message') {
                const res = await fetch(`/api/interview/sessions/${this.sessionId}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                const json = await res.json()
                if (json.success) {
                    this.startPolling()
                } else {
                    this.trigger('interview:error', json.error || 'Failed to send message')
                }
            } else if (event === 'interview:run') {
                const res = await fetch(`/api/interview/sessions/${this.sessionId}/run`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                const json = await res.json()
                this.trigger('interview:run_result', json)
            } else if (event === 'interview:submit') {
                const res = await fetch(`/api/interview/sessions/${this.sessionId}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                const json = await res.json()
                this.trigger('interview:submission_result', json)
                
                if (json.success) {
                    this.startPolling()
                }
            } else if (event === 'interview:code_snapshot') {
                await fetch(`/api/interview/sessions/${this.sessionId}/snapshot`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }
        } catch (error) {
            console.error(`[MockInterviewSocket] emit error for ${event}:`, error)
            this.trigger('interview:error', error.message || 'Network error')
        }
    }

    trigger(event, data) {
        const callbacks = this.listeners[event] || []
        for (const cb of callbacks) {
            try {
                cb(data)
            } catch (err) {
                console.error(`[MockInterviewSocket] Error in listener for ${event}:`, err)
            }
        }
    }

    startPolling() {
        if (this.pollingTimer) return
        
        let lastPhase = null

        const poll = async () => {
            try {
                const res = await fetch(`/api/interview/sessions/${this.sessionId}/rehydrate`)
                const json = await res.json()
                if (json.success && json.data) {
                    const { messages, currentPhase, status } = json.data
                    
                    // 1. If first poll, populate existing message IDs so we don't restream them
                    if (!this.initializedMessages) {
                        this.initializedMessages = true
                        if (messages) {
                            messages.forEach(m => {
                                if (m.role === 'ai') {
                                    this.processedMessageIds.add(m.id || m._id)
                                }
                            })
                        }
                    }

                    // 2. If phase changed, notify
                    if (currentPhase && currentPhase !== lastPhase) {
                        this.trigger('interview:phase_change', currentPhase)
                        lastPhase = currentPhase
                    }

                    // 3. Process new AI messages
                    if (messages && messages.length > 0) {
                        const lastMsg = messages[messages.length - 1]
                        const msgId = lastMsg.id || lastMsg._id
                        if (lastMsg.role === 'ai' && !this.processedMessageIds.has(msgId)) {
                            this.processedMessageIds.add(msgId)
                            
                            const content = lastMsg.content || ''
                            const chunks = content.split(/(\s+)/)
                            let currentSequence = 1
                            let chunkIdx = 0

                            if (this.simulationTimer) {
                                clearInterval(this.simulationTimer)
                            }

                            this.simulationTimer = setInterval(() => {
                                if (chunkIdx < chunks.length) {
                                    const chunk = chunks[chunkIdx]
                                    this.trigger('interview:ai_stream_chunk', {
                                        chunk,
                                        done: false,
                                        messageId: msgId,
                                        sequence: currentSequence++
                                    })
                                    chunkIdx++
                                } else {
                                    clearInterval(this.simulationTimer)
                                    this.simulationTimer = null
                                    this.trigger('interview:ai_stream_chunk', {
                                        chunk: '',
                                        done: true,
                                        messageId: msgId,
                                        sequence: currentSequence
                                    })
                                    
                                    this.stopPolling()
                                    
                                    if (content.includes('<WRAP_UP />') || status === 'completed') {
                                        fetch(`/api/interview/sessions/${this.sessionId}/result`)
                                            .then(r => r.json())
                                            .then(scoreJson => {
                                                if (scoreJson.success && scoreJson.data) {
                                                    this.trigger('interview:scorecard', scoreJson.data)
                                                }
                                            }).catch(err => console.error('[MockInterviewSocket] Scorecard fetch error:', err))
                                    }
                                }
                            }, 30)
                        }
                    }

                    if (status === 'completed' || status === 'terminated') {
                        this.stopPolling()
                    }
                }
            } catch (err) {
                console.error('[MockInterviewSocket] Polling error:', err)
            }
        }

        poll()
        this.pollingTimer = setInterval(poll, 1500)
    }

    stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer)
            this.pollingTimer = null
        }
    }
}

export function useInterviewSocket({ sessionId }) {
    const { socket: realSocket, isConnected: realIsConnected, isEnabled } = useSecureSocket('/interview', {
        scope: 'interview',
        sessionId,
        autoReconnect: true,
    })

    const [socket, setSocket] = useState(null)
    const [connectionStatus, setConnectionStatus] = useState('connecting')
    const mockSocketRef = useRef(null)

    useEffect(() => {
        if (isEnabled === false) {
            if (!mockSocketRef.current) {
                console.log(`[useInterviewSocket] Real-time socket disabled. Falling back to MockInterviewSocket for session ${sessionId}`)
                mockSocketRef.current = new MockInterviewSocket(sessionId)
                setSocket(mockSocketRef.current)
                setConnectionStatus('connected')
                setTimeout(() => {
                    mockSocketRef.current?.trigger('connect')
                }, 100)
            }
        } else {
            setSocket(realSocket)
            setConnectionStatus(realIsConnected ? 'connected' : 'connecting')
        }
    }, [realSocket, realIsConnected, isEnabled, sessionId])

    // Join interview room when connected (distributed mode only)
    useEffect(() => {
        if (!realSocket || !realIsConnected) return

        realSocket.emit('interview:join')
    }, [realSocket, realIsConnected])

    useEffect(() => {
        return () => {
            if (mockSocketRef.current) {
                mockSocketRef.current.stopPolling()
                mockSocketRef.current = null
            }
        }
    }, [])

    return { socket, connectionStatus }
}

