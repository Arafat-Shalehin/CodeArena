import dbConnect from '@/lib/mongodb'
import { Problem } from '@/models/Problem.models'
import { User } from '@/models/User.models'
import { Contest } from '@/models/Contest.models'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/search?q=query
 * Universal search for problems, users, and contests.
 */
export async function GET(request) {
    try {
        await dbConnect()
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, data: [] })
        }

        const regex = new RegExp(query, 'i')

        // Search in parallel for performance
        const [problems, users, contests] = await Promise.all([
            Problem.find({
                $or: [{ title: regex }, { tags: { $in: [regex] } }],
            })
                .select('title difficulty tags')
                .limit(4)
                .lean(),
            User.find({
                $or: [{ name: regex }, { email: regex }],
            })
                .select('name avatarSeed stats.globalRank')
                .limit(4)
                .lean(),
            Contest.find({
                title: regex,
                isDeleted: false,
            })
                .select('title startTime status')
                .limit(2)
                .lean(),
        ])

        // Format and tag results
        const results = [
            ...problems.map((p) => ({ ...p, type: 'problem' })),
            ...users.map((u) => ({ ...u, type: 'user' })),
            ...contests.map((c) => ({ ...c, type: 'contest' })),
        ]

        return NextResponse.json({
            success: true,
            data: results,
        })
    } catch (error) {
        console.error('[UniversalSearchAPI] Error:', error)
        return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 })
    }
}
