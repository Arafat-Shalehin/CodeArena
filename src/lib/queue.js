import { Queue } from 'bullmq'

const connection = {
    host:
        process.env.REDIS_HOST || (process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'),
    port: parseInt(process.env.REDIS_PORT || '6379'),
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
}

// Singleton for the submission queue
let submissionQueue

export function getSubmissionQueue() {
    if (!submissionQueue) {
        submissionQueue = new Queue('submission-queue', {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
                removeOnComplete: true,
                removeOnFail: false,
                timeout: 30000, // 30 seconds to prevent hanging
            },
        })
    }
    return submissionQueue
}

export { connection }
