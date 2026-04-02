/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
    if (!event.data) return

    let data
    try {
        data = event.data.json()
    } catch {
        data = { title: 'CodeArena', body: event.data.text() }
    }

    const options = {
        body: data.body || '',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: data.tag || 'codearena-notification',
        renotify: true,
        data: {
            url: data.link || '/',
        },
        actions: data.actions || [],
    }

    event.waitUntil(self.registration.showNotification(data.title || 'CodeArena', options))
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const urlToOpen = event.notification.data?.url || '/'

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there's already a window open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus()
                }
            }
            // No window open, open a new one
            return clients.openWindow(urlToOpen)
        })
    )
})

self.addEventListener('pushsubscriptionchange', (event) => {
    // When subscription changes (e.g., browser refresh), re-subscribe
    event.waitUntil(
        self.registration.pushManager
            .subscribe({
                userVisibleOnly: true,
            })
            .then((subscription) => {
                const { endpoint, keys } = subscription.toJSON()
                return fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint, keys }),
                })
            })
            .catch(console.error)
    )
})
