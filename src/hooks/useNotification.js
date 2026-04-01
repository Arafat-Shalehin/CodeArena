'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const NOTIFICATION_PAGE_SIZE = 20

export function useNotification() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [nextCursor, setNextCursor] = useState(null)
    const [hasMore, setHasMore] = useState(false)
    const audioContextRef = useRef(null)

    const playNotificationTone = useCallback(() => {
        try {
            if (!audioContextRef.current) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext
                if (!AudioContextClass) return
                audioContextRef.current = new AudioContextClass()
            }

            const audioContext = audioContextRef.current
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = 800
            oscillator.type = 'sine'
            gainNode.gain.value = 0.1

            oscillator.start()
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
            oscillator.stop(audioContext.currentTime + 0.15)
        } catch {
            // Ignore if browser blocks audio
        }
    }, [])

    const fetchNotifications = useCallback(async () => {
        if (!user?._id) return
        setLoading(true)
        try {
            const res = await fetch(`/api/notifications?limit=${NOTIFICATION_PAGE_SIZE}`)
            const data = await res.json()
            if (data.success) {
                const nextNotifications = data.data || []
                setNotifications(nextNotifications)
                setUnreadCount(
                    data.unreadCount ?? nextNotifications.filter((n) => !n.isRead).length
                )
                setNextCursor(data.pagination?.nextCursor || null)
                setHasMore(Boolean(data.pagination?.hasMore))
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [user?._id])

    const loadMore = useCallback(async () => {
        if (!user?._id || !hasMore || !nextCursor || loadingMore) return
        setLoadingMore(true)
        try {
            const res = await fetch(
                `/api/notifications?limit=${NOTIFICATION_PAGE_SIZE}&cursor=${encodeURIComponent(nextCursor)}`
            )
            const data = await res.json()
            if (data.success) {
                setNotifications((prev) => [...prev, ...(data.data || [])])
                setNextCursor(data.pagination?.nextCursor || null)
                setHasMore(Boolean(data.pagination?.hasMore))
                setUnreadCount((prev) => data.unreadCount ?? prev)
            }
        } catch (error) {
            console.error('Error loading more notifications:', error)
        } finally {
            setLoadingMore(false)
        }
    }, [hasMore, loadingMore, nextCursor, user?._id])

    useEffect(() => {
        if (!user?._id) return

        fetchNotifications()

        // Initialize Socket.IO connection
        // Assuming the socket server runs on port 3002 as per socket-server.js
        const socketInstance = io(':3002', {
            transports: ['websocket'],
        })

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected to notification server')
            socketInstance.emit('join_room', user._id)
        })

        socketInstance.on('notification_received', (notification) => {
            setNotifications((prev) => [notification, ...prev])
            setUnreadCount((prev) => prev + 1)

            playNotificationTone()

            // Show Toast
            toast(notification.message, {
                description: 'New Notification',
                action: notification.link
                    ? {
                          label: 'View',
                          onClick: () => (window.location.href = notification.link),
                      }
                    : null,
            })
        })

        return () => {
            socketInstance.disconnect()
        }
    }, [user?._id, fetchNotifications, playNotificationTone])

    const markAllAsRead = async () => {
        try {
            const res = await fetch('/api/notifications', { method: 'PATCH' })
            if (res.ok) {
                // UI state refresh
                fetchNotifications()
            }
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const markNotificationAsRead = useCallback(
        async (notificationId) => {
            if (!notificationId) return

            let decremented = false
            setNotifications((prev) =>
                prev.map((n) => {
                    if (n._id !== notificationId) return n
                    if (!n.isRead) decremented = true
                    return { ...n, isRead: true }
                })
            )
            if (decremented) {
                setUnreadCount((prev) => Math.max(0, prev - 1))
            }

            try {
                const res = await fetch(`/api/notifications/${notificationId}/read`, {
                    method: 'PATCH',
                })

                if (!res.ok) {
                    throw new Error('Failed to mark notification as read')
                }
            } catch (error) {
                console.error('Error marking notification as read:', error)
                fetchNotifications()
            }
        },
        [fetchNotifications]
    )

    return {
        notifications,
        unreadCount,
        hasMore,
        loading,
        loadingMore,
        loadMore,
        markAllAsRead,
        markNotificationAsRead,
        refresh: fetchNotifications,
    }
}
