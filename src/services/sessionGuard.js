import { redisClient } from '@/lib/redis'
import dbConnect from '@/lib/mongodb'
import { InterviewSession } from '@/models/InterviewSession.model'
import { User } from '@/models/User.models'

/**
 * Checks if an interview session is currently active.
 * Fail-closed implementation with Redis-first strategy.
 *
 * @param {string} sessionId
 * @returns {Promise<boolean>}
 */
export async function isSessionActive(sessionId) {
    if (!sessionId) return false
    const redisKey = `session:active:${sessionId}`

    // Tier 1: Redis Check
    try {
        if (redisClient.isOpen) {
            const cachedStatus = await redisClient.get(redisKey)
            if (cachedStatus !== null) {
                return cachedStatus === '1'
            }
        }
    } catch (err) {
        console.warn(
            `[SessionGuard] Redis check failed for session ${sessionId}, falling back to DB:`,
            err.message
        )
    }

    // Tier 2: DB Fallback
    try {
        await dbConnect()
        const session = await InterviewSession.findById(sessionId).select('status').lean()
        const isActive = session?.status === 'active'

        // Backfill Redis if active
        if (isActive && redisClient.isOpen) {
            await redisClient.set(redisKey, '1', { EX: 3600 }).catch(() => {})
        }

        return isActive
    } catch (dbErr) {
        console.error(
            `[SessionGuard] Critical: Both Redis and DB failed for session ${sessionId}:`,
            dbErr.message
        )
        return false // Fail Closed
    }
}
