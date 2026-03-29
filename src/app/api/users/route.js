import dbConnect from '@/lib/mongodb'
import { createUser, fetchUsers } from '@/controllers/user.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authorize } from '@/middlewares/role.middleware'
import { protect } from '@/middlewares/auth.middleware'
import { NextResponse } from 'next/server'
import { User } from '@/models/User.models'

export const dynamic = 'force-dynamic'

export const POST = asyncHandler(async (req) => {
    await dbConnect()

    const user = await protect(req)
    req.user = user
    await authorize(['admin'])(req)

    return createUser(req)
})

// export const GET = asyncHandler(async (req) => {
//     await dbConnect()

//     const user = await protect(req)
//     req.user = user

//     await authorize(['admin'])(req)
//     return fetchUsers()
// })

export const GET = asyncHandler(async (req) => {
    await dbConnect()

    // ১. ইউজারকে আইডেন্টিফাই করা
    const userPayload = await protect(req)
    req.user = userPayload

    // ২. রোল চেক করা
    await authorize(['admin'])(req)

    // ৩. সরাসরি ডাটাবেস থেকে ডাটা আনা
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })

    return NextResponse.json({
        success: true,
        data: users,
    })
})
