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
import { buildPrompt } from '@/services/aiConversation.service'
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
            const { sessionId, userId, content, phase } = job.data

            console.log(`[InterviewAI Worker] Processing job ${job.id} for session ${sessionId}`)

            await dbConnect()

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
            const { systemPrompt, messages } = buildPrompt({
                problemTitle: problem.title,
                problemDescription: problem.description,
                currentCode: lastSnapshot?.code || '',
                language: lastSnapshot?.language || 'python',
                phase: session.currentPhase || phase || 'coding',
                userMessage: content,
                history: history.slice(0, -1), // exclude the just-saved user turn
            })

            // 3. Stream AI response and publish each chunk to Redis
            const pub = await getPublisher()
            const channel = interviewAIChannel(sessionId)
            let fullResponse = ''

            const aiStream = generateInterviewChatResponse({ systemPrompt, messages })
            for await (const chunk of aiStream) {
                fullResponse += chunk
                // Publish chunk payload as JSON so the subscriber can parse it
                await pub.publish(channel, JSON.stringify({ chunk, done: false }))
            }

            // 4. Publish done signal
            await pub.publish(channel, JSON.stringify({ chunk: '', done: true }))

            // 5. Persist the full response to DB
            await InterviewMessage.create({
                sessionId,
                role: 'ai',
                phase: session.currentPhase || phase || 'coding',
                content: fullResponse,
                ts: new Date(),
            })

            console.log(
                `[InterviewAI Worker] Job ${job.id} complete – ${fullResponse.length} chars streamed for session ${sessionId}`
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
