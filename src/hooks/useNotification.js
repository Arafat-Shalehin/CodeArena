'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSecureSocket } from './useSecureSocket'
import { toast } from 'sonner'

const RECENT_NOTIFICATION_FETCH_TTL_MS = 5000
const notificationInflightByUser = new Map()
const notificationRecentDataByUser = new Map()

async function fetchNotificationsForUser(userId) {
    const cached = notificationRecentDataByUser.get(userId)
    if (cached && Date.now() - cached.timestamp < RECENT_NOTIFICATION_FETCH_TTL_MS) {
        return cached.data
    }

    if (notificationInflightByUser.has(userId)) {
        return notificationInflightByUser.get(userId)
    }

    const request = fetch('/api/notifications')
        .then(async (res) => {
            if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.status}`)
            const data = await res.json()
            const list = data.success && Array.isArray(data.data) ? data.data : []
            notificationRecentDataByUser.set(userId, {
                timestamp: Date.now(),
                data: list,
            })
            return list
        })
        .finally(() => {
            notificationInflightByUser.delete(userId)
        })

    notificationInflightByUser.set(userId, request)
    return request
}

export function useNotification() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const { socket, isConnected } = useSecureSocket('/', { scope: 'notification' })

    const fetchNotifications = useCallback(async () => {
        if (!user?._id) return
        try {
            const list = await fetchNotificationsForUser(String(user._id))
            setNotifications(list)
            setUnreadCount(list.filter((n) => !n.isRead).length)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }, [user?._id])

    useEffect(() => {
        if (!user?._id) return

        fetchNotifications()
    }, [user?._id, fetchNotifications])

    useEffect(() => {
        if (!isConnected || !socket || !user?._id) return

        console.log('[Socket] Connected to notification server')
        // Join the user's notification room
        socket.emit('join_room', user._id)

        socket.on('notification_received', (notification) => {
            setNotifications((prev) => {
                if (prev.some((item) => item._id === notification._id)) {
                    return prev
                }
                setUnreadCount((count) => count + 1)
                return [notification, ...prev]
            })

            // Play a subtle notification sound (Professional simple UI bubble pop)
            const audio = new Audio(
                'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
            )
            audio.volume = 0.5
            audio.play().catch(() => {}) // Ignore if browser blocks autoplay

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
            socket.off('notification_received')
        }
    }, [isConnected, socket, user?._id])

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
        markAllAsRead,
        markNotificationAsRead,
        refresh: fetchNotifications,
    }
}
