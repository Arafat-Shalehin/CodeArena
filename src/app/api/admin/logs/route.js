import dbConnect from '@/lib/mongodb'
import { asyncHandler } from '@/lib/asyncHandler'
import { protect } from '@/middlewares/auth.middleware'
import { authorize } from '@/middlewares/role.middleware'
import { fetchLogs, createManualLog } from '@/controllers/log.controller'

export const GET = asyncHandler(async (req) => {
    await dbConnect()

    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req)

    return fetchLogs(req)
})

export const POST = asyncHandler(async (req) => {
    await dbConnect()

    const user = await protect(req)
    req.user = user

    await authorize(['admin'])(req)

    return createManualLog(req)
})
