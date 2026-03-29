// import { NextResponse } from 'next/server'
// import dbConnect from '@/lib/mongodb'
// import { User } from '@/models/User.models'
// import { Submission } from '@/models/Submission.models'
// import { Problem } from '@/models/Problem.models'
// import { signToken } from '@/lib/jwt'
// import { createResponseWithCookie } from '@/lib/cookie'

// export async function POST(request) {
//     try {
//         const body = await request.json()
//         const { uid, email, displayName, photoURL } = body

//         if (!uid || !email) {
//             return NextResponse.json(
//                 { success: false, error: 'Missing required fields (uid, email)' },
//                 { status: 400 }
//             )
//         }

//         await dbConnect()

//         // Check if user already exists
//         let user = await User.findOne({ email })
//             .select(
//                 'name email username bio location website socials avatarSeed stats role performanceStats followers following'
//             )
//             .lean()

//         if (!user) {
//             // ... (user creation logic remains same as restored)
//             let baseUsername = displayName
//                 ? displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
//                 : email.split('@')[0].replace(/[^a-z0-9]/g, '')

//             let existingUser = await User.findOne({ name: baseUsername })
//             let counter = 1
//             let uniqueName = baseUsername
//             while (existingUser) {
//                 uniqueName = `${baseUsername}${counter++}`
//                 existingUser = await User.findOne({ name: uniqueName })
//             }

//             try {
//                 user = await User.create({
//                     email,
//                     name: uniqueName,
//                     authProvider: body.authProvider || 'firebase',
//                     role: 'user',
//                     avatarSeed: photoURL || uniqueName,
//                 })
//                 user = user.toObject()
//             } catch (createErr) {
//                 if (createErr.code === 11000) {
//                     user = await User.findOne({ email }).lean()
//                 } else {
//                     throw createErr
//                 }
//             }
//         }

//         // --- FETCH MINIMAL STATS (Optional) ---
//         if (!user.stats) user.stats = {}

//         // --- AUTH BRIDGE: Issue JWT for our protected APIs ---
//         const token = signToken({ id: user._id, role: user.role, email: user.email })

//         // Return user data and set httpOnly cookie
//         return createResponseWithCookie({ success: true, data: { user } }, token)
//     } catch (error) {
//         console.error('Error in /api/auth/sync:', error)
//         return NextResponse.json(
//             {
//                 success: false,
//                 error: error.message || 'An unexpected error occurred.',
//                 stack: error.stack,
//             },
//             { status: 500 }
//         )
//     }
// }
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { signToken } from '@/lib/jwt'

export async function POST(request) {
    try {
        const body = await request.json()
        const { email, displayName, photoURL } = body

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            )
        }

        await dbConnect()

        // ১. ইউজার ডাটাবেস থেকে খুঁজে বের করা (সর্বশেষ রোল সহ)
        let user = await User.findOne({ email }).select('+role') // নিশ্চিত করুন রোল ফিল্ডটি আসছে

        if (!user) {
            // নতুন ইউজার তৈরির লজিক (আপনার আগের কোড অনুযায়ী)
            let baseUsername = displayName
                ? displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
                : email.split('@')[0].replace(/[^a-z0-9]/g, '')

            user = await User.create({
                email,
                name: baseUsername,
                role: 'user', // ডিফল্ট রোল
                avatarSeed: photoURL || baseUsername,
            })
        }

        // ২. নতুন টোকেন তৈরি (এখানে user.role নিশ্চিতভাবে admin হতে হবে)
        const token = signToken({
            id: user._id,
            role: user.role,
            email: user.email,
        })

        // ৩. কুকি সেট করা (createResponseWithCookie এর বদলে সরাসরি NextResponse ব্যবহার করে দেখুন)
        const response = NextResponse.json({
            success: true,
            data: { user: { ...user.toObject(), role: user.role } },
        })

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // ৭ দিন
        })

        console.log(`Sync Successful: User ${user.email} is logged in as ${user.role}`)
        return response
    } catch (error) {
        console.error('Error in /api/auth/sync:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
