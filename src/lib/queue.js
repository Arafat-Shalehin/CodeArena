import { Queue } from 'bullmq'

// Same env strategy as redis.js — Railway injects REDIS_URL; locally we leave it blank.
const redisUrl = process.env.REDIS_URL || ''
const isRedisTls = redisUrl.startsWith('rediss://')
const allowInsecureTls = process.env.REDIS_TLS_INSECURE === 'true'

const connection = redisUrl
    ? {
          url: redisUrl,
          ...(isRedisTls
              ? {
                    tls: {
                        ...(allowInsecureTls ? { rejectUnauthorized: false } : {}),
                    },
                }
              : {}),
      }
    : {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
      }

// Singleton for the queues
const queues = {}
/**
 * Get or create a BullMQ queue
 * @param {string} name - The name of the queue
 */
export function getQueue(name) {
    if (!queues[name]) {
        queues[name] = new Queue(name, {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
                // Increased from 30s to 90s (configurable via env)
                // Prevents false retry cycles for complex submissions with many test cases
                timeout: parseInt(process.env.QUEUE_JOB_TIMEOUT_MS || '90000'),
            },
        })
    }
    return queues[name]
}

export function getSubmissionQueue() {
    return getQueue('submission-queue')
}

export function getAIAnalysisQueue() {
    return getQueue('ai-analysis-queue')
}

export function getStatsQueue() {
    return getQueue('stats-queue')
}

/**
 * Queue for processing live interview AI chat messages.
 * Uses a shorter timeout since streaming must be real-time.
 * Only 2 attempts — retrying stale AI turns would confuse the user.
 */
export function getInterviewAIQueue() {
    if (!queues['interview-ai']) {
        queues['interview-ai'] = new Queue('interview-ai', {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: 100,
                removeOnFail: 50,
                timeout: 60000,
            },
        })
    }
    return queues['interview-ai']
}

export function getInterviewExecutionQueue() {
    if (!queues['interview-execution']) {
        queues['interview-execution'] = new Queue('interview-execution', {
            connection,
            defaultJobOptions: {
                attempts: 2,
                removeOnComplete: true,
                removeOnFail: false,
                timeout: 120000, // 2 mins total for multiple test cases
            },
        })
    }
    return queues['interview-execution']
}

export function getPlagiarismQueue() {
    return getQueue('plagiarism-checks')
}

export function getInterviewSummarizeQueue() {
    if (!queues['interview-summarize']) {
        queues['interview-summarize'] = new Queue('interview-summarize', {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000, // Recover from rate limits gracefully
                },
                removeOnComplete: 100,
                removeOnFail: 50,
                timeout: 120000, // 2 mins max
            },
        })
    }
    return queues['interview-summarize']
}

export { connection }
