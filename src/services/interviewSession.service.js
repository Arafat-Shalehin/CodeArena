import { InterviewSession } from '../models/InterviewSession.model.js'
import { getRecommendedProblems } from './recommendation.service.js'
import {
    setInterviewState,
    deleteInterviewState,
    updateInterviewState,
    getInterviewState,
} from '../lib/redis/interviewState.js'

/**
 * Valid phases enforcing strict order transitions if necessary
 */
const VALID_PHASES = ['greeting', 'coding', 'submitted', 'followup', 'ended']

/**
 * Creates a new interview session.
 * Enforces rate limiting (5 per hour) and maximum 1 active session.
 */
export async function createSession(userId, mode = 'practice', durationMins = 60) {
    // 1. Verify user does not have an active session
    const activeSession = await InterviewSession.findOne({
        userId,
        status: 'active',
    })
    if (activeSession) {
        throw new Error('User already has an active interview session')
    }

    // 2. Enforce 5/hour rate limit
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentSessionsCount = await InterviewSession.countDocuments({
        userId,
        startedAt: { $gte: oneHourAgo },
    })

    if (recentSessionsCount >= 5) {
        throw new Error('Rate limit exceeded: Maximum 5 interview sessions per hour')
    }

    // 3. Select a problem using the existing recommendation engine
    const { recommendedProblems } = await getRecommendedProblems(userId, 1)
    if (!recommendedProblems || recommendedProblems.length === 0) {
        throw new Error('No appropriate problem found for this session')
    }
    const problemId = recommendedProblems[0]._id

    // 4. Create the session record
    const session = await InterviewSession.create({
        userId,
        problemIds: [problemId],
        mode,
        durationMins,
        status: 'active',
        currentPhase: 'greeting',
        startedAt: new Date(),
    })

    // 5. Initialize Redis state with TTL
    await setInterviewState(
        session._id,
        {
            userId,
            problemId,
            startedAt: session.startedAt.getTime(),
            currentPhase: 'greeting',
        },
        durationMins
    )

    return session
}

/**
 * Gets active session and checks for expiration.
 */
export async function getActiveSession(userId) {
    let session = await InterviewSession.findOne({
        userId,
        status: 'active',
    })

    if (!session) return null

    // Proactively check expiration
    session = await checkAndExpireSession(session._id)
    return session.status === 'active' ? session : null
}

/**
 * Transitions the session to a new phase.
 */
export async function transitionPhase(sessionId, newPhase) {
    if (!VALID_PHASES.includes(newPhase)) {
        throw new Error('Invalid interview phase')
    }

    const session = await InterviewSession.findById(sessionId)
    if (!session || session.status !== 'active') {
        throw new Error('Active session not found')
    }

    session.currentPhase = newPhase

    if (newPhase === 'ended') {
        session.status = 'completed'
        session.endedAt = new Date()
        await session.save()
        await deleteInterviewState(sessionId)
    } else {
        await session.save()
        await updateInterviewState(sessionId, { currentPhase: newPhase })
    }

    return session
}

/**
 * Terminates a session explicitly (e.g. user aborts).
 */
export async function terminateSession(sessionId) {
    const session = await InterviewSession.findByIdAndUpdate(
        sessionId,
        {
            status: 'terminated',
            currentPhase: 'ended',
            endedAt: new Date(),
        },
        { new: true }
    )

    if (session) {
        await deleteInterviewState(sessionId)
    }

    return session
}

/**
 * Checks if a session has expired based on its duration limit.
 */
export async function checkAndExpireSession(sessionId) {
    let session = await InterviewSession.findById(sessionId)
    if (!session || session.status !== 'active') return session

    const now = new Date()
    const elapsedMins = (now.getTime() - session.startedAt.getTime()) / (1000 * 60)

    if (elapsedMins > session.durationMins) {
        session.status = 'expired'
        session.currentPhase = 'ended'
        session.endedAt = now
        await session.save()

        // Remove from active Redis tracking
        await deleteInterviewState(sessionId)
    }

    return session
}
