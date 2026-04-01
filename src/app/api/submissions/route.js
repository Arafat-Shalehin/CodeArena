export const dynamic = 'force-dynamic'
import dbConnect from '@/lib/mongodb'
import { submitCode, fetchSubmissions } from '@/controllers/submission.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'
import { initSocketServer } from '@/lib/socket-server'

if (process.env.NODE_ENV !== 'production') {
    initSocketServer().catch(console.error)
}

// Initialize workers on module load if in development
let isWorkerInitialized = false
let workerInitPromise = null

async function ensureWorkersInitialized() {
    if (isWorkerInitialized || globalThis._workersInitialized) return
    if (workerInitPromise) return workerInitPromise

    workerInitPromise = (async () => {
        console.log('[API ROUTE] Initializing workers...')
        try {
            const { initSubmissionWorker } = await import('@/services/submission.worker')
            const { initStatsWorker } = await import('@/services/stats.worker')
            const { initAIWorker } = await import('@/services/ai.worker')
            const { initInterviewAIWorker } = await import('@/services/interviewAI.worker')

            initSubmissionWorker()
            initStatsWorker()
            initAIWorker()
            initInterviewAIWorker()
            isWorkerInitialized = true
            globalThis._workersInitialized = true
            console.log('[API ROUTE] >>> Workers Successfully Initialized')
        } catch (err) {
            console.error('[API ROUTE] Failed to initialize workers:', err.message)
            workerInitPromise = null // Reset on failure to allow retry
        }
    })()

    return workerInitPromise
}

// Initialize workers on first request
ensureWorkersInitialized().catch(console.error)

export const POST = asyncHandler(async (req) => {
    // Ensure workers are ready before processing
    await ensureWorkersInitialized()

    await dbConnect()

    const user = await protect(req)

    return submitCode(req, user)
})

export const GET = asyncHandler(async (req) => {
    await dbConnect()

    const user = await protect(req)

    return fetchSubmissions(req, user)
})
