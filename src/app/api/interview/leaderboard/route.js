import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { InterviewResult } from '@/models/InterviewResult.model'
import '@/models/User.models' // Ensure User model is registered for populate

export async function GET() {
    try {
        await dbConnect()

        // Aggregate top 50 results
        // We want the HIGHEST overallScore per user
        const results = await InterviewResult.aggregate([
            {
                $sort: { overallScore: -1 },
            },
            {
                $group: {
                    _id: '$userId',
                    topScore: { $first: '$overallScore' },
                    resultId: { $first: '$_id' },
                    createdAt: { $first: '$createdAt' },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    name: '$user.name',
                    avatarSeed: '$user.avatarSeed',
                    score: '$topScore',
                    createdAt: 1,
                },
            },
            {
                $sort: { score: -1, createdAt: 1 },
            },
            {
                $limit: 50,
            },
        ])

        return NextResponse.json({
            success: true,
            count: results.length,
            data: results,
        })
    } catch (error) {
        console.error('[Leaderboard API] Error:', error)
        return NextResponse.json({ error: 'SERVER_ERROR', message: error.message }, { status: 500 })
    }
}
