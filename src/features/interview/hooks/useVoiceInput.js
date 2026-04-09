import { useEffect, useRef, useState, useCallback } from 'react'
import { useSecureSocket } from '@/hooks/useSecureSocket'

export function useVoiceInput({ sessionId, interviewSocket }) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [transcriptStatus, setTranscriptStatus] = useState('idle') // idle, listening, uncertain, error
    const [error, setError] = useState(null)

    const mediaRecorderRef = useRef(null)
    const recognitionRef = useRef(null)
    const useBrowserSttRef = useRef(false)
    const lastFinalTranscriptRef = useRef({ text: '', ts: 0 })
    const isListeningRef = useRef(false)

    // Use secure socket for voice communication
    const { socket: voiceSocket, isConnected: voiceConnected } = useSecureSocket('/voice', {
        scope: 'voice',
        sessionId,
        autoReconnect: true,
    })

    // Keep a ref for easy access in callbacks
    const voiceSocketRef = useRef(voiceSocket)
    useEffect(() => {
        voiceSocketRef.current = voiceSocket
    }, [voiceSocket])

    useEffect(() => {
        isListeningRef.current = isListening
    }, [isListening])

    const stopBrowserRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop()
            } catch (e) {}
            recognitionRef.current = null
        }
    }, [])

    const startBrowserRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            setError('Voice STT is unavailable on this browser.')
            setTranscriptStatus('error')
            setIsListening(false)
            return
        }

        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.interimResults = true
        recognition.continuous = true
        recognition.maxAlternatives = 1

        recognition.onstart = () => {
            setIsListening(true)
            setTranscriptStatus('listening')
            setError(null)
        }

        recognition.onresult = (event) => {
            let finalTranscript = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i]
                const text = result[0]?.transcript?.trim()
                if (result.isFinal && text) finalTranscript += `${text} `
            }

            const normalized = finalTranscript.trim()
            if (normalized) {
                const now = Date.now()
                const last = lastFinalTranscriptRef.current
                // Some engines may emit duplicate final chunks back-to-back.
                if (last.text === normalized && now - last.ts < 2500) return

                lastFinalTranscriptRef.current = { text: normalized, ts: now }
                setTranscript(normalized)
                setTranscriptStatus('idle')
            }
        }

        recognition.onerror = (event) => {
            setError(
                event.error === 'not-allowed'
                    ? 'Microphone permission denied.'
                    : 'Speech recognition error.'
            )
            setTranscriptStatus('error')
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
            setTranscriptStatus((prev) => (prev === 'listening' ? 'idle' : prev))
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [])

    // 1. MediaRecorder Logic (Define callbacks FIRST to avoid TDZ errors)
    const stopRecording = useCallback(() => {
        stopBrowserRecognition()
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
        }
        setIsListening(false)
        setTranscriptStatus((prev) => (prev === 'listening' ? 'idle' : prev))
    }, [stopBrowserRecognition])

    const startRecording = useCallback(async () => {
        if (mediaRecorderRef.current?.state === 'recording') return

        if (
            useBrowserSttRef.current ||
            !voiceSocketRef.current?.connected ||
            voiceSocketRef.current?.disconnected
        ) {
            startBrowserRecognition()
            return
        }

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
            // Fallback to browser STT when media streaming/socket path fails.
            useBrowserSttRef.current = true
            startBrowserRecognition()
        }
    }, [interviewSocket, startBrowserRecognition, stopRecording])

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

    // 2. Set up voice socket event listeners
    useEffect(() => {
        if (!voiceSocket || !voiceConnected) return

        voiceSocket.on('connect', () => {
            console.log('[Voice] Socket connected')
            useBrowserSttRef.current = false
            setError(null)
        })

        voiceSocket.on('disconnect', (reason) => {
            console.warn('[Voice] Socket disconnected:', reason)
            if (reason !== 'io client disconnect' && !useBrowserSttRef.current) {
                setError('Voice connection lost. Reconnecting...')
            }
        })

        voiceSocket.on('voice:transcript_confirmed', (data) => {
            if (!data.transcript || !data.transcript.trim()) return
            const normalized = data.transcript.trim()
            const now = Date.now()
            const last = lastFinalTranscriptRef.current
            if (last.text === normalized && now - last.ts < 2500) return

            console.log('[useVoiceInput] Received confirmed transcript:', normalized)
            lastFinalTranscriptRef.current = { text: normalized, ts: now }
            setTranscript(normalized)
            setTranscriptStatus('idle')
        })

        voiceSocket.on('voice:transcript_interim', (data) => {
            console.log('[useVoiceInput] Received interim transcript:', data.transcript)
        })

        voiceSocket.on('voice:error', (err) => {
            const hasPayload =
                !!err &&
                (typeof err !== 'object' || err.message || err.code || Object.keys(err).length > 0)

            if (!hasPayload) {
                // Some socket transports emit empty error payloads on disconnect/reconnect races.
                return
            }

            if (err?.code === 'UNAUTHORIZED' || err?.code === 'STT_ENGINE_ERROR') {
                useBrowserSttRef.current = true
                setError(null)
                if (voiceSocket.connected) {
                    voiceSocket.disconnect()
                }
                if (isListeningRef.current) {
                    stopRecording()
                    setTimeout(() => startBrowserRecognition(), 100)
                }
                return
            }

            console.warn('[Voice] Socket warning:', err)

            setError(err?.message || 'STT Service Error')
            setTranscriptStatus('error')
        })

        return () => {
            voiceSocket.off('connect')
            voiceSocket.off('disconnect')
            voiceSocket.off('voice:transcript_confirmed')
            voiceSocket.off('voice:transcript_interim')
            voiceSocket.off('voice:error')
        }
    }, [voiceSocket, voiceConnected])

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
