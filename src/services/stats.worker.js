import { Worker } from 'bullmq'
import { connection } from '@/lib/queue'
import { User } from '@/models/User.models'
import { syncUserStats } from '@/services/user.service'
import { redisClient } from '@/lib/redis'

export function initStatsWorker() {
    const worker = new Worker(
        'stats-queue',
        async (job) => {
            const { userId } = job.data

            try {
                console.log(`[STATS WORKER] Syncing stats for user ${userId}`)
                const oldUser = await User.findById(userId).select('stats.globalRank')
                const updatedUser = await syncUserStats(userId)

                // Check for rank shift
                if (oldUser && updatedUser && updatedUser.stats?.globalRank) {
                    const { checkAndNotifyRankShift } =
                        await import('@/services/notification.service')
                    const oldRank = oldUser.stats?.globalRank || 999999
                    const newRank = updatedUser.stats.globalRank
                    if (newRank < oldRank) {
                        await checkAndNotifyRankShift(userId, oldRank, newRank)
                    }
                }

                if (redisClient.isOpen) {
                    const keys = await redisClient.keys('leaderboard:global:*')
                    if (keys.length > 0) {
                        await redisClient.del(keys).catch(() => {})
                    }
                    await redisClient.del(`user:stats:${userId}`).catch(() => {})
                }

                console.log(`[STATS WORKER] Stats synced for user ${userId}`)
                return { success: true }
            } catch (error) {
                console.error(`[STATS WORKER] Error syncing stats for user ${userId}:`, error)
                throw error
            }
        },
        { connection, concurrency: 1 }
    )

    worker.on('failed', (job, err) => {
        console.error(`[STATS WORKER] Job failed for user ${job.data?.userId}:`, err.message)
    })

    return worker
}
