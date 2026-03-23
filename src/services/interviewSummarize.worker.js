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
            const { sessionId, fromIndex, toIndex } = job.data

            console.log(`[Summarize Worker] Processing ${sessionId} [${fromIndex} -> ${toIndex}]`)

            const { redisClient } = await import('@/lib/redis')
            const lockKey = `session:summary:lock:${sessionId}`

            // 1. Acquire Lock to prevent overlapping merges
            const acquired = await redisClient.set(lockKey, 'locked', { NX: true, EX: 60 })
            if (!acquired) {
                console.warn(`[Summarize Worker] Skipped ${sessionId} - Lock active`)
                return { skipped: true, reason: 'locked' }
            }

            try {
                await dbConnect()

                // 2. Fetch Messages incrementally
                const messages = await InterviewMessage.find({ sessionId })
                    .sort({ ts: 1 })
                    .skip(fromIndex)
                    .limit(toIndex - fromIndex + 1)

                if (!messages || messages.length === 0) {
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
                const summaryKey = `session:summary:${sessionId}`
                const existingSummary = await redisClient.get(summaryKey)

                const finalSummary = existingSummary
                    ? existingSummary + '\n\n---\n\n' + summaryBlock.trim()
                    : summaryBlock.trim()

                // Save with TTL (8 hours)
                await redisClient.set(summaryKey, finalSummary, { EX: 8 * 60 * 60 })

                console.log(
                    `[Summarize Worker] Successfully summarized ${messages.length} messages. Payload size: ${finalSummary.length} chars`
                )

                return {
                    success: true,
                    messagesSummarized: messages.length,
                    size: finalSummary.length,
                }
            } catch (err) {
                console.error(`[Summarize Worker] Fault: ${err.message}`)
                throw err
            } finally {
                // Release Concurrency Lock
                await redisClient.del(lockKey)
            }
        },
        { connection }
    )

    worker.on('error', (err) => console.error('[Summarize Worker] Error:', err))
    return worker
}
