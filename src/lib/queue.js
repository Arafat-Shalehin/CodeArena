import { Queue } from 'bullmq'

const connection = {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
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
            },
        })
    }
    return submissionQueue
}

export { connection }
