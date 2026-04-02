import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export default function usePushNotifications() {
    const { isAuthenticated } = useAuth()
    const registrationRef = useRef(null)
    const subscriptionRef = useRef(null)

    const subscribe = useCallback(async () => {
        if (!isAuthenticated) return null
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            return null
        }

        try {
            const reg = await navigator.serviceWorker.ready
            registrationRef.current = reg

            let subscription = await reg.pushManager.getSubscription()

            if (!subscription) {
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                if (!vapidPublicKey) return null

                subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                })
            }

            subscriptionRef.current = subscription

            const { endpoint, keys } = subscription.toJSON()
            const res = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ endpoint, keys }),
            })

            if (!res.ok) {
                console.warn('Push subscribe API failed:', res.status)
                return null
            }

            return subscription
        } catch (error) {
            console.error('Push subscription error:', error)
            return null
        }
    }, [isAuthenticated])

    const unsubscribe = useCallback(async () => {
        try {
            const subscription =
                subscriptionRef.current ||
                (await registrationRef.current?.pushManager.getSubscription())
            if (subscription) {
                const { endpoint } = subscription.toJSON()
                await subscription.unsubscribe()
                await fetch('/api/push/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ endpoint }),
                })
                subscriptionRef.current = null
            }
        } catch (error) {
            console.error('Push unsubscribe error:', error)
        }
    }, [])

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) return 'unsupported'

        const permission = await Notification.requestPermission()
        if (permission === 'granted') return subscribe()
        return permission
    }, [subscribe])

    useEffect(() => {
        if (isAuthenticated && 'Notification' in window && Notification.permission === 'granted') {
            subscribe()
        }
    }, [isAuthenticated, subscribe])

    return {
        subscribe,
        unsubscribe,
        requestPermission,
        isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
    }
}
