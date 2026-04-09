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
const INTERVIEW_STREAM_PUBLISH_EVERY = Math.max(
    1,
    Number.parseInt(process.env.INTERVIEW_STREAM_PUBLISH_EVERY || '4', 10) || 4
)
const INTERVIEW_STREAM_STATE_WRITE_EVERY = Math.max(
    1,
    Number.parseInt(process.env.INTERVIEW_STREAM_STATE_WRITE_EVERY || '12', 10) || 12
)
const INTERVIEW_STREAM_LIVENESS_CHECK_EVERY = Math.max(
    1,
    Number.parseInt(process.env.INTERVIEW_STREAM_LIVENESS_CHECK_EVERY || '25', 10) || 25
)

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

                    // ─── Participation Data ────────────────────────────────────────────
                    // Compute HARD OVERRIDES before and after calling the AI.
                    // These programmatic constraints cannot be overridden by the AI's output.
                    const qaUserMessages = userMessages.filter((m) => m.phase === 'qa')
                    const hasRealCode =
                        meaningfulSnapshots.length > 0 &&
                        meaningfulSnapshots.some(
                            (s) =>
                                s.code &&
                                s.code.trim().length > 50 &&
                                s.code !== problem.defaultCode?.python &&
                                s.code !== problem.defaultCode?.javascript
                        )
                    const hasSubmission = snapshots.some((s) => s.snapshotType === 'submit')
                    const hasQaParticipation = qaUserMessages.length > 0

                    console.log(
                        JSON.stringify({
                            event: 'SCORECARD_PARTICIPATION_CHECK',
                            sessionId,
                            qaUserMessages: qaUserMessages.length,
                            hasRealCode,
                            hasSubmission,
                            hasQaParticipation,
                            meaningfulSnapshots: meaningfulSnapshots.length,
                        })
                    )

                    // Build scorecard prompt with participation data injected
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
                        participationData: {
                            qaMessagesCount: qaUserMessages.length,
                            codeSubmitted: hasSubmission,
                            codeIsBoilerplate: !hasRealCode,
                            submissionsCount: snapshots.filter((s) => s.snapshotType === 'submit')
                                .length,
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

                    // ─── Programmatic Score Overrides ─────────────────────────────────
                    // Apply hard overrides REGARDLESS of what the AI returned.
                    // These are the source of truth — the AI cannot override them.
                    if (!hasQaParticipation) {
                        scorecardData.communicationScore = 0
                        scorecardData.technicalAccuracyScore = 0
                    }
                    if (!hasRealCode) {
                        scorecardData.codingPerformanceScore = 0
                        scorecardData.problemSolvingScore = 0
                        // Map to schema field names
                        scorecardData.codeQualityScore = 0
                        scorecardData.approachScore = 0
                    }

                    // Recompute overall as weighted average of component scores
                    const comm = scorecardData.communicationScore || 0
                    const coding =
                        scorecardData.codeQualityScore || scorecardData.codingPerformanceScore || 0
                    const solving = scorecardData.problemSolvingScore || 0
                    const accuracy =
                        scorecardData.approachScore || scorecardData.technicalAccuracyScore || 0

                    scorecardData.codeQualityScore = coding
                    scorecardData.approachScore = accuracy
                    scorecardData.problemSolvingScore = solving
                    scorecardData.communicationScore = comm

                    scorecardData.overallScore = Math.round(
                        (comm + coding + solving + accuracy) / 4
                    )

                    console.log(
                        JSON.stringify({
                            event: 'SCORECARD_OVERRIDES_APPLIED',
                            sessionId,
                            hasQaParticipation,
                            hasRealCode,
                            communicationScore: comm,
                            codingScore: coding,
                            solvingScore: solving,
                            accuracyScore: accuracy,
                            overallScore: scorecardData.overallScore,
                        })
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
                            approachScore: scorecardData.approachScore || 0, // This stores 'Technical Accuracy'
                            overallScore: scorecardData.overallScore || 0,
                            aiSummary: scorecardData.aiSummary || '',
                            strengths: scorecardData.strengths || [],
                            weaknesses: scorecardData.weaknesses || [],
                            recommendations: scorecardData.recommendations || [],
                            createdAt: new Date(),
                            error: false,
                        },
                        { upsert: true, new: true }
                    )
                    console.log(
                        `[InterviewAI Worker] Saved result document: ${result._id} for session ${sessionId} with scores:`,
                        {
                            comm: result.communicationScore,
                            code: result.codeQualityScore,
                            solving: result.problemSolvingScore,
                            approach: result.approachScore,
                            overall: result.overallScore,
                        }
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
            let currentPhase = session.currentPhase
            const problem = session.problemIds?.[0]

            // ── Phase transition: intro → qa (must happen BEFORE buildPrompt) ──
            if (job.name === 'process-chat' && currentPhase === 'intro') {
                console.log(
                    JSON.stringify({
                        event: 'PHASE_TRANSITION_TRIGGER',
                        sessionId,
                        from: 'intro',
                        to: 'qa',
                        reason: 'First user message in intro phase',
                    })
                )
                const { transitionPhase } = await import('@/services/interviewSession.service')
                await transitionPhase(sessionId, 'qa')
                console.log(
                    `[InterviewAI Worker] Successfully transitioned session ${sessionId} to 'qa' phase`
                )
                currentPhase = 'qa'

                const pub = await getPublisher()
                await pub.publish(interviewAIChannel(sessionId), JSON.stringify({ phase: 'qa' }))
            }

            // ── Phase transition: coding → evaluation (must happen BEFORE buildPrompt) ──
            // This ensures the evaluation phase system prompt is used for submission analysis,
            // and the frontend receives the phase overlay before Alex starts typing.
            if (job.name === 'process-submission-analysis' && currentPhase === 'coding') {
                console.log(
                    JSON.stringify({
                        event: 'PHASE_TRANSITION_TRIGGER',
                        sessionId,
                        from: 'coding',
                        to: 'evaluation',
                        reason: 'Code submitted — entering evaluation phase',
                    })
                )
                const { transitionPhase } = await import('@/services/interviewSession.service')
                await transitionPhase(sessionId, 'evaluation')
                console.log(
                    `[InterviewAI Worker] Successfully transitioned session ${sessionId} to 'evaluation' phase`
                )
                currentPhase = 'evaluation'

                const pub = await getPublisher()
                await pub.publish(
                    interviewAIChannel(sessionId),
                    JSON.stringify({ phase: 'evaluation' })
                )
            }

            // Inject evaluation metadata: available for intro + qa + evaluation phases
            const evaluationMetadata = ['qa', 'intro', 'evaluation'].includes(currentPhase)
                ? {
                      correctAnswer: problem?.correctAnswer,
                      expectedConcepts: problem?.expectedConcepts,
                      evaluationCriteria: problem?.evaluationCriteria,
                  }
                : null

            const lastSnapshot = await InterviewSnapshot.findOne({ sessionId })
                .sort({ ts: -1 })
                .lean()

            // Build prompt. For submission-analysis jobs, use the submission code/language
            // from the job data rather than falling back to last snapshot.
            const effectiveCode = code || lastSnapshot?.code || ''
            const effectiveLang = lang || lastSnapshot?.language || 'python'

            // For process-chat: exclude the just-saved user message from history passed to
            // buildPrompt (it becomes the 'userMessage' argument instead, avoiding duplication).
            const historyForPrompt = job.name === 'process-chat' ? history.slice(0, -1) : history

            const { systemPrompt, messages } = buildPrompt({
                problemTitle: problem?.title || '',
                problemDescription: problem?.description || '',
                currentCode: effectiveCode,
                language: effectiveLang,
                phase: currentPhase,
                submissionVerdict: submissionVerdict || null,
                userMessage: job.name === 'process-chat' ? content || '' : '',
                history: historyForPrompt,
                evaluationMetadata,
            })

            // 3. Stream AI response and publish each chunk to Redis
            //    Both 'process-chat' and 'process-submission-analysis' stream to the client.
            const pub = await getPublisher()
            const channel = interviewAIChannel(sessionId)
            let fullResponse = ''
            const messageId = job.data.messageId || crypto.randomUUID()
            let sequence = 0
            let pendingChunk = ''

            try {
                const aiStream = generateInterviewChatResponse({ systemPrompt, messages })

                // Chunk loop streams for both process-chat and process-submission-analysis.
                try {
                    let chunkCount = 0
                    for await (const chunk of aiStream) {
                        fullResponse += chunk
                        chunkCount++
                        pendingChunk += chunk

                        // Liveness Guard: Check if session is still active periodically
                        if (chunkCount % INTERVIEW_STREAM_LIVENESS_CHECK_EVERY === 0) {
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

                        sequence++
                        const shouldPublishChunk =
                            sequence % INTERVIEW_STREAM_PUBLISH_EVERY === 0 ||
                            pendingChunk.length >= 300

                        if (shouldPublishChunk && pendingChunk) {
                            await pub.publish(
                                channel,
                                JSON.stringify({
                                    chunk: pendingChunk,
                                    done: false,
                                    messageId,
                                    sequence,
                                })
                            )
                            pendingChunk = ''
                        }

                        // Persist partial stream snapshot less frequently
                        if (sequence % INTERVIEW_STREAM_STATE_WRITE_EVERY === 0) {
                            const streamKey = `interview:stream:${sessionId}`
                            await pub.hSet(streamKey, {
                                messageId,
                                content: fullResponse,
                                sequence,
                                lastUpdated: Date.now(),
                            })
                            await pub.expire(streamKey, 60)
                        }
                    }
                } finally {
                    // Flush remaining pending chunk
                    if (pendingChunk) {
                        sequence++
                        await pub.publish(
                            channel,
                            JSON.stringify({
                                chunk: pendingChunk,
                                done: false,
                                messageId,
                                sequence,
                            })
                        )
                        pendingChunk = ''
                    }

                    // Send the final "done" signal to the client
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
                            jobName: job.name,
                            sessionId,
                            messageId,
                            timestamp: new Date().toISOString(),
                        })
                    )
                }

                // ── POST-STREAM: Wrap-up signal (evaluation → completed) ────────────
                // The evaluation phase AI response must end with <WRAP_UP /> to signal
                // the interview is complete and a scorecard should be generated.
                if (fullResponse.includes('<WRAP_UP />')) {
                    const { transitionPhase } = await import('@/services/interviewSession.service')
                    await transitionPhase(sessionId, 'completed')
                    console.log(
                        `[InterviewAI Worker] Successfully transitioned session ${sessionId} to 'completed' phase via <WRAP_UP />`
                    )
                    await pub.publish(
                        channel,
                        JSON.stringify({ terminal: true, status: 'completed' })
                    )
                }

                // ── POST-STREAM: Persist AI message ────────────────────────────────
                await InterviewMessage.create({
                    id: messageId,
                    sessionId,
                    role: 'ai',
                    phase: currentPhase,
                    content: fullResponse,
                    ts: new Date(),
                })

                // ── POST-STREAM: QA → Coding transition ────────────────────────────
                // Use an authoritative DB count instead of filtering the in-memory
                // history array (which may have stale phase labels from before the
                // intro→qa transition that happened earlier in this same job).
                if (job.name === 'process-chat' && currentPhase === 'qa') {
                    const qaUserCount = await InterviewMessage.countDocuments({
                        sessionId,
                        role: 'user',
                        phase: 'qa',
                    })

                    console.log(
                        JSON.stringify({
                            event: 'PHASE_CHECK_QA',
                            sessionId,
                            qaUserCount,
                            threshold: 2,
                        })
                    )

                    if (qaUserCount >= 2) {
                        console.log(
                            JSON.stringify({
                                event: 'PHASE_TRANSITION_TRIGGER',
                                sessionId,
                                from: 'qa',
                                to: 'coding',
                                reason: `QA user count ${qaUserCount} reached threshold of 2`,
                            })
                        )
                        const { transitionPhase } =
                            await import('@/services/interviewSession.service')
                        await transitionPhase(sessionId, 'coding')
                        console.log(
                            `[InterviewAI Worker] Successfully transitioned session ${sessionId} to 'coding' phase (QA count reached)`
                        )

                        await pub.publish(
                            interviewAIChannel(sessionId),
                            JSON.stringify({ phase: 'coding' })
                        )
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
                console.log(
                    JSON.stringify({
                        event: 'AI_STREAM_ERROR',
                        jobId: job.id,
                        jobName: job.name,
                        sessionId,
                        messageId,
                        error: err.message,
                        timestamp: new Date().toISOString(),
                    })
                )
                throw err
            } finally {
                // Release processing lock for any AI chat job (not scorecard)
                if (job.name === 'process-chat' || job.name === 'process-submission-analysis') {
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
