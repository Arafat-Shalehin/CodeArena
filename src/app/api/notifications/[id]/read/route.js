import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { protect } from '@/middlewares/auth.middleware'
import { markAsRead } from '@/services/notification.service'
import { asyncHandler } from '@/lib/asyncHandler'

export const dynamic = 'force-dynamic'

export const PATCH = asyncHandler(async (req, { params }) => {
    await dbConnect()

    const user = await protect(req)
    if (!user) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updated = await markAsRead(id, user._id)

    if (!updated) {
        return NextResponse.json(
            { success: false, message: 'Notification not found' },
            { status: 404 }
        )
    }

    return NextResponse.json({ success: true, data: updated })
})
