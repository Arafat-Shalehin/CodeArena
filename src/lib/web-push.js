import webPush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@codearena.dev'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export async function sendPushToSubscription(subscription, payload) {
    try {
        await webPush.sendNotification(subscription, JSON.stringify(payload))
        return true
    } catch (error) {
        if (error.statusCode === 410) {
            return 'expired'
        }
        console.error('[WebPush] Send error:', error.message)
        return false
    }
}

export async function sendPushToUser(subscriptions, payload) {
    if (!subscriptions || subscriptions.length === 0) return []

    const expired = []

    for (const sub of subscriptions) {
        const subObj = {
            endpoint: sub.endpoint,
            keys: sub.keys,
        }
        const result = await sendPushToSubscription(subObj, payload)
        if (result === 'expired') {
            expired.push(sub.endpoint)
        }
    }

    return expired
}

export function generateVapidKeys() {
    const keys = webPush.generateVAPIDKeys()
    return {
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
    }
}
