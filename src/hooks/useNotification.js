'use client'

import { useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export function useNotification() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [socket, setSocket] = useState(null)

    const fetchNotifications = useCallback(async () => {
        if (!user?._id) return
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            if (data.success) {
                setNotifications(data.data)
                setUnreadCount(data.data.filter((n) => !n.isRead).length)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }, [user?._id])

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

            // Play a subtle sound
            const audio = new Audio('/sounds/notification.mp3')
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

        setSocket(socketInstance)

        return () => {
            if (socketInstance) socketInstance.disconnect()
        }
    }, [user?._id, fetchNotifications])

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
