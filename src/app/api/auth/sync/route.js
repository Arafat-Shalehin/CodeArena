import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'
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

        if (!user) {
            // Extract a base username from email or displayName if not provided
            let baseUsername = displayName
                ? displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
                : email.split('@')[0].replace(/[^a-z0-9]/g, '')

            // Ensure username is unique
            let existingUser = await User.findOne({ name: baseUsername })
            let counter = 1
            let uniqueName = baseUsername
            while (existingUser) {
                uniqueName = `${baseUsername}${counter++}`
                existingUser = await User.findOne({ name: uniqueName })
            }

            try {
                // Create new user in MongoDB
                user = await User.create({
                    email,
                    name: uniqueName,
                    authProvider: body.authProvider || 'firebase',
                    role: 'user',
                    avatarSeed: photoURL || uniqueName,
                })
            } catch (createErr) {
                if (createErr.code === 11000) {
                    user = await User.findOne({ email })
                } else {
                    throw createErr
                }
            }
        }

        // --- AUTH BRIDGE: Issue JWT for our protected APIs ---
        const token = signToken({ id: user._id, role: user.role, email: user.email })

        // Return user data and set httpOnly cookie
        return createResponseWithCookie({ success: true, data: { user } }, token)
    } catch (error) {
        console.error('Error in /api/auth/sync:', error)
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred.' },
            { status: 500 }
        )
    }
}
