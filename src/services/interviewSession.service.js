import { InterviewSession } from '../models/InterviewSession.model.js'
import { InterviewMessage } from '../models/InterviewMessage.model.js'
import { getRecommendedProblems } from './recommendation.service.js'
import {
    setInterviewState,
    deleteInterviewState,
    updateInterviewState,
} from '../lib/redis/interviewState.js'
import { getInterviewAIQueue } from '../lib/queue.js'
import { buildPrompt, selectModel } from './aiConversation.service.js'
import { generateInterviewChatResponse } from '../lib/ai/interviewGroqClient.js'
import { redisClient } from '../lib/redis.js'
import { generateIntro } from './intro.service.js'

/**
 * Valid phases enforcing strict order transitions if necessary
 */
const VALID_PHASES = ['intro', 'qa', 'coding', 'evaluation', 'completed']

/**
 * Creates a new interview session.
 * Enforces rate limiting (5 per hour) and maximum 1 active session.
 */
export async function createSession(userId, mode = 'practice', durationMins = 60) {
    // 1. Verify user does not have an active session
    let existingSession = await InterviewSession.findOne({
        userId,
        status: 'active',
    })

    if (existingSession) {
        // Proactively check if it should be expired
        existingSession = await checkAndExpireSession(existingSession._id)
    }

    if (existingSession && existingSession.status === 'active') {
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
    // Fetch a larger pool to allow random selection
    const { recommendedProblems } = await getRecommendedProblems(userId, 10)
    if (!recommendedProblems || recommendedProblems.length === 0) {
        throw new Error('No appropriate problem found for this session')
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    // MongoDB handles `distinct` on array fields gracefully
    const recentProblemIdsRaw = await InterviewSession.find({
        userId,
        createdAt: { $gt: sevenDaysAgo },
    }).distinct('problemIds')

    const recentProblemIds = new Set(recentProblemIdsRaw.map((id) => id.toString()))

    const freshProblems = recommendedProblems.filter((p) => !recentProblemIds.has(p._id.toString()))

    function pickOne(arr) {
        return arr[Math.floor(Math.random() * arr.length)]
    }

    const chosenProblem =
        freshProblems.length > 0 ? pickOne(freshProblems) : pickOne(recommendedProblems)

    const problemId = chosenProblem._id

    // 4. Create the session record
    const session = await InterviewSession.create({
        userId,
        problemIds: [problemId],
        mode,
        durationMins,
        status: 'active',
        currentPhase: 'intro',
        startedAt: new Date(),
    })

    try {
        await redisClient.set(`session:status:${session._id}`, 'active', { EX: 8 * 60 * 60 })
        await redisClient.set(`session:phase:${session._id}`, 'intro', { EX: 7200 })
    } catch (err) {
        console.error('[createSession] Redis guard/phase init failed:', err)
    }

    try {
        // --- Generate Templated Intro (Alex Persona) ---
        const greetingContent = generateIntro(chosenProblem.title, chosenProblem.difficulty)
        console.log(`[Intro] Generated templated greeting for session: ${session._id}`)

        // 6. Save greeting to DB
        const greetingMessage = await InterviewMessage.create({
            sessionId: session._id,
            role: 'ai',
            phase: 'intro',
            content: greetingContent,
            ts: new Date(),
        })

        // 7. Initialize Redis state with TTL
        await setInterviewState(
            session._id,
            {
                userId,
                problemId: problemId.toString(),
                startedAt: session.startedAt.getTime(),
                currentPhase: 'intro',
                durationMins,
                expiresAt: session.startedAt.getTime() + durationMins * 60 * 1000,
            },
            durationMins
        )

        return { session, greeting: greetingMessage }
    } catch (err) {
        // Rollback: delete or terminate the orphaned session so user can retry
        console.error(
            '[createSession] Critical failure after session creation. Rolling back:',
            err.message
        )
        await InterviewSession.findByIdAndUpdate(session._id, {
            status: 'terminated',
            endedAt: new Date(),
        })
        throw err
    }
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
 * If newPhase is 'completed', it marks the session as finished (idempotent).
 */
export async function transitionPhase(sessionId, newPhase, options = {}) {
    if (!VALID_PHASES.includes(newPhase)) {
        throw new Error('Invalid interview phase')
    }

    if (newPhase === 'completed') {
        // Atomic transition from 'active' to a terminal status
        const session = await InterviewSession.findOneAndUpdate(
            { _id: sessionId, status: 'active' },
            {
                $set: {
                    status: options.status || 'completed',
                    currentPhase: 'completed',
                    endedAt: new Date(),
                },
            },
            { new: true }
        )

        // If session was already not active, check if it's already terminal
        if (!session) {
            const terminalSession = await InterviewSession.findById(sessionId)
            if (!terminalSession) throw new Error('Session not found')

            // If already terminal, return early without re-triggering jobs
            if (['completed', 'expired', 'terminated'].includes(terminalSession.status)) {
                return terminalSession
            }
            throw new Error('Session is in an invalid state for completion')
        }

        try {
            await redisClient.set(`session:status:${sessionId}`, 'completed', { EX: 60 * 60 })
        } catch (err) {
            console.error('[transitionPhase] Redis guard update failed:', err)
        }

        // --- Success path: Transitioned from active ---
        await deleteInterviewState(sessionId)

        // Centralized Scorecard generation trigger
        const queue = getInterviewAIQueue()
        await queue.add(
            'process-scorecard',
            {
                sessionId: session._id,
                userId: session.userId,
            },
            {
                attempts: 3,
                backoff: {
                    type: 'fixed',
                    delay: 5000,
                },
            }
        )

        return session
    }

    // Normal phase transition (intro -> qa -> coding etc)
    const session = await InterviewSession.findOneAndUpdate(
        { _id: sessionId, status: 'active' },
        { $set: { currentPhase: newPhase } },
        { new: true }
    )

    if (!session) {
        throw new Error('Active session not found or already finished')
    }

    await updateInterviewState(sessionId, { currentPhase: newPhase })
    return session
}

/**
 * Terminates a session explicitly (e.g. user aborts).
 */
export async function terminateSession(sessionId) {
    return await transitionPhase(sessionId, 'completed', { status: 'terminated' })
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
        return await transitionPhase(sessionId, 'completed', { status: 'expired' })
    }

    return session
}
