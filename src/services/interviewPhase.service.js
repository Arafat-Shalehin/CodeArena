import { InterviewSession } from '@/models/InterviewSession.model'

const ALLOWED_TRANSITIONS = {
    intro: ['qa'],
    qa: ['coding'],
    coding: ['evaluation'],
    evaluation: [],
}

/**
 * Deterministic State Machine for AI Interview Phase Transitions
 * Ensures:
 * 1. Strict ordering
 * 2. MongoDB as Source of Truth
 * 3. Atomic, conditional updates avoiding race conditions
 * 4. Redis cache reflection
 */
export async function requestPhaseTransition(sessionId, expectedFromPhase, toPhase, redisClient) {
    // Step 1: Read current phase from MongoDB (source of truth)
    const session = await InterviewSession.findById(sessionId).select('currentPhase')

    if (!session) {
        throw new Error(`Session not found: ${sessionId}`)
    }

    const actualFromPhase = session.currentPhase

    // Idempotent escape hatch
    if (actualFromPhase === toPhase) {
        return { success: true, reason: 'ALREADY_IN_PHASE' }
    }

    // Step 2: Prevent stale or duplicate transitions
    if (actualFromPhase !== expectedFromPhase) {
        console.warn(
            `[PhaseStateMachine] Stale phase attempt for ${sessionId}. Expected ${expectedFromPhase}, but DB is ${actualFromPhase}`
        )
        return { success: false, reason: 'STALE_PHASE' }
    }

    // Step 3: Validate transition
    const allowed = ALLOWED_TRANSITIONS[actualFromPhase] || []
    if (!allowed.includes(toPhase)) {
        console.warn(
            `[PhaseStateMachine] Illegal transition for ${sessionId}: ${actualFromPhase} → ${toPhase}`
        )
        return { success: false, reason: 'INVALID_TRANSITION' }
    }

    // Step 4: Update MongoDB FIRST (source of truth & concurrency guard)
    const updateResult = await InterviewSession.updateOne(
        { _id: sessionId, currentPhase: actualFromPhase },
        { $set: { currentPhase: toPhase } }
    )

    if (updateResult.modifiedCount === 0) {
        console.warn(
            `[PhaseStateMachine] Concurrency collision for ${sessionId}: DB phase changed during transition window.`
        )
        return { success: false, reason: 'CONCURRENCY_COLLISION' }
    }

    // Step 5: Update Redis cache
    if (redisClient) {
        try {
            await redisClient.set(`session:phase:${sessionId}`, toPhase, { EX: 7200 })
        } catch (err) {
            console.warn('[PhaseStateMachine] Redis update failed (non-critical):', err)
        }
    }

    console.log(
        `[PhaseStateMachine] Success: ${sessionId} transitioned ${actualFromPhase} → ${toPhase}`
    )
    return { success: true }
}
