import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { getProblemsGroupedByTag } from '@/services/problem.service'

export const dynamic = 'force-dynamic'

/**
 * GET /api/problems/by-tag
 * Returns problems grouped by tag/algorithm with counts and difficulty distribution.
 *
 * Query params:
 *   ?minCount=1  — minimum problems per tag to include
 *   ?sampleSize=3 — number of sample problems per tag
 */
export async function GET(req) {
    try {
        await dbConnect()

        const { searchParams } = new URL(req.url)
        const minCount = parseInt(searchParams.get('minCount') || '1', 10)
        const sampleSize = parseInt(searchParams.get('sampleSize') || '3', 10)

        const tagGroups = await getProblemsGroupedByTag({ minCount, sampleSize })

        return NextResponse.json({
            success: true,
            data: tagGroups,
            total: tagGroups.length,
        })
    } catch (error) {
        console.error('[ProblemsAPI] by-tag error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch problems by tag' },
            { status: 500 }
        )
    }
}
