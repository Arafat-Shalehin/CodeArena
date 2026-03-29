import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

export function useVoiceInput({ wsToken, sessionId, interviewSocket }) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [transcriptStatus, setTranscriptStatus] = useState('idle') // idle, listening, uncertain, error
    const [error, setError] = useState(null)

    const mediaRecorderRef = useRef(null)
    const voiceSocketRef = useRef(null)

    // 1. MediaRecorder Logic (Define callbacks FIRST to avoid TDZ errors)
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
        }
        setIsListening(false)
        if (transcriptStatus === 'listening') {
            setTranscriptStatus('idle')
        }
    }, [transcriptStatus])

    const startRecording = useCallback(async () => {
        if (mediaRecorderRef.current?.state === 'recording') return
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Format: audio/webm;codecs=opus is mandatory for Deepgram streaming
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
            })

            mediaRecorderRef.current = mediaRecorder

            mediaRecorderRef.current.onstart = () => {
                console.log('[useVoiceInput] MediaRecorder started')
                setIsListening(true)
                setError(null)
            }

            mediaRecorderRef.current.ondataavailable = async (event) => {
                if (event.data.size === 0) return
                if (!voiceSocketRef.current?.connected) {
                    console.warn('[useVoiceInput] Socket not connected, dropping chunk')
                    return
                }
                // Convert Blob → ArrayBuffer to ensure proper Node.js Buffer serialization
                const buf = await event.data.arrayBuffer()
                voiceSocketRef.current.emit('voice:audio_chunk', buf)
            }

            mediaRecorderRef.current.onerror = (event) => {
                console.error('[useVoiceInput] MediaRecorder error:', event.error)
                setError('Microphone recording error.')
                stopRecording()
            }

            // Timeslice: 250ms (Mandatory for streaming)
            mediaRecorder.start(250)
            setTranscriptStatus('listening')

            // Cross-Namespace Sync: Emit on BOTH namespaces
            voiceSocketRef.current?.emit('voice:mode_activated')
            interviewSocket?.emit('voice:mode_activated')
        } catch (err) {
            console.error('[Voice] Failed to start recording:', err)
            setError('Microphone permission denied or not found.')
            setIsListening(false)
        }
    }, [interviewSocket, stopRecording])

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopRecording()
        } else {
            startRecording()
        }
    }, [isListening, startRecording, stopRecording])

    // 1.5 Cleanup recorder on unmount
    useEffect(() => {
        return () => stopRecording()
    }, [stopRecording])

    // 2. Stable Socket Lifecycle
    useEffect(() => {
        if (!wsToken || !sessionId) return

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'
        const socket = io(`${socketUrl}/voice`, {
            auth: { token: wsToken },
            query: { sessionId }, // Pass sessionId for early validation
            reconnection: true,
            reconnectionDelayMax: 5000,
        })

        voiceSocketRef.current = socket

        socket.on('connect', () => {
            console.log('[Voice] Socket connected')
            setError(null)
        })

        socket.on('disconnect', (reason) => {
            console.warn('[Voice] Socket disconnected:', reason)
            if (reason !== 'io client disconnect') {
                setError('Voice connection lost. Reconnecting...')
            }
        })

        socket.on('voice:transcript_confirmed', (data) => {
            if (!data.transcript || !data.transcript.trim()) return
            console.log('[useVoiceInput] Received confirmed transcript:', data.transcript)
            setTranscript(data.transcript)
            setTranscriptStatus('idle')
        })

        socket.on('voice:transcript_interim', (data) => {
            console.log('[useVoiceInput] Received interim transcript:', data.transcript)
        })

        socket.on('voice:error', (err) => {
            console.error('[Voice] Socket Error:', err)
            setError(err.message || 'STT Service Error')
            setTranscriptStatus('error')
        })

        return () => {
            console.log('[Voice] Component unmounting, disconnecting socket...')
            socket.disconnect()
        }
    }, [wsToken, sessionId])

    // 3. Stream Reconnection Logic
    useEffect(() => {
        if (!voiceSocketRef.current || !isListening) return

        const handleConnect = () => {
            console.log(
                '[useVoiceInput] Reconnection detected. Restarting stream to refresh WebM header...'
            )
            stopRecording()
            setTimeout(() => {
                if (isListening) startRecording()
            }, 500)
        }

        voiceSocketRef.current.on('connect', handleConnect)
        return () => {
            voiceSocketRef.current?.off('connect', handleConnect)
        }
    }, [isListening, startRecording, stopRecording])

    return {
        isListening,
        transcript,
        transcriptStatus,
        error,
        toggleListening,
        setTranscript, // For manual editing in UI
    }
}
