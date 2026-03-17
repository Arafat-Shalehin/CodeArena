/**
 * Interview Execution Worker
 *
 * Responsibility:
 *  - Processes code 'run' and 'submit' jobs from 'interview-execution' queue.
 *  - Interacts with Docker executor.js.
 *  - Publishes results back to Redis for Socket.IO forwarding.
 *  - Updates InterviewSnapshot for submissions.
 */

import { Worker } from 'bullmq'
import { createClient } from 'redis'
import { connection } from '@/lib/queue'
import dbConnect from '@/lib/mongodb'
import { Problem } from '@/models/Problem.models'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { executeCode } from '@/lib/docker/executor'
import { getInterviewAIQueue } from '@/lib/queue'
import { transitionPhase } from '@/services/interviewSession.service'
import { interviewAIChannel } from '@/services/interviewAI.worker'

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
    if (publisher) return publisher
    const client = createClient(redisConfig)
    client.on('error', (err) => console.error('[Execution Worker] Redis pub error:', err))
    await client.connect()
    publisher = client
    return publisher
}

export const interviewExecutionChannel = (sessionId) => `interview:execution:${sessionId}`

const worker = new Worker(
    'interview-execution',
    async (job) => {
        const { sessionId, userId, code, language, problemId, jobType } = job.data
        console.log(
            `[Execution Worker] Processing ${jobType} for user ${userId}, session ${sessionId}`
        )

        try {
            await dbConnect()
            const problem = await Problem.findById(problemId)
            if (!problem) throw new Error('Problem not found')

            let result = null

            if (jobType === 'run') {
                // ── Run Case: Single sample test case ────────────────────────
                const input = problem.sampleTestCases?.[0]?.input || ''
                const expectedOutput = problem.sampleTestCases?.[0]?.output || ''

                result = await executeCode({
                    code,
                    language,
                    input,
                    expectedOutput,
                    timeLimit: problem.timeLimit,
                    memoryLimit: problem.memoryLimit,
                })
            } else {
                // ── Submit Case: Run all test cases ─────────────────────────
                const testCases = [...(problem.sampleTestCases || []), ...(problem.testCases || [])]

                let overallResult = {
                    success: true,
                    verdict: 'SUCCESS',
                    passedCount: 0,
                    totalCount: testCases.length,
                }

                let firstFailure = null
                for (const tc of testCases) {
                    const res = await executeCode({
                        code,
                        language,
                        input: tc.input,
                        expectedOutput: tc.output,
                        timeLimit: problem.timeLimit,
                        memoryLimit: problem.memoryLimit,
                    })

                    if (res.success && res.verdict === 'SUCCESS') {
                        overallResult.passedCount++
                    } else if (!firstFailure) {
                        firstFailure = res
                    }
                }

                if (firstFailure) {
                    overallResult = {
                        ...firstFailure,
                        passedCount: overallResult.passedCount,
                        totalCount: testCases.length,
                    }
                }
                result = overallResult

                // Persist snapshot for submissions
                await InterviewSnapshot.create({
                    sessionId,
                    problemId,
                    language,
                    code,
                    snapshotType: 'submit',
                    verdict: result.verdict,
                    passedCount: result.passedCount,
                    totalCount: result.totalCount,
                    ts: new Date(),
                })

                // b. Trigger AI analysis if submission was processed
                const aiQueue = getInterviewAIQueue()
                await aiQueue.add('process-submission-analysis', {
                    sessionId,
                    userId,
                    submissionVerdict: result,
                    code,
                    lang: language,
                })

                if (result.success && result.verdict === 'SUCCESS') {
                    await transitionPhase(sessionId, 'evaluation')
                    const pub = await getPublisher()
                    await pub.publish(
                        interviewAIChannel(sessionId),
                        JSON.stringify({ phase: 'evaluation' })
                    )
                }
            }

            // Publish result back to Redis
            const pub = await getPublisher()
            await pub.publish(
                interviewExecutionChannel(sessionId),
                JSON.stringify({
                    jobType,
                    result,
                    userId, // Optional: helps client distinguish if needed
                })
            )

            return { success: true }
        } catch (error) {
            console.error(`[Execution Worker] Error in job ${job.id}:`, error)

            // Notify failure via Redis if possible
            const pub = await getPublisher()
            await pub
                .publish(
                    interviewExecutionChannel(sessionId),
                    JSON.stringify({
                        jobType,
                        result: {
                            success: false,
                            verdict: 'SYSTEM_ERROR',
                            error: error.message,
                        },
                    })
                )
                .catch(() => {})

            throw error
        }
    },
    { connection, concurrency: 5 }
)

worker.on('failed', (job, err) => {
    console.error(`[Execution Worker] Job ${job.id} failed:`, err)
})

console.log('[Execution Worker] Started and listening on "interview-execution"')

export default worker
