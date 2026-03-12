import { redisClient } from '../redis.js'

const getKey = (sessionId) => `interview:state:${sessionId}`

/**
 * Initialize a new interview session state in Redis.
 */
export async function setInterviewState(sessionId, stateData, durationMins) {
    const key = getKey(sessionId)

    // Hash fields
    const fields = {
        userId: stateData.userId.toString(),
        problemId: stateData.problemId.toString(),
        startedAt: stateData.startedAt.toString() || Date.now().toString(),
        timeLimit: (durationMins * 60).toString(),
        currentPhase: stateData.currentPhase || 'greeting',
        aiContextLen: (stateData.aiContextLen || 0).toString(),
        submissionCount: (stateData.submissionCount || 0).toString(),
        hintsUsed: (stateData.hintsUsed || 0).toString(),
    }

    // Use HSET for fields
    await redisClient.hSet(key, fields)

    // Set TTL to durationMins + 30 minutes padding
    const ttlSeconds = (durationMins + 30) * 60
    await redisClient.expire(key, ttlSeconds)

    return fields
}

/**
 * Retrieves the interview session state from Redis.
 */
export async function getInterviewState(sessionId) {
    const key = getKey(sessionId)
    const data = await redisClient.hGetAll(key)

    if (!data || Object.keys(data).length === 0) {
        return null
    }

    return {
        userId: data.userId,
        problemId: data.problemId,
        startedAt: parseInt(data.startedAt, 10),
        timeLimit: parseInt(data.timeLimit, 10),
        currentPhase: data.currentPhase,
        aiContextLen: parseInt(data.aiContextLen, 10),
        submissionCount: parseInt(data.submissionCount, 10),
        hintsUsed: parseInt(data.hintsUsed, 10),
    }
}

/**
 * Updates specific fields in the interview session state.
 */
export async function updateInterviewState(sessionId, updates) {
    const key = getKey(sessionId)

    const fields = {}
    for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined && v !== null) {
            fields[k] = v.toString()
        }
    }

    if (Object.keys(fields).length > 0) {
        await redisClient.hSet(key, fields)
    }
}

/**
 * Increments a numeric field in the interview session state.
 */
export async function incrementInterviewStateField(sessionId, field, incrementBy = 1) {
    const key = getKey(sessionId)
    return redisClient.hIncrBy(key, field, incrementBy)
}

/**
 * Removes the interview session state from Redis.
 */
export async function deleteInterviewState(sessionId) {
    const key = getKey(sessionId)
    return redisClient.del(key)
}
