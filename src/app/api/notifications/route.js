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
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // Optional: count or list

    let user = null
    try {
        user = await protect(req)
    } catch (authError) {
        if (authError?.status !== 401) {
            throw authError
        }
    }

    if (!user) {
        if (type === 'count') {
            return NextResponse.json({ success: true, count: 0 })
        }

        return NextResponse.json({ success: true, data: [] })
    }

    if (type === 'count') {
        const count = await getUnreadCount(user._id)
        return NextResponse.json({ success: true, count })
    }

    const notifications = await getUserNotifications(user._id)
    return NextResponse.json({ success: true, data: notifications })
})

export const PATCH = asyncHandler(async (req) => {
    await dbConnect()
    const user = await protect(req)
    if (!user)
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    await markAllAsRead(user._id)
    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
})
