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
import crypto from 'crypto'
import { connection } from '@/lib/queue'
import dbConnect from '@/lib/mongodb'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { InterviewResult } from '@/models/InterviewResult.model'
import { buildPrompt, buildScorecardPrompt } from '@/services/aiConversation.service'
import { generateInterviewChatResponse } from '@/lib/ai/interviewGroqClient'
import { releaseProcessingLock } from '@/services/interviewSession.service'

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

export function extractJSON(rawText) {
    if (!rawText) throw new Error('Empty AI response')

    // 1. Precise extraction from markdown code blocks if present
    const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonCandidate = codeBlockMatch ? codeBlockMatch[1].trim() : rawText.trim()

    // 2. Find the first occurrence of '{' and the last occurrence of '}'
    const startIndex = jsonCandidate.indexOf('{')
    const endIndex = jsonCandidate.lastIndexOf('}')

    if (startIndex === -1 || endIndex === -1) {
        console.error('[extractJSON] Raw text with no JSON object. Full response:', rawText)
        throw new Error('No valid JSON object found in AI response')
    }

    const cleanedCandidate = jsonCandidate.substring(startIndex, endIndex + 1).trim()

    try {
        return JSON.parse(cleanedCandidate)
    } catch (parseError) {
        console.error('[extractJSON] Parse failed for cleaned candidate:', cleanedCandidate)
        // 3. Last ditch: strip all backticks and try again
        const ultraClean = cleanedCandidate.replace(/`/g, '').trim()
        try {
            return JSON.parse(ultraClean)
        } catch (e) {
            throw new Error(
                `Failed to parse JSON after multiple cleaning attempts: ${parseError.message}`
            )
        }
    }
}

// ── Worker ─────────────────────────────────────────────────────────────────────

export function initInterviewAIWorker() {
    const worker = new Worker(
        'interview-ai',
        async (job) => {
            const {
                sessionId,
                userId,
                content,
                phase,
                submissionVerdict,
                code,
                language: lang,
            } = job.data

            console.log(
                JSON.stringify({
                    event: 'WORKER_JOB_STARTED',
                    jobId: job.id,
                    jobName: job.name,
                    sessionId,
                    timestamp: new Date().toISOString(),
                })
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
                    const aiStream = generateInterviewChatResponse({ systemPrompt, messages })
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

                    const currentSession = await InterviewSession.findById(sessionId)

                    const result = await InterviewResult.findOneAndUpdate(
                        { sessionId },
                        {
                            sessionId,
                            userId,
                            communicationScore: scorecardData.communicationScore || 0,
                            codeQualityScore: scorecardData.codeQualityScore || 0,
                            problemSolvingScore: scorecardData.problemSolvingScore || 0,
                            approachScore: scorecardData.approachScore || 0,
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
                    console.log(
                        `[InterviewAI Worker] Saved result document: ${result._id} for session ${sessionId}`
                    )

                    // Force session status to finalise so the UI doesn't hang in "Pending"
                    await InterviewSession.findByIdAndUpdate(sessionId, {
                        status: ['expired', 'terminated'].includes(currentSession?.status)
                            ? currentSession.status
                            : 'completed',
                        currentPhase: 'completed',
                        finalScore: result.overallScore,
                        endedAt: new Date(),
                    })

                    const pub = await getPublisher()
                    await pub.publish(
                        interviewAIChannel(sessionId),
                        JSON.stringify({ scorecard: result, phase: 'completed', done: true })
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
                phase: currentPhase,
                submissionVerdict: submissionVerdict || null,
                userMessage: content || '',
                history: job.name === 'process-chat' ? history.slice(0, -1) : history, // exclude the just-saved user turn if it was a chat job
                evaluationMetadata,
            })

            // 3. Stream AI response and publish each chunk to Redis
            const pub = await getPublisher()
            const channel = interviewAIChannel(sessionId)
            let fullResponse = ''
            const messageId = job.data.messageId || crypto.randomUUID()
            let sequence = 0

            try {
                if (job.name === 'process-chat') {
                    console.log(
                        JSON.stringify({
                            event: 'AI_STREAM_START',
                            jobId: job.id,
                            sessionId,
                            messageId,
                            timestamp: new Date().toISOString(),
                        })
                    )
                }

                const aiStream = generateInterviewChatResponse({ systemPrompt, messages })

                // If it's a submission analysis, we might want to stream it or just send it at once.
                try {
                    let chunkCount = 0
                    for await (const chunk of aiStream) {
                        fullResponse += chunk
                        chunkCount++

                        // Liveness Guard: Check if session is still active every 10 chunks
                        if (chunkCount % 10 === 0) {
                            const sessionCheck = await InterviewSession.findById(sessionId)
                                .select('status')
                                .lean()
                            if (
                                sessionCheck &&
                                (sessionCheck.status === 'terminated' ||
                                    sessionCheck.status === 'completed')
                            ) {
                                console.log(
                                    `[AI Worker] Session ${sessionId} is ${sessionCheck.status}. Stopping stream.`
                                )
                                break
                            }
                        }

                        if (job.name === 'process-chat') {
                            sequence++
                            await pub.publish(
                                channel,
                                JSON.stringify({
                                    chunk,
                                    done: false,
                                    messageId,
                                    sequence,
                                })
                            )

                            // Persist partial stream to Redis for rehydration, expires in 60s
                            const streamKey = `interview:stream:${sessionId}`
                            await pub.hSet(streamKey, {
                                messageId,
                                content: fullResponse,
                                sequence,
                                lastUpdated: Date.now(),
                            })
                            await pub.expire(streamKey, 60)

                            // Limit log noise: only log if you want every chunk or maybe every 10th chunk
                            // Let's log every chunk as requested
                            console.log(
                                JSON.stringify({
                                    event: 'AI_STREAM_CHUNK',
                                    jobId: job.id,
                                    sessionId,
                                    messageId,
                                    sequence,
                                    timestamp: new Date().toISOString(),
                                })
                            )
                        }
                    }
                } finally {
                    // 4. Finalise
                    if (job.name === 'process-chat') {
                        sequence++
                        await pub.publish(
                            channel,
                            JSON.stringify({
                                chunk: '',
                                done: true,
                                messageId,
                                sequence,
                            })
                        )

                        // Clear the partial stream cache
                        await pub.del(`interview:stream:${sessionId}`)

                        console.log(
                            JSON.stringify({
                                event: 'AI_STREAM_END',
                                jobId: job.id,
                                sessionId,
                                messageId,
                                timestamp: new Date().toISOString(),
                            })
                        )
                    } else {
                        // Emission for submission analysis
                        await pub.publish(channel, JSON.stringify({ analysis: fullResponse }))
                    }
                }

                // [PART 3] Check for Wrap-up signal
                if (fullResponse.includes('<WRAP_UP />')) {
                    const { transitionPhase } = await import('./interviewSession.service')
                    await transitionPhase(sessionId, 'completed')
                    // Signal the frontend room that the session is terminal
                    await pub.publish(
                        channel,
                        JSON.stringify({ terminal: true, status: 'completed' })
                    )
                }

                // 5. Persist the full response to DB
                await InterviewMessage.create({
                    id: messageId, // Standardized ID field
                    sessionId,
                    role: 'ai',
                    phase: currentPhase,
                    content: fullResponse,
                    ts: new Date(),
                })

                // 6. Update session phase if it was a submission
                if (job.name === 'process-submission-analysis') {
                    // Advance to evaluation (feedback) phase using centralized service
                    const { transitionPhase } = await import('./interviewSession.service')
                    await transitionPhase(sessionId, 'evaluation')

                    // b. Emit phase change to client
                    await pub.publish(
                        interviewAIChannel(sessionId),
                        JSON.stringify({ phase: 'evaluation' })
                    )
                }

                // 7. Handle Interactive Phase Transitions (Intro -> QA -> Coding)
                if (job.name === 'process-chat') {
                    const userMessages = history.filter((m) => m.role === 'user')

                    if (session.currentPhase === 'intro') {
                        // Move to QA after the first user greeting
                        const { transitionPhase } = await import('./interviewSession.service')
                        await transitionPhase(sessionId, 'qa')

                        await pub.publish(
                            interviewAIChannel(sessionId),
                            JSON.stringify({ phase: 'qa' })
                        )
                    } else if (session.currentPhase === 'qa') {
                        const qaCount = userMessages.filter((m) => m.phase === 'qa').length
                        if (qaCount >= 2) {
                            // Move to coding after 2 QA turns
                            const { transitionPhase } = await import('./interviewSession.service')
                            await transitionPhase(sessionId, 'coding')

                            await pub.publish(
                                interviewAIChannel(sessionId),
                                JSON.stringify({ phase: 'coding' })
                            )
                        }
                    }
                }

                console.log(
                    JSON.stringify({
                        event: 'WORKER_JOB_COMPLETED',
                        jobId: job.id,
                        jobName: job.name,
                        sessionId,
                        responseLength: fullResponse.length,
                        timestamp: new Date().toISOString(),
                    })
                )

                return { success: true, length: fullResponse.length }
            } catch (err) {
                if (job.name === 'process-chat') {
                    console.log(
                        JSON.stringify({
                            event: 'AI_STREAM_ERROR',
                            jobId: job.id,
                            sessionId,
                            messageId,
                            error: err.message,
                            timestamp: new Date().toISOString(),
                        })
                    )
                }
                throw err
            } finally {
                // Release processing lock if this was a chat job to guarantee cleanup
                if (job.name === 'process-chat') {
                    await releaseProcessingLock(sessionId).catch((err) =>
                        console.error(
                            '[InterviewAI Worker] Failed to release lock on completion/finally:',
                            err
                        )
                    )
                }
            }
        },
        {
            connection,
            concurrency: 5, // Allow 5 parallel interview AI streams
        }
    )

    worker.on('failed', (job, err) => {
        const sessionId = job?.data?.sessionId
        console.error(
            `[InterviewAI Worker] Job ${job?.id} failed for session ${sessionId}:`,
            err.message
        )

        // Best-effort: publish an error chunk so the UI doesn't hang
        if (sessionId) {
            getPublisher()
                .then((pub) =>
                    pub.publish(
                        interviewAIChannel(sessionId),
                        JSON.stringify({
                            chunk: 'Sorry, I encountered an error. Please try again.',
                            done: true,
                            error: 'System error processing AI stream',
                        })
                    )
                )
                .catch(() => {})
                .finally(() => {
                    releaseProcessingLock(sessionId).catch((err) =>
                        console.error('[InterviewAI Worker] Failed to release lock on error:', err)
                    )
                    // Clear the partial stream cache if it errors out
                    getPublisher()
                        .then((pub) => pub.del(`interview:stream:${sessionId}`))
                        .catch(() => {})
                })
        }
    })

    worker.on('error', (err) => {
        console.error('[InterviewAI Worker] Worker error:', err)
    })

    console.log('[InterviewAI Worker] Initialized — listening on queue: interview-ai')
    return worker
}
