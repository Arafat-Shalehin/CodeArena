import { Queue } from 'bullmq'

// Same env strategy as redis.js — Railway injects REDIS_URL; locally we leave it blank.
const redisUrl = process.env.REDIS_URL || ''

const connection = redisUrl
    ? { url: redisUrl }
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
                timeout: 30000,
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

export { connection }
