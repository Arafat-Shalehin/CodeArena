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
        let user = await User.findOne({ email }).lean() // Use lean for easier modification

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
                user = user.toObject()
            } catch (createErr) {
                if (createErr.code === 11000) {
                    user = await User.findOne({ email }).lean()
                } else {
                    throw createErr
                }
            }
        }

        // --- FETCH RECENT SUBMISSIONS & ACTIVITY ---
        const recentSubmissions = await Submission.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('problemId', 'title')
            .lean()

        const mappedSubmissions = recentSubmissions.map((s) => ({
            id: s._id,
            title: s.problemId?.title || 'Unknown Problem',
            status:
                s.verdict === 'accepted'
                    ? 'Accepted'
                    : s.verdict === 'wrong_answer'
                      ? 'Wrong Answer'
                      : s.verdict
                        ? s.verdict.toUpperCase().replace('_', ' ')
                        : 'Failed',
            time: new Date(s.createdAt).toLocaleDateString(),
            lang: s.language === 'python' ? 'Python' : s.language?.toUpperCase() || 'Code',
        }))

        // Simple activity history (count per day/submission)
        const allRecent = await Submission.find({
            userId: user._id,
            createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        })
            .select('createdAt')
            .lean()

        // Attach to user object for frontend consistency
        if (!user.stats) user.stats = {}
        user.stats.recentSubmissions = mappedSubmissions
        user.stats.submissionHistory = allRecent.map((s) => s.createdAt)

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
