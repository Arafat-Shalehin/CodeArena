/**
 * interviewAI.worker.js
 *
 * BullMQ worker for the `interview-ai` queue.
 *
 * Responsibilities:
 *  1. Pick up a job (sessionId + context)
 *  2. Build the AI prompt via AIConversationService
 *  3. Stream AI response chunks to Redis Pub/Sub → interview:ai:<sessionId>
 *  4. Persist the final assembled response as a DB message
 *
 * The live socket namespace subscribes to the same channel and forwards
 * each published chunk directly to the connected client.
 */

import { Worker } from 'bullmq'
import { createClient } from 'redis'
import { connection } from '@/lib/queue'
import dbConnect from '@/lib/mongodb'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { InterviewResult } from '@/models/InterviewResult.model'
import { UserInterviewStats } from '@/models/UserInterviewStats.model'
import { buildPrompt, buildScorecardPrompt, selectModel } from '@/services/aiConversation.service'
import { generateInterviewChatResponse } from '@/lib/ai/interviewGroqClient'

// ── Redis publisher (separate client; cannot share the subscriber client) ──────
const redisUrl = process.env.REDIS_URL || ''

const redisConfig = redisUrl
    ? { url: redisUrl }
    : {
          socket: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          password: process.env.REDIS_PASSWORD || undefined,
      }

let publisher = null

async function getPublisher() {
    if (!publisher) {
        publisher = createClient(redisConfig)
        publisher.on('error', (err) => console.error('[InterviewAI Worker] Redis pub error:', err))
        await publisher.connect()
    }
    return publisher
}

// ── Channel helper ─────────────────────────────────────────────────────────────

/**
 * Redis Pub/Sub channel name for a given session.
 * @param {string} sessionId
 * @returns {string}
 */
export function interviewAIChannel(sessionId) {
    return `interview:ai:${sessionId}`
}

function extractJSON(rawText) {
    if (!rawText) throw new Error('Empty AI response')

    // Find the first occurrence of '{' and the last occurrence of '}'
    const startIndex = rawText.indexOf('{')
    const endIndex = rawText.lastIndexOf('}')

    if (startIndex === -1 || endIndex === -1) {
        console.error('[extractJSON] Raw text with no JSON object:', rawText)
        throw new Error('No valid JSON object found in AI response')
    }

    const jsonCandidate = rawText.substring(startIndex, endIndex + 1).trim()

    try {
        return JSON.parse(jsonCandidate)
    } catch (parseError) {
        console.error('[extractJSON] Parse failed for candidate:', jsonCandidate)
        // Try one more thing: strip backticks if they somehow leaked into the candidate
        const ultraClean = jsonCandidate.replace(/`/g, '').trim()
        try {
            return JSON.parse(ultraClean)
        } catch (e) {
            throw new Error(`Failed to parse JSON: ${parseError.message}`)
        }
    }
}

// ── Worker ─────────────────────────────────────────────────────────────────────

export function initInterviewAIWorker() {
    const worker = new Worker(
        'interview-ai',
        async (job) => {
            const { sessionId, userId, content, submissionVerdict, code, language: lang } = job.data

            console.log(
                `[InterviewAI Worker] v2.1 Processing job ${job.id} (${job.name}) for session ${sessionId}`
            )

            await dbConnect()

            // ─── Case 1: Final Scorecard ──────────────────────────────────────
            if (job.name === 'process-scorecard') {
                try {
                    // Idempotency guard — abort if result already exists
                    const existing = await InterviewResult.findOne({ sessionId })
                    if (existing) {
                        console.log('[InterviewAI Worker] Scorecard already exists, skipping.')
                        return { success: true, type: 'scorecard', skipped: true }
                    }

                    const [session, history, snapshots] = await Promise.all([
                        InterviewSession.findById(sessionId).populate('problemIds'),
                        InterviewMessage.find({ sessionId }).sort({ ts: 1 }),
                        InterviewSnapshot.find({
                            sessionId,
                            snapshotType: { $in: ['run', 'submit'] },
                        }).sort({ ts: 1 }),
                    ])

                    const problem = session?.problemIds?.[0]
                    if (!problem) {
                        console.error(
                            '[InterviewAI Worker] Problem context lost for session:',
                            sessionId
                        )
                        throw new Error('Problem context lost')
                    }

                    console.log(`[InterviewAI Worker] Generating scorecard for ${problem.title}...`)

                    // ─── Participation Guard ───────────────────────────────────────
                    // Avoid AI Hallucination: If no user messages AND no snapshots exists,
                    // or if the only snapshot is a boilerplate "auto" save.
                    const userMessages = history.filter((m) => m.role === 'user')
                    const meaningfulSnapshots = snapshots.filter(
                        (s) => s.snapshotType !== 'auto' || (s.code && s.code.length > 100)
                    )

                    if (userMessages.length === 0 && meaningfulSnapshots.length === 0) {
                        console.log(
                            '[InterviewAI Worker] Zero participation detected. Saving default 0 result.'
                        )
                        const result = await InterviewResult.findOneAndUpdate(
                            { sessionId },
                            {
                                sessionId,
                                userId,
                                communicationScore: 0,
                                codeQualityScore: 0,
                                problemSolvingScore: 0,
                                approachScore: 0,
                                overallScore: 0,
                                aiSummary:
                                    'The candidate ended the session without providing any conceptual answers or code implementations. Participation was insufficient for a technical evaluation.',
                                strengths: [],
                                weaknesses: ['No participation detected'],
                                recommendations: [
                                    'Engage with the interviewer during the Q&A phase',
                                    'Attempt a partial implementation even if stuck',
                                ],
                                createdAt: new Date(),
                                error: false,
                            },
                            { upsert: true, new: true }
                        )

                        await InterviewSession.findByIdAndUpdate(sessionId, {
                            status: 'terminated',
                            currentPhase: 'completed',
                            finalScore: 0,
                            endedAt: new Date(),
                        })

                        const pub = await getPublisher()
                        await pub.publish(
                            interviewAIChannel(sessionId),
                            JSON.stringify({ scorecard: result, phase: 'completed' })
                        )
                        return { success: true, type: 'scorecard', participation: 'none' }
                    }

                    // Build prompt with evaluation metadata
                    const { systemPrompt, messages } = buildScorecardPrompt({
                        problemTitle: problem.title,
                        problemDescription: problem.description,
                        history,
                        submissions: snapshots.map((s) => ({
                            verdict: s.verdict || (s.snapshotType === 'submit' ? 'UNKNOWN' : 'RUN'),
                            passedCount: s.passedCount ?? '?',
                            totalCount: s.totalCount ?? '?',
                        })),
                        evaluationMetadata: {
                            correctAnswer: problem.correctAnswer,
                            expectedConcepts: problem.expectedConcepts,
                            evaluationCriteria: problem.evaluationCriteria,
                        },
                    })

                    // Get AI response (non-streaming)
                    const model = selectModel('completed', job.name)
                    const aiStream = generateInterviewChatResponse({
                        systemPrompt,
                        messages,
                        model,
                        phase: 'completed',
                        jobType: job.name,
                    })

                    let fullResponse = ''
                    for await (const chunk of aiStream) {
                        fullResponse += chunk
                    }

                    // Robust JSON extraction
                    console.log('[InterviewAI Worker] Raw AI Response length:', fullResponse.length)
                    const scorecardData = extractJSON(fullResponse)
                    console.log(
                        '[InterviewAI Worker] Parsed scorecard successfully. Overall Score:',
                        scorecardData.overallScore
                    )

                    // a. Update result document
                    const result = await InterviewResult.findOneAndUpdate(
                        { sessionId },
                        {
                            sessionId,
                            userId,
                            communicationScore: scorecardData.communicationScore || 0,
                            codeQualityScore:
                                scorecardData.codeQualityScore ||
                                scorecardData.codingPerformanceScore ||
                                0,
                            problemSolvingScore: scorecardData.problemSolvingScore || 0,
                            approachScore:
                                scorecardData.approachScore ||
                                scorecardData.technicalAccuracyScore ||
                                0,
                            overallScore: scorecardData.overallScore || 0,
                            aiSummary: scorecardData.aiSummary || '',
                            strengths: scorecardData.strengths || [],
                            weaknesses: scorecardData.weaknesses || [],
                            recommendations: scorecardData.recommendations || [],
                            createdAt: new Date(),
                            error: false, // Ensure error flag is false on success
                        },
                        { upsert: true, new: true }
                    )
                    console.log('[InterviewAI Worker] Saved result document:', result._id)

                    // b. Update session document: status -> completed, finalScore -> overallScore
                    // If the original session status was already set (expired/terminated), keep it.
                    // Only set to 'completed' if it was generically ending.
                    const currentSession = await InterviewSession.findById(sessionId)
                    const finalStatus = ['expired', 'terminated'].includes(currentSession?.status)
                        ? currentSession.status
                        : 'completed'

                    await InterviewSession.findByIdAndUpdate(sessionId, {
                        status: finalStatus,
                        currentPhase: 'completed',
                        finalScore: scorecardData.overallScore || 0,
                        endedAt: new Date(),
                    })

                    // --- c. Append Persistent Analytics Stats (Idempotent) ---
                    try {
                        let qaStartTime, qaEndTime, codingStartTime, codingEndTime

                        history.forEach((m) => {
                            if (m.phase === 'qa') {
                                if (!qaStartTime) qaStartTime = m.ts
                                qaEndTime = m.ts
                            }
                            if (m.phase === 'coding') {
                                if (!codingStartTime) codingStartTime = m.ts
                                codingEndTime = m.ts
                            }
                        })

                        const timeInQaPhase =
                            qaStartTime && qaEndTime
                                ? Math.round((new Date(qaEndTime) - new Date(qaStartTime)) / 1000)
                                : 0

                        const timeInCodingPhase =
                            codingStartTime && codingEndTime
                                ? Math.round(
                                      (new Date(codingEndTime) - new Date(codingStartTime)) / 1000
                                  )
                                : 0

                        const finalOverallScore = scorecardData.overallScore || 0
                        const recommendation =
                            finalOverallScore >= 80
                                ? 'hire'
                                : finalOverallScore >= 60
                                  ? 'maybe'
                                  : 'no_hire'

                        const statsPayload = {
                            userId,
                            sessionId,
                            problemId: problem._id,
                            overallScore: finalOverallScore,
                            strengths: scorecardData.strengths || [],
                            weaknesses: scorecardData.weaknesses || [],
                            recommendation,
                            timeInQaPhase,
                            timeInCodingPhase,
                            completedAt: new Date(),
                        }

                        await UserInterviewStats.updateOne(
                            { sessionId },
                            { $setOnInsert: statsPayload },
                            { upsert: true }
                        )
                        console.log(
                            `[InterviewAI Worker] Idempotent stats insert successful for ${sessionId}`
                        )

                        // Invalidate the user stats cache
                        try {
                            const { redisClient } = await import('@/lib/redis')
                            await redisClient.del(`user:stats:${userId}`)
                        } catch (cacheErr) {
                            console.warn(
                                '[InterviewAI Worker] Stats cache invalidation failed:',
                                cacheErr
                            )
                        }
                    } catch (statsErr) {
                        console.error('[InterviewAI Worker] Stats insert failed:', statsErr)
                    }

                    const pub = await getPublisher()
                    await pub.publish(
                        interviewAIChannel(sessionId),
                        JSON.stringify({ scorecard: result, phase: 'completed' })
                    )

                    return { success: true, type: 'scorecard' }
                } catch (e) {
                    console.error('[InterviewAI Worker] Scorecard Generation failed:', e)

                    // Fallback logic: If this was the final attempt, save a dummy result
                    // to prevent the user from being stuck in "Pending" forever.
                    if (job.attemptsMade >= 2) {
                        // 3 attempts total (0, 1, 2)
                        console.warn(
                            '[InterviewAI Worker] Final attempt failed. Saving fallback result.'
                        )

                        const errorResult = await InterviewResult.findOneAndUpdate(
                            { sessionId },
                            {
                                sessionId,
                                userId,
                                overallScore: 0,
                                aiSummary:
                                    'Evaluation could not be completed at this time due to an AI response error. Please contact support if this persists.',
                                sections: [],
                                error: true,
                                createdAt: new Date(),
                            },
                            { upsert: true, new: true }
                        )

                        await InterviewSession.findByIdAndUpdate(sessionId, {
                            status: 'completed',
                            currentPhase: 'completed',
                            endedAt: new Date(),
                        })

                        const pub = await getPublisher()
                        await pub.publish(
                            interviewAIChannel(sessionId),
                            JSON.stringify({ scorecard: errorResult, phase: 'completed' })
                        )

                        return {
                            success: false,
                            type: 'scorecard',
                            error: e.message,
                            fallbackSaved: true,
                        }
                    }

                    throw e // Re-throw to trigger BullMQ retry
                }
            }

            // ─── Case 2: Conversation / Analysis ─────────────────────────────

            // Handle Auto-greeting trigger
            const isSystemStart = content === '[SYSTEM_START_INTERVIEW]'
            const adjustedContent = isSystemStart
                ? 'Introduce yourself as Alex and start the interview. Explain the rules (Conceptual then Coding) and ask the first conceptual question.'
                : content

            const [session, history] = await Promise.all([
                InterviewSession.findById(sessionId).populate('problemIds'),
                InterviewMessage.find({ sessionId }).sort({ ts: 1 }),
            ])

            if (!session) {
                console.error('[InterviewAI Worker] Session not found:', sessionId)
                return { success: false, error: 'Session not found' }
            }
            const currentPhase = session.currentPhase
            const problem = session.problemIds?.[0]

            // Inject evaluation metadata for QA phase
            const evaluationMetadata =
                currentPhase === 'qa' || currentPhase === 'intro'
                    ? {
                          correctAnswer: problem?.correctAnswer,
                          expectedConcepts: problem?.expectedConcepts,
                          evaluationCriteria: problem?.evaluationCriteria,
                      }
                    : null

            const lastSnapshot = await InterviewSnapshot.findOne({ sessionId })
                .sort({ ts: -1 })
                .lean()

            // Build prompt
            const { systemPrompt, messages } = buildPrompt({
                problemDescription: problem.description,
                currentCode: code || lastSnapshot?.code || '',
                language: lang || lastSnapshot?.language || 'python',
                phase: job.name === 'process-submission-analysis' ? 'evaluation' : currentPhase,
                submissionVerdict: submissionVerdict || null,
                userMessage: adjustedContent || '',
                history: job.name === 'process-chat' ? history.slice(0, -1) : history, // exclude the just-saved user turn if it was a chat job
                evaluationMetadata,
            })

            // 3. Stream AI response and publish each chunk to Redis
            const pub = await getPublisher()
            const channel = interviewAIChannel(sessionId)
            const model = selectModel(session.currentPhase, job.name)
            const aiStream = generateInterviewChatResponse({
                systemPrompt,
                messages,
                model,
                phase: session.currentPhase,
                jobType: job.name,
            })

            let fullResponse = ''
            let emitBuffer = ''

            // If it's a submission analysis, we might want to stream it or just send it at once.
            // Following 'interview:ai_analysis' requirement, we'll stream internally and then emit final.
            for await (const chunk of aiStream) {
                fullResponse += chunk
                // Only stream for chat messages; for analysis, we'll send the full object at the end
                if (job.name === 'process-chat') {
                    emitBuffer += chunk

                    let hold = false
                    const tag = '[INTERVIEW_COMPLETE]'
                    for (let i = 1; i <= tag.length; i++) {
                        if (emitBuffer.endsWith(tag.substring(0, i))) {
                            hold = true
                            break
                        }
                    }

                    if (hold) continue

                    if (emitBuffer.includes(tag)) {
                        emitBuffer = emitBuffer.replace(tag, '')
                    }

                    if (emitBuffer) {
                        await pub.publish(
                            channel,
                            JSON.stringify({ chunk: emitBuffer, done: false })
                        )
                        emitBuffer = ''
                    }
                }
            }

            if (emitBuffer) {
                emitBuffer = emitBuffer.replace('[INTERVIEW_COMPLETE]', '')
                if (emitBuffer) {
                    await pub.publish(channel, JSON.stringify({ chunk: emitBuffer, done: false }))
                }
            }

            const isComplete =
                fullResponse.includes('[INTERVIEW_COMPLETE]') ||
                fullResponse.includes('<WRAP_UP />')
            fullResponse = fullResponse
                .replace(/\[INTERVIEW_COMPLETE\]/g, '')
                .replace(/<WRAP_UP \/>/g, '')
                .trim()

            // 4. Finalise
            if (job.name === 'process-chat') {
                await pub.publish(channel, JSON.stringify({ chunk: '', done: true }))
            } else {
                // Emission for submission analysis
                await pub.publish(channel, JSON.stringify({ analysis: fullResponse }))
            }

            // [PART 3] Check for Wrap-up signal
            if (isComplete) {
                const { transitionPhase } = await import('./interviewSession.service')
                await transitionPhase(sessionId, 'completed')
            }

            // 5. Persist the full response to DB
            await InterviewMessage.create({
                sessionId,
                role: 'ai',
                phase: currentPhase,
                content: fullResponse,
                ts: new Date(),
            })

            // 6. Update session phase if it was a submission
            if (job.name === 'process-submission-analysis') {
                // Advance to evaluation (feedback) phase using deterministic state machine
                const { requestPhaseTransition } = await import('./interviewPhase.service')
                const { redisClient } = await import('@/lib/redis')

                const result = await requestPhaseTransition(
                    sessionId,
                    'coding',
                    'evaluation',
                    redisClient
                )

                if (!result.success) {
                    console.warn(
                        `[InterviewAI Worker] Shielded invalid phase transition coding->evaluation: ${result.reason}`
                    )
                    return { success: false, reason: result.reason }
                }

                // b. Emit phase change to client
                const pub = await getPublisher()
                await pub.publish(
                    interviewAIChannel(sessionId),
                    JSON.stringify({ phase: 'evaluation' })
                )
            }

            // 7. Handle Interactive Phase Transitions (Intro -> QA -> Coding)
            if (job.name === 'process-chat') {
                const userMessages = history.filter((m) => m.role === 'user')
                const { requestPhaseTransition } = await import('./interviewPhase.service')
                const { redisClient } = await import('@/lib/redis')

                if (session.currentPhase === 'intro') {
                    // Move to QA after the first user greeting
                    const result = await requestPhaseTransition(
                        sessionId,
                        'intro',
                        'qa',
                        redisClient
                    )

                    if (!result.success) {
                        console.warn(
                            `[InterviewAI Worker] Shielded invalid phase transition intro->qa: ${result.reason}`
                        )
                        return { success: false, reason: result.reason }
                    }

                    const pub = await getPublisher()
                    await pub.publish(
                        interviewAIChannel(sessionId),
                        JSON.stringify({ phase: 'qa' })
                    )
                } else if (session.currentPhase === 'qa') {
                    const qaCount = userMessages.filter((m) => m.phase === 'qa').length
                    if (qaCount >= 2) {
                        // Move to coding after 2 QA turns
                        const result = await requestPhaseTransition(
                            sessionId,
                            'qa',
                            'coding',
                            redisClient
                        )

                        if (!result.success) {
                            console.warn(
                                `[InterviewAI Worker] Shielded invalid phase transition qa->coding: ${result.reason}`
                            )
                            return { success: false, reason: result.reason }
                        }

                        const pub = await getPublisher()
                        await pub.publish(
                            interviewAIChannel(sessionId),
                            JSON.stringify({ phase: 'coding' })
                        )
                    }
                }
            }

            console.log(
                `[InterviewAI Worker] Job ${job.id} complete – ${fullResponse.length} chars generated for session ${sessionId}`
            )
            return { success: true, length: fullResponse.length }
        },
        {
            connection,
            concurrency: 5, // Allow 5 parallel interview AI streams
        }
    )

    worker.on('failed', async (job, err) => {
        const isFinalAttempt = job.attemptsMade >= job.opts.attempts

        if (!isFinalAttempt) return // Silently retry transient failures

        // Idempotency Protection: Prevent duplicate error emissions on stray worker restarts
        if (job.data.__errorEmitted) return
        await job.updateData({ ...job.data, __errorEmitted: true })

        const sessionId = job?.data?.sessionId
        if (!sessionId) return

        console.error('[AI Worker Final Failure]', {
            jobId: job.id,
            sessionId,
            attempts: job.attemptsMade,
            error: err.message,
        })

        const payload = {
            type: 'error',
            code: 'AI_UNAVAILABLE',
            message: 'Alex is having trouble responding. Please resend your message.',
            sessionId,
            jobId: job.id,
            attemptsMade: job.attemptsMade,
            timestamp: Date.now(),
        }

        try {
            const pub = await getPublisher()
            await pub.publish(interviewAIChannel(sessionId), JSON.stringify(payload))
        } catch (pubErr) {
            console.error('[AI Worker] Failed to publish final failure event:', pubErr)
        }
    })

    worker.on('error', (err) => {
        console.error('[InterviewAI Worker] Worker error:', err)
    })

    console.log('[InterviewAI Worker] Initialized — listening on queue: interview-ai')
    return worker
}
