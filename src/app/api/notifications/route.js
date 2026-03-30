import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import {
    getUserNotifications,
    markAllAsRead,
    getUnreadCount,
} from '@/services/notification.service'
import { asyncHandler } from '@/lib/asyncHandler'

export const dynamic = 'force-dynamic'

export const GET = asyncHandler(async (req) => {
    const start = Date.now()
    await dbConnect()
    const user = await protect(req)
    if (!user)
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // Optional: count or list
    const limit = searchParams.get('limit')
    const cursor = searchParams.get('cursor')

    if (type === 'count') {
        const count = await getUnreadCount(user._id)
        return NextResponse.json({ success: true, count })
    }

    const [notificationResult, unreadCount] = await Promise.all([
        getUserNotifications(user._id, { limit, cursor }),
        getUnreadCount(user._id),
    ])

    const res = NextResponse.json({
        success: true,
        data: notificationResult.data,
        pagination: notificationResult.pagination,
        unreadCount,
    })
    res.headers.set('x-response-time-ms', String(Date.now() - start))
    return res
})

export const PATCH = asyncHandler(async (req) => {
    await dbConnect()
    const user = await protect(req)
    if (!user)
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    await markAllAsRead(user._id)
    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
})
