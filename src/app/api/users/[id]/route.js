// export const dynamic = 'force-dynamic'
// import dbConnect from '@/lib/mongodb'
// import { NextResponse } from 'next/server'
// import { User } from '@/models/User.models'
// import { fetchUserById, removeUser, updateUserDetails } from '@/controllers/user.controller'
// import { asyncHandler } from '@/lib/asyncHandler'
// import { authorize } from '@/middlewares/role.middleware'
// import { protect } from '@/middlewares/auth.middleware'
// // export const PATCH = asyncHandler(async (req, { params }) => {
// //     await dbConnect()
// //     await protect(req)
// //     await authorize(['admin'])(req)

// //     const { id } = params
// //     const { role } = await req.json()

// //     const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password')
// //     return NextResponse.json({ success: true, data: user })
// // })
// export const PATCH = asyncHandler(async (req, { params }) => {
//     await dbConnect()

//     // ২. ইউজার প্রোটেক্ট করুন এবং রিকোয়েস্টে সেট করুন
//     const authenticatedUser = await protect(req)
//     req.user = authenticatedUser

//     // ৩. অ্যাডমিন কি না চেক করুন
//     await authorize(['admin'])(req)

//     const { id } = params
//     const { role } = await req.json()

//     // ৪. রোল আপডেট করুন
//     const updatedUser = await User.findByIdAndUpdate(
//         id,
//         { role },
//         { new: true, runValidators: true }
//     ).select('-password')

//     if (!updatedUser) {
//         return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
//     }

//     return NextResponse.json({ success: true, data: updatedUser })
// })

// export const GET = asyncHandler(async (req, context) => {
//     await dbConnect()
//     return fetchUserById(req, context)
// })

// export const DELETE = asyncHandler(async (req, context) => {
//     await dbConnect()

//     const user = await protect(req)
//     req.user = user

//     await authorize(['admin'])(req)
//     return removeUser(req, context)
// })

// export const PUT = asyncHandler(async (req, context) => {
//     await dbConnect()

//     // Protect the route - only logged-in users can update profiles
//     const user = await protect(req)
//     req.user = user

//     return updateUserDetails(req, context)
// })
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { fetchUserById, removeUser, updateUserDetails } from '@/controllers/user.controller'
import { asyncHandler } from '@/lib/asyncHandler'
import { authorize } from '@/middlewares/role.middleware'
import { protect } from '@/middlewares/auth.middleware'

export const PATCH = asyncHandler(async (req, { params }) => {
    await dbConnect()

    // ১. অথেন্টিকেশন এবং ইউজার সেটআপ
    const authenticatedUser = await protect(req)
    req.user = authenticatedUser

    // ২. অ্যাডমিন রোল চেক
    await authorize(['admin'])(req)

    // ৩. আইডি এবং রোল বের করা
    // Next.js 15 এ params একটি Promise, তাই await করা নিরাপদ
    const resolvedParams = await params
    const id = resolvedParams.id
    const { role } = await req.json()

    if (!id) {
        return NextResponse.json({ success: false, message: 'User ID is missing' }, { status: 400 })
    }

    // ৪. ডাটাবেস আপডেট
    const updatedUser = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
        return NextResponse.json(
            { success: false, message: 'User not found in database' },
            { status: 404 }
        )
    }

    return NextResponse.json({
        success: true,
        message: 'Role updated successfully',
        data: updatedUser,
    })
})

// বাকি মেথডগুলো (GET, DELETE, PUT) আগের মতোই
export const GET = asyncHandler(async (req, context) => {
    await dbConnect()
    return fetchUserById(req, context)
})

export const DELETE = asyncHandler(async (req, context) => {
    await dbConnect()
    const user = await protect(req)
    req.user = user
    await authorize(['admin'])(req)
    return removeUser(req, context)
})
