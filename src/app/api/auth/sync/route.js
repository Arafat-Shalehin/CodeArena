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
            // ... (user creation logic remains same as restored)
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

        // --- CALC ACTIVITY CALENDAR (Heatmap) ---
        // If the activityCalendar is empty or missing, compute it from recent submissions
        if (!user.stats) user.stats = {}

        const submissionsLastYear = await Submission.find({
            userId: user._id,
            verdict: 'accepted',
            createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        })
            .select('createdAt')
            .lean()

        // Generate map of date -> count
        const calendarMap = {}
        submissionsLastYear.forEach((sub) => {
            const dateStr = sub.createdAt.toISOString().split('T')[0]
            calendarMap[dateStr] = (calendarMap[dateStr] || 0) + 1
        })

        // Merge computed map into stats for frontend (but don't necessarily persist to User model yet)
        user.stats.activityCalendar = calendarMap

        // --- FETCH RECENT SUBMISSIONS (List) ---
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

        user.stats.recentSubmissions = mappedSubmissions

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
