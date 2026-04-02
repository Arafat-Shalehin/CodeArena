import { Notification } from '@/models/Notification.models'
import { User } from '@/models/User.models'
import { redisClient } from '@/lib/redis'
import { sendPushToUser } from '@/lib/web-push'

/**
 * Send a notification to a specific user
 * @param {Object} data - Notification data
 * @param {string} data.recipientId - ID of the user to receive notice
 * @param {string} data.senderId - ID of the user who triggered notice (optional)
 * @param {string} data.type - Type: 'social' | 'contest' | 'judging' | 'ai_insight'
 * @param {string} data.message - Main text
 * @param {string} data.link - Target URL (optional)
 * @param {Object} data.metadata - Additional info (optional)
 * @param {boolean} data.skipPush - Skip push notification delivery (default: false)
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
            const cachePattern = `notifications:${data.recipientId}:*`
            try {
                const keys = await redisClient.keys(cachePattern)
                if (keys.length > 0) await redisClient.del(keys)
            } catch (err) {
                console.error('Failed to invalidate notification cache:', err)
            }

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

        // 3. Send push notification if not skipped
        if (!data.skipPush) {
            const recipient = await User.findById(data.recipientId).select(
                'pushSubscriptions notificationSettings'
            )

            if (recipient && recipient.pushSubscriptions?.length > 0) {
                const settings = recipient.notificationSettings || {}
                const shouldPush =
                    data.type === 'contest'
                        ? settings.pushContests !== false
                        : data.type === 'social'
                          ? settings.pushFollowers !== false
                          : true

                if (shouldPush) {
                    const pushPayload = {
                        title: 'CodeArena',
                        body: data.message,
                        link: data.link || '/',
                        tag: `${data.type}-${data.recipientId}`,
                    }

                    const expired = await sendPushToUser(recipient.pushSubscriptions, pushPayload)

                    // Clean up expired subscriptions
                    if (expired.length > 0) {
                        await User.findByIdAndUpdate(data.recipientId, {
                            $pull: { pushSubscriptions: { endpoint: { $in: expired } } },
                        })
                    }
                }
            }
        }

        return notification
    } catch (error) {
        console.error('[NotificationService] Error sending notification:', error)
        return null
    }
}

export async function getUserNotifications(userId, limit = 20) {
    const cacheKey = `notifications:${userId}:limit:${limit}`

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

    const notifications = await Notification.find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('senderId', 'name avatarSeed')

    try {
        if (redisClient.isOpen) {
            await redisClient.set(cacheKey, JSON.stringify(notifications), { EX: 300 }) // 5 mins
        }
    } catch (err) {
        console.error('Redis write error in getUserNotifications:', err)
    }

    return notifications
}

export async function markAsRead(notificationId, userId) {
    const result = await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId: userId },
        { isRead: true },
        { new: true }
    )

    if (redisClient.isOpen) {
        const keys = await redisClient.keys(`notifications:${userId}:*`)
        if (keys.length > 0) await redisClient.del(keys).catch(() => {})
    }

    return result
}

export async function markAllAsRead(userId) {
    const result = await Notification.updateMany(
        { recipientId: userId, isRead: false },
        { isRead: true }
    )

    if (redisClient.isOpen) {
        const keys = await redisClient.keys(`notifications:${userId}:*`)
        if (keys.length > 0) await redisClient.del(keys).catch(() => {})
    }

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
/**
 * Resolves the display name of the actor (user) associated with a notification.
 * This is required by the API routes to prevent build errors.
 */
export async function resolveNotificationActorName(actorId) {
    try {
        if (!actorId) return 'System'

        const { User } = await import('@/models/User.models')
        const user = await User.findById(actorId).select('name')

        return user ? user.name : 'Unknown User'
    } catch (error) {
        console.error('[NotificationService] Error resolving actor name:', error)
        return 'User'
    }
}
