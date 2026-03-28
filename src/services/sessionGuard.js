import { redisClient } from '@/lib/redis'
import dbConnect from '@/lib/mongodb'
import { InterviewSession } from '@/models/InterviewSession.model'
import { User } from '@/models/User.models'

const LOCAL_ACTIVE_CACHE_TTL_MS = 15_000
const localSessionActiveCache = new Map()

function getLocalSessionState(sessionId) {
    const cached = localSessionActiveCache.get(sessionId)
    if (!cached) return null

    if (cached.expiresAt <= Date.now()) {
        localSessionActiveCache.delete(sessionId)
        return null
    }

    return cached.value
}

function setLocalSessionState(sessionId, value, ttlMs = LOCAL_ACTIVE_CACHE_TTL_MS) {
    localSessionActiveCache.set(sessionId, {
        value,
        expiresAt: Date.now() + ttlMs,
    })
}

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

    // Tier 0: in-process short-lived cache to avoid hammering Redis in hot socket paths.
    const localState = getLocalSessionState(sessionId)
    if (localState !== null) {
        return localState
    }

    // Tier 1: Redis Check
    try {
        if (redisClient.isOpen) {
            const cachedStatus = await redisClient.get(redisKey)
            if (cachedStatus !== null) {
                const isActive = cachedStatus === '1'
                setLocalSessionState(sessionId, isActive)
                return isActive
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

        setLocalSessionState(sessionId, isActive)

        return isActive
    } catch (dbErr) {
        console.error(
            `[SessionGuard] Critical: Both Redis and DB failed for session ${sessionId}:`,
            dbErr.message
        )
        return false // Fail Closed
    }
}
