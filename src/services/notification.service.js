import { Notification } from '@/models/Notification.models'
import { redisClient } from '@/lib/redis'

const DEFAULT_NOTIFICATION_LIMIT = 20
const MAX_NOTIFICATION_LIMIT = 50
const NOTIFICATION_CACHE_TTL_SECONDS = 300

function normalizeLimit(limit) {
    const parsed = Number.parseInt(String(limit || DEFAULT_NOTIFICATION_LIMIT), 10)
    if (Number.isNaN(parsed)) return DEFAULT_NOTIFICATION_LIMIT
    return Math.min(Math.max(parsed, 1), MAX_NOTIFICATION_LIMIT)
}

function normalizeCursor(cursor) {
    if (!cursor) return null
    const date = new Date(cursor)
    return Number.isNaN(date.getTime()) ? null : date
}

function getNotificationVersionKey(userId) {
    return `notifications:${userId}:v`
}

function getNotificationCacheKey(userId, { version, limit, cursor }) {
    const safeCursor = cursor ? new Date(cursor).toISOString() : 'none'
    return `notifications:${userId}:ver:${version}:limit:${limit}:cursor:${safeCursor}`
}

async function getNotificationCacheVersion(userId) {
    if (!redisClient.isOpen) return '0'

    const versionKey = getNotificationVersionKey(userId)

    try {
        let version = await redisClient.get(versionKey)
        if (!version) {
            version = '1'
            await redisClient.set(versionKey, version, { NX: true })
        }
        return version || '1'
    } catch (err) {
        console.error('Failed to read notification cache version:', err)
        return '0'
    }
}

async function bumpNotificationCacheVersion(userId) {
    if (!redisClient.isOpen) return

    try {
        await redisClient.incr(getNotificationVersionKey(userId))
    } catch (err) {
        console.error('Failed to bump notification cache version:', err)
    }
}

export async function resolveNotificationActorName(user) {
    if (user?.name?.trim()) return user.name.trim()

    if (user?.email?.trim()) {
        return user.email.split('@')[0].trim() || 'Someone'
    }

    if (user?._id || user?.id) {
        try {
            const { User } = await import('@/models/User.models')
            const actor = await User.findById(user._id || user.id)
                .select('name email')
                .lean()

            if (actor?.name?.trim()) return actor.name.trim()
            if (actor?.email?.trim()) return actor.email.split('@')[0].trim() || 'Someone'
        } catch (error) {
            console.error('[NotificationService] Failed to resolve actor name:', error)
        }
    }

    return 'Someone'
}

/**
 * Send a notification to a specific user
 * @param {Object} data - Notification data
 * @param {string} data.recipientId - ID of the user to receive notice
 * @param {string} data.senderId - ID of the user who triggered notice (optional)
 * @param {string} data.type - Type: 'social' | 'contest' | 'judging' | 'ai_insight'
 * @param {string} data.message - Main text
 * @param {string} data.link - Target URL (optional)
 * @param {Object} data.metadata - Additional info (optional)
 */
export async function sendNotification(data) {
    try {
        // 1. Save to Database
        const notification = await Notification.create({
            recipientId: data.recipientId,
            senderId: data.senderId,
            type: data.type,
            message: data.message,
            link: data.link,
            metadata: data.metadata || {},
        })

        // 2. Publish to Redis for Socket.IO instances to pick up
        if (redisClient.isOpen) {
            // Invalidate notification cache via version bump (O(1), avoids KEYS scan).
            await bumpNotificationCacheVersion(data.recipientId)

            await redisClient.publish(
                'notifications',
                JSON.stringify({
                    recipientId: data.recipientId,
                    notification: {
                        ...notification.toObject(),
                        _id: notification._id.toString(),
                    },
                })
            )
        }

        return notification
    } catch (error) {
        console.error('[NotificationService] Error sending notification:', error)
        // We don't throw error here to avoid blocking main execution flow
        return null
    }
}

export async function getUserNotifications(userId, options = {}) {
    const normalizedOptions = typeof options === 'number' ? { limit: options } : (options ?? {})
    const limit = normalizeLimit(normalizedOptions.limit)
    const cursorDate = normalizeCursor(normalizedOptions.cursor)
    const cursor = cursorDate ? cursorDate.toISOString() : null
    const version = await getNotificationCacheVersion(userId)
    const cacheKey = getNotificationCacheKey(userId, { version, limit, cursor })

    try {
        if (redisClient.isOpen) {
            const cached = await redisClient.get(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }
        }
    } catch (err) {
        console.error('Redis read error in getUserNotifications:', err)
    }

    const query = { recipientId: userId }
    if (cursorDate) {
        query.createdAt = { $lt: cursorDate }
    }

    const docs = await Notification.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .select('senderId type message link metadata isRead createdAt')
        .populate('senderId', 'name avatarSeed')
        .lean()

    const hasMore = docs.length > limit
    const notifications = hasMore ? docs.slice(0, limit) : docs
    const lastItem = notifications[notifications.length - 1]
    const nextCursor =
        hasMore && lastItem?.createdAt ? new Date(lastItem.createdAt).toISOString() : null

    try {
        if (redisClient.isOpen) {
            await redisClient.set(
                cacheKey,
                JSON.stringify({
                    data: notifications,
                    pagination: {
                        hasMore,
                        nextCursor,
                        count: notifications.length,
                    },
                }),
                { EX: NOTIFICATION_CACHE_TTL_SECONDS }
            )
        }
    } catch (err) {
        console.error('Redis write error in getUserNotifications:', err)
    }

    return {
        data: notifications,
        pagination: {
            hasMore,
            nextCursor,
            count: notifications.length,
        },
    }
}

export async function markAsRead(notificationId, userId) {
    const result = await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId: userId },
        { isRead: true },
        { new: true }
    )

    await bumpNotificationCacheVersion(userId)

    return result
}

export async function markAllAsRead(userId) {
    const result = await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
    )

    await bumpNotificationCacheVersion(userId)

    return result
}

export async function getUnreadCount(userId) {
    return await Notification.countDocuments({ recipientId: userId, isRead: false })
}

/**
 * Competitive Edge: Notify users when a rank shift happens
 */
export async function checkAndNotifyRankShift(userId, oldRank, newRank) {
    if (!newRank || newRank >= oldRank) return // No improvement

    try {
        const { User } = await import('@/models/User.models')
        const currentUser = await User.findById(userId).select('name')

        // Fetch users who were previously above this user but are now below or nearby
        // Simplified: notify users in the immediate neighborhood of the new rank
        const neighbors = await User.find({
            'stats.globalRank': {
                $gte: Math.max(1, newRank - 5),
                $lte: newRank + 5,
            },
            _id: { $ne: userId },
        }).select('_id name')

        for (const neighbor of neighbors) {
            await sendNotification({
                recipientId: neighbor._id,
                type: 'contest',
                message: `${currentUser.name} just climbed to Rank #${newRank}! Can you take your spot back? 🏆`,
                link: '/leaderboard',
                metadata: { challengerId: userId, newRank },
            })
        }
    } catch (error) {
        console.error('[NotificationService] Rank shift notification error:', error)
    }
}

/**
 * Notify users about contests starting soon (e.g., in 15 mins)
 */
export async function checkUpcomingContests() {
    try {
        const { Contest } = await import('@/models/Contest.models')
        const { ContestParticipant } = await import('@/models/ContestParticipant.models')

        const fifteenMinsFromNow = new Date(Date.now() + 15 * 60 * 1000)
        const fiveMinsFromNow = new Date(Date.now() + 5 * 60 * 1000)

        // Find contests starting in the next 15 minutes that haven't had a reminder sent
        const upcomingContests = await Contest.find({
            startTime: { $lte: fifteenMinsFromNow, $gt: new Date() },
            reminderSent: { $ne: true },
        })

        for (const contest of upcomingContests) {
            // Find all registered participants
            const participants = await ContestParticipant.find({ contestId: contest._id })

            for (const p of participants) {
                await sendNotification({
                    recipientId: p.userId,
                    type: 'contest',
                    message: `Reminder: "${contest.title}" is starting soon! Get ready. 🚀`,
                    link: `/contests/${contest._id}`,
                    metadata: { contestId: contest._id, contestStartTime: contest.startTime },
                })
            }

            // Mark reminder as sent
            contest.reminderSent = true
            await contest.save()
        }
    } catch (err) {
        console.error('[NotificationService] Contest reminder check failed:', err)
    }
}
