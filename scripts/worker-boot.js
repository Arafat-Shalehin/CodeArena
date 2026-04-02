console.log('[WorkerBoot] Starting CodeArena worker process...')

function parseEnabledWorkers() {
    const raw = (process.env.ENABLED_WORKERS || '').trim()
    if (!raw || raw === '*') return null

    return new Set(
        raw
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean)
    )
}

function isRedisLimitError(error) {
    const message = String(error?.message || error || '')
    return message.includes('ERR max requests limit exceeded')
}

function isRedisConnectionStartupError(error) {
    const message = String(error?.message || error || '').toLowerCase()
    const code = String(error?.code || '').toUpperCase()

    return (
        message.includes('connection timeout') ||
        message.includes('connect timeout') ||
        message.includes('econnrefused') ||
        message.includes('enotfound') ||
        message.includes('socket closed unexpectedly') ||
        code === 'ECONNREFUSED' ||
        code === 'ENOTFOUND' ||
        code === 'ETIMEDOUT'
    )
}

function shouldKeepAliveOnRedisStartupError() {
    return (process.env.DISABLE_WORKERS_ON_REDIS_TIMEOUT || 'true') === 'true'
}

function buildRedisConfig() {
    const redisUrl = process.env.REDIS_URL || ''
    const connectTimeout = parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS || '10000', 10)
    const allowInsecureTls = process.env.REDIS_TLS_INSECURE === 'true'

    if (redisUrl) {
        const isTlsUrl = redisUrl.startsWith('rediss://')
        return {
            url: redisUrl,
            socket: {
                connectTimeout,
                ...(isTlsUrl ? { tls: true } : {}),
                ...(isTlsUrl && allowInsecureTls ? { rejectUnauthorized: false } : {}),
            },
        }
    }

    return {
        socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            connectTimeout,
        },
        password: process.env.REDIS_PASSWORD || undefined,
    }
}

async function canStartWorkersWithCurrentRedisQuota() {
    try {
        const { createClient } = await import('redis')
        const client = createClient(buildRedisConfig())

        await client.connect()
        await client.ping()
        await client.quit()

        return true
    } catch (error) {
        if (isRedisLimitError(error)) {
            console.error(
                '[WorkerBoot] Redis request quota exceeded. Skipping worker startup and keeping container alive.'
            )
            return false
        }

        if (isRedisConnectionStartupError(error) && shouldKeepAliveOnRedisStartupError()) {
            console.error(
                '[WorkerBoot] Redis is unreachable during startup. Skipping worker startup and keeping container alive.'
            )
            console.error(
                '[WorkerBoot] Set DISABLE_WORKERS_ON_REDIS_TIMEOUT=false to fail fast instead.'
            )
            return false
        }

        throw error
    }
}

process.on('uncaughtException', (error) => {
    if (isRedisLimitError(error) || isRedisConnectionStartupError(error)) {
        console.error(
            '[WorkerBoot] Ignoring uncaught Redis startup/runtime error to keep health endpoint alive.'
        )
        return
    }

    console.error('[WorkerBoot] Uncaught exception:', error)
    process.exit(1)
})

process.on('unhandledRejection', (reason) => {
    if (isRedisLimitError(reason) || isRedisConnectionStartupError(reason)) {
        console.error(
            '[WorkerBoot] Ignoring unhandled Redis startup/runtime rejection to keep health endpoint alive.'
        )
        return
    }

    console.error('[WorkerBoot] Unhandled rejection:', reason)
    process.exit(1)
})

async function startWorkers() {
    const canStartWorkers = await canStartWorkersWithCurrentRedisQuota()
    if (!canStartWorkers) {
        return
    }

    const enabledWorkers = parseEnabledWorkers()
    if (enabledWorkers) {
        console.log(
            `[WorkerBoot] Worker filter active via ENABLED_WORKERS: ${Array.from(enabledWorkers).join(', ')}`
        )
    }

    const { initSubmissionWorker } = await import('@/services/submission.worker.js')
    const { initStatsWorker } = await import('@/services/stats.worker.js')
    const { initAIWorker } = await import('@/services/ai.worker.js')
    const { initInterviewAIWorker } = await import('@/services/interviewAI.worker.js')
    const { initInterviewExecutionWorker } = await import('@/services/interviewExecution.worker.js')
    const { initPlagiarismWorker } = await import('@/services/plagiarism.worker.js')
    const { initInterviewSummarizeWorker } = await import('@/services/interviewSummarize.worker.js')

    const maybeInit = (name, initFn) => {
        if (enabledWorkers && !enabledWorkers.has(name)) {
            console.log(`[WorkerBoot] Skipping ${name} worker (not enabled)`)
            return null
        }
        return initFn()
    }

    const workers = {
        submission: maybeInit('submission', initSubmissionWorker),
        stats: maybeInit('stats', initStatsWorker),
        ai: maybeInit('ai', initAIWorker),
        interviewAI: maybeInit('interviewAI', initInterviewAIWorker),
        interviewExecution: maybeInit('interviewExecution', initInterviewExecutionWorker),
        plagiarism: maybeInit('plagiarism', initPlagiarismWorker),
        interviewSummarize: maybeInit('interviewSummarize', initInterviewSummarizeWorker),
    }

    console.log('[WorkerBoot] Workers initialized successfully.')

    let redisLimitGuardTriggered = false
    const autoStopOnRedisLimit = (process.env.AUTO_STOP_ON_REDIS_LIMIT || 'true') === 'true'

    const closeAllWorkers = async () => {
        await Promise.all(
            Object.entries(workers).map(async ([name, worker]) => {
                if (!worker) return
                try {
                    await worker.close()
                    console.log(`[WorkerBoot] Closed ${name} worker`)
                } catch (error) {
                    console.error(`[WorkerBoot] Failed to close ${name} worker:`, error.message)
                }
            })
        )
    }

    const onWorkerError = async (name, error) => {
        console.error(`[WorkerBoot] ${name} worker error:`, error?.message || error)

        if (!autoStopOnRedisLimit || redisLimitGuardTriggered || !isRedisLimitError(error)) {
            return
        }

        redisLimitGuardTriggered = true
        console.error(
            '[WorkerBoot] Upstash Redis request limit reached. Stopping all workers to keep container healthy.'
        )
        await closeAllWorkers()
    }

    Object.entries(workers).forEach(([name, worker]) => {
        if (!worker) return
        worker.on('error', (error) => {
            void onWorkerError(name, error)
        })
    })

    const shutdown = async (signal) => {
        console.log(`[WorkerBoot] Received ${signal}. Shutting down workers...`)

        await closeAllWorkers()

        process.exit(0)
    }

    process.on('SIGINT', () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
}

startWorkers().catch((error) => {
    if (isRedisLimitError(error)) {
        console.error(
            '[WorkerBoot] Redis quota exceeded during startup. Workers are disabled until quota resets.'
        )
        return
    }

    if (isRedisConnectionStartupError(error) && shouldKeepAliveOnRedisStartupError()) {
        console.error(
            '[WorkerBoot] Redis connection failed during startup. Workers are disabled until Redis becomes reachable.'
        )
        return
    }

    console.error('[WorkerBoot] Failed to initialize workers:', error.message)
    console.error(error.stack)
    process.exit(1)
})
