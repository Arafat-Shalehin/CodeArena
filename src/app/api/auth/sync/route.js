import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
import { Submission } from '@/models/Submission.models'
import { Problem } from '@/models/Problem.models'
import { signToken } from '@/lib/jwt'
import { createResponseWithCookie } from '@/lib/cookie'

export async function POST(request) {
    try {
        const body = await request.json()
        const { uid, email, displayName, photoURL } = body

        if (!uid || !email) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields (uid, email)' },
                { status: 400 }
            )
        }

        await dbConnect()

        // Check if user already exists
        let user = await User.findOne({ email })
            .select(
                'name email username bio location website socials avatarSeed stats role performanceStats followers following'
            )
            .lean()

        if (!user) {
            // Check if name is taken
            let baseUsername = displayName
                ? displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
                : email.split('@')[0].replace(/[^a-z0-9]/g, '')

            let existingUser = await User.findOne({ name: baseUsername })
            let counter = 1
            let uniqueName = baseUsername
            while (existingUser) {
                uniqueName = `${baseUsername}${counter++}`
                existingUser = await User.findOne({ name: uniqueName })
            }

            try {
                const newUser = await User.create({
                    email,
                    name: uniqueName,
                    authProvider: body.authProvider || 'firebase',
                    role: 'user',
                    avatarSeed: photoURL || uniqueName,
                })
                user = newUser.toObject()
            } catch (createErr) {
                if (createErr.code === 11000) {
                    user = await User.findOne({ email }).lean()
                } else {
                    throw createErr
                }
            }
        }

        // --- FETCH MINIMAL STATS (Optional) ---
        if (!user.stats) user.stats = {}

        // --- AUTH BRIDGE: Issue JWT for our protected APIs ---
        const token = signToken({ id: user._id, role: user.role, email: user.email })

        // Return user data and set httpOnly cookie
        return createResponseWithCookie({ success: true, data: { user } }, token)
    } catch (error) {
        console.error('Error in /api/auth/sync:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'An unexpected error occurred.',
                stack: error.stack,
            },
            { status: 500 }
        )
    }
}
