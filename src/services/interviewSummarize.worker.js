import { Worker } from 'bullmq'
import { connection } from '@/lib/queue'
import dbConnect from '@/lib/mongodb'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { generateInterviewChatResponse } from '@/lib/ai/interviewGroqClient'
import { MODELS } from '@/services/aiConversation.service'

/**
 * Background worker to compress old interview messages into a dense, token-efficient summary.
 * Triggered automatically by the main interview worker when depth > 20.
 */
export function initInterviewSummarizeWorker() {
    const worker = new Worker(
        'interview-summarize',
        async (job) => {
            const { sessionId, fromId, toId } = job.data

            console.log(`[Summarize Worker] Processing ${sessionId} [${fromId} -> ${toId}]`)

            const { redisClient } = await import('@/lib/redis')
            const lockKey = `session:summary:lock:${sessionId}`
            const cursorKey = `session:summary:cursor:${sessionId}`
            const summaryKey = `session:summary:${sessionId}`

            try {
                // 1. Idempotency Guard: Skip if this range (or a later one) is already processed
                const existingCursor = await redisClient.get(cursorKey)
                if (existingCursor && existingCursor >= toId) {
                    console.log(
                        `[Summarize Worker] Index ${toId} already summarized for ${sessionId}, skipping.`
                    )
                    return { skipped: true, reason: 'already_processed' }
                }

                await dbConnect()

                // 2. Fetch Messages in the specific range
                const messages = await InterviewMessage.find({
                    sessionId,
                    _id: { $gte: fromId, $lte: toId },
                }).sort({ _id: 1 })

                if (!messages || messages.length === 0) {
                    console.warn(
                        `[Summarize Worker] No messages found in range ${fromId} -> ${toId}`
                    )
                    return { skipped: true, reason: 'no_messages' }
                }

                // 3. Build the compression Prompt
                const transcript = messages
                    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
                    .join('\n\n')

                const systemPrompt = `
You are an expert AI summarization engine. Your task is to compress a segment of a technical interview transcript into a highly concise, structured summary.

RULES:
1. MAX 300 words.
2. Structure the summary with bullet points.
3. PRESERVE STRICTLY:
   - What the core algorithmic problem is.
   - Any conceptual mistakes or misunderstandings the candidate expressed.
   - Any specific code implementations or variable scopes discussed.
4. Do NOT include narrative filler. Be direct and technical.
`.trim()

                // 4. Generate with low latency Fast model
                const aiStream = generateInterviewChatResponse({
                    systemPrompt,
                    messages: [
                        { role: 'user', content: `TRANSCRIPT TO SUMMARIZE:\n${transcript}` },
                    ],
                    model: MODELS.FAST,
                    phase: 'summary',
                    jobType: 'interview-summarize',
                })

                let summaryBlock = ''
                for await (const chunk of aiStream) {
                    summaryBlock += chunk
                }

                // 5. Append Merge into existing Redis state
                const existingSummary = await redisClient.get(summaryKey)
                const finalSummary = existingSummary
                    ? existingSummary + '\n\n---\n\n' + summaryBlock.trim()
                    : summaryBlock.trim()

                // Save with TTL (8 hours)
                await redisClient.set(summaryKey, finalSummary, { EX: 8 * 60 * 60 })

                // 6. LATE COMMIT: Only advance cursor after successful persistence
                await redisClient.set(cursorKey, toId, { EX: 24 * 60 * 60 })

                console.log(
                    `[Summarize Worker] Successfully summarized ${messages.length} messages for ${sessionId}. Cursor -> ${toId}`
                )

                return {
                    success: true,
                    messagesSummarized: messages.length,
                    toId,
                }
            } catch (err) {
                console.error(
                    `[Summarize Worker] Fatal processing error for ${sessionId}:`,
                    err.message
                )
                throw err // Trigger BullMQ retry
            } finally {
                // 7. FAIL-SAFE: Always release the mutex lock
                await redisClient.del(lockKey).catch((delErr) => {
                    console.error('[Summarize Worker] Lock release failed:', delErr.message)
                })
            }
        },
        { connection }
    )

    worker.on('error', (err) => console.error('[Summarize Worker] Error:', err))
    return worker
}
