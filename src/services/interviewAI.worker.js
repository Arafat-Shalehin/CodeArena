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
import { buildPrompt, buildScorecardPrompt } from '@/services/aiConversation.service'
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
                `[InterviewAI Worker] Processing job ${job.id} (${job.name}) for session ${sessionId}`
            )

            await dbConnect()

            // ─── Case 1: Final Scorecard ──────────────────────────────────────
            if (job.name === 'process-scorecard') {
                const [session, history, snapshots] = await Promise.all([
                    InterviewSession.findById(sessionId).populate('problemIds'),
                    InterviewMessage.find({ sessionId }).sort({ ts: 1 }),
                    InterviewSnapshot.find({
                        sessionId,
                        snapshotType: { $in: ['run', 'submit'] },
                    }).sort({ ts: 1 }),
                ])

                const problem = session?.problemIds?.[0]
                if (!problem) throw new Error('Problem context lost')

                // Build prompt
                const { systemPrompt, messages } = buildScorecardPrompt({
                    problemTitle: problem.title,
                    problemDescription: problem.description,
                    history,
                    submissions: snapshots.map((s) => ({
                        verdict: s.snapshotType === 'submit' ? 'SUBMITTED' : 'RUN',
                        // Note: actual pass/fail details would need InterviewSnapshot mod or separate Verdict collection
                        // for now we use what we have in metadata or just role-play
                        passedCount: s.snapshotType === 'submit' ? '?' : '?',
                        totalCount: '?',
                    })),
                })

                // Get AI response (non-streaming)
                const aiStream = generateInterviewChatResponse({ systemPrompt, messages })
                let fullResponse = ''
                for await (const chunk of aiStream) {
                    fullResponse += chunk
                }

                try {
                    const scorecardData = JSON.parse(fullResponse)
                    const result = await InterviewResult.findOneAndUpdate(
                        { sessionId },
                        {
                            sessionId,
                            userId,
                            ...scorecardData,
                            createdAt: new Date(),
                        },
                        { upsify: true, new: true, upsert: true }
                    )

                    const pub = await getPublisher()
                    await pub.publish(
                        interviewAIChannel(sessionId),
                        JSON.stringify({ scorecard: result })
                    )

                    return { success: true, type: 'scorecard' }
                } catch (e) {
                    console.error('[InterviewAI Worker] Scorecard Parse/Save failed:', e)
                    throw e
                }
            }

            // ─── Case 2: Chat / Submission Analysis (Streaming) ───────────────
            // 1. Fetch full context from DB
            const [session, history, lastSnapshot] = await Promise.all([
                InterviewSession.findById(sessionId).populate('problemIds'),
                InterviewMessage.find({ sessionId }).sort({ ts: 1 }).limit(12),
                InterviewSnapshot.findOne({ sessionId }).sort({ ts: -1 }),
            ])

            const problem = session?.problemIds?.[0]
            if (!problem) {
                console.warn(
                    `[InterviewAI Worker] No problem found for session ${sessionId}. Skipping.`
                )
                return { skipped: true }
            }

            // 2. Build a sanitised, phase-aware prompt
            const currentPhase =
                job.name === 'process-submission-analysis'
                    ? 'submitted'
                    : session.currentPhase || phase || 'coding'

            const { systemPrompt, messages } = buildPrompt({
                problemTitle: problem.title,
                problemDescription: problem.description,
                currentCode: code || lastSnapshot?.code || '',
                language: lang || lastSnapshot?.language || 'python',
                phase: currentPhase,
                submissionVerdict: submissionVerdict || null,
                userMessage: content || '',
                history: history.slice(0, -1), // exclude the just-saved user turn if it was a chat job
            })

            // 3. Stream AI response and publish each chunk to Redis
            const pub = await getPublisher()
            const channel = interviewAIChannel(sessionId)
            let fullResponse = ''

            const aiStream = generateInterviewChatResponse({ systemPrompt, messages })

            // If it's a submission analysis, we might want to stream it or just send it at once.
            // Following 'interview:ai_analysis' requirement, we'll stream internally and then emit final.
            for await (const chunk of aiStream) {
                fullResponse += chunk
                // Only stream for chat messages; for analysis, we'll send the full object at the end
                if (job.name === 'process-chat') {
                    await pub.publish(channel, JSON.stringify({ chunk, done: false }))
                }
            }

            // 4. Finalise
            if (job.name === 'process-chat') {
                await pub.publish(channel, JSON.stringify({ chunk: '', done: true }))
            } else {
                // Emission for submission analysis
                await pub.publish(channel, JSON.stringify({ analysis: fullResponse }))
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
            if (
                job.name === 'process-submission-analysis' &&
                session.currentPhase !== 'submitted'
            ) {
                await InterviewSession.findByIdAndUpdate(sessionId, { currentPhase: 'submitted' })
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
                        })
                    )
                )
                .catch(() => {})
        }
    })

    worker.on('error', (err) => {
        console.error('[InterviewAI Worker] Worker error:', err)
    })

    console.log('[InterviewAI Worker] Initialized — listening on queue: interview-ai')
    return worker
}
