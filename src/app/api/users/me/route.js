import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { protect } from '@/middlewares/auth.middleware'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        await dbConnect()

        const user = await protect(req)
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
        }

        const userData = await User.findById(user._id).select('-password').lean()

        if (!userData) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: userData,
        })
    } catch (error) {
        console.error('Error fetching current user:', error)
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 })
    }
}
