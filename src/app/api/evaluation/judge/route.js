import dbConnect from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import { judgeSubmission, quickJudge, validateSubmission } from '@/lib/evaluation/judge'
import { protect } from '@/middlewares/auth.middleware'
import { Submission } from '@/models/Submission.models'
import { User } from '@/models/User.models'
import { Problem } from '@/models/Problem.models'
import { Leaderboard } from '@/models/Leaderboard.models'
import { analyzeSubmissionCode } from '@/lib/ai/groqClient'

/**
 * Get points based on problem difficulty
 */
const getPoints = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
        case 'easy':
            return 10
        case 'medium':
            return 20
        case 'hard':
            return 30
        default:
            return 10
    }
}

/**
 * POST /api/evaluation/judge
 * Full evaluation with all test cases and persistence
 */
export async function POST(request) {
    try {
        await dbConnect()

        // Try to authenticate
        let user = null
        try {
            user = await protect(request)
        } catch (authErr) {
            console.warn('Judge route: unauthenticated request (sandbox mode)')
        }

        const body = await request.json()
        const {
            code,
            files,
            language,
            problemId,
            testCases,
            timeLimit,
            memoryLimit,
            comparisonMode = 'token',
            quick = false,
            contestId = null,
        } = body

        // Validate submission
        const validation = validateSubmission({ code, language, problemId })
        if (!validation.isValid) {
            return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 })
        }

        // Run evaluation
        let result
        if (quick) {
            result = await quickJudge({
                code,
                files,
                language,
                testCases: testCases.filter((tc) => !tc.isHidden),
                timeLimit,
                memoryLimit,
                comparisonMode,
            })
        } else {
            result = await judgeSubmission({
                code,
                files,
                language,
                problemId,
                testCases,
                timeLimit,
                memoryLimit,
                comparisonMode,
            })
        }

        // --- PERSISTENCE & STATS UPDATES (Skip for quick judge) ---
        if (!quick && result) {
            const problem = await Problem.findById(problemId)
            const isAccepted = result.verdict === 'ACCEPTED'

            // 1. Update Problem counters
            if (problem) {
                const updateQuery = { $inc: { totalSubmissions: 1 } }
                if (isAccepted) updateQuery.$inc.acceptedSubmissions = 1
                await Problem.findByIdAndUpdate(problemId, updateQuery)
            }

            // 2. Save Submission Record (if user logged in)
            if (user && user.id) {
                const submission = await Submission.create({
                    userId: user.id,
                    problemId: problemId,
                    contestId: contestId,
                    code: code,
                    files: files || [],
                    language: language,
                    status: 'completed',
                    verdict: result.verdict.toLowerCase(),
                    executionTime: result.stats?.executionTime || 0,
                    memoryUsed: result.stats?.maxMemoryUsed || 0,
                    testCaseResults: (result.publicTests?.results || []).map((r) => ({
                        passed: r.passed,
                        verdict: r.verdict,
                        time: r.executionTime,
                        memory: r.memoryUsed,
                    })),
                })

                // 3. Update User Stats
                const userDoc = await User.findById(user.id)
                if (userDoc) {
                    const statsUpdate = {
                        $inc: { 'stats.totalSubmissions': 1 },
                        $addToSet: { 'stats.attemptedProblems': problemId },
                    }

                    if (isAccepted) {
                        statsUpdate.$inc['stats.accepted'] = 1

                        // Only add points if not solved before
                        const alreadySolved = userDoc.stats.solvedProblems.includes(problemId)
                        if (!alreadySolved) {
                            statsUpdate.$addToSet['stats.solvedProblems'] = problemId
                            statsUpdate.$inc['stats.score'] = getPoints(problem?.difficulty)
                        }
                    }

                    // Update performanceStats by tags
                    if (problem?.tags?.length > 0) {
                        problem.tags.forEach((tag) => {
                            const path = `performanceStats.${tag}`
                            if (!userDoc.performanceStats.has(tag)) {
                                userDoc.performanceStats.set(tag, {
                                    attempted: 0,
                                    solved: 0,
                                    failed: 0,
                                    uniqueProblems: 0,
                                })
                            }
                            const current = userDoc.performanceStats.get(tag)
                            current.attempted += 1
                            if (isAccepted) current.solved += 1
                            else current.failed += 1
                            userDoc.performanceStats.set(tag, current)
                        })
                    }

                    await User.findByIdAndUpdate(user.id, statsUpdate)
                    await userDoc.save() // Necessary for Map-based performanceStats
                }

                // 4. Update Leaderboard (if contest)
                if (contestId && isAccepted) {
                    const currentLeaderboard = await Leaderboard.findOne({
                        contestId,
                        userId: user.id,
                    })
                    const points = getPoints(problem?.difficulty)

                    if (currentLeaderboard) {
                        await Leaderboard.findOneAndUpdate(
                            { contestId, userId: user.id },
                            {
                                $inc: { score: points, submissions: 1 },
                                $set: { lastSubmissionAt: new Date() },
                            }
                        )
                    } else {
                        // Create initial leaderboard entry (Simplified: ranking logic usually separate)
                        const count = await Leaderboard.countDocuments({ contestId })
                        await Leaderboard.create({
                            contestId,
                            userId: user.id,
                            score: points,
                            rank: count + 1,
                            submissions: 1,
                            lastSubmissionAt: new Date(),
                        })
                    }
                }
            }
        }

        // --- BACKGROUND AI ANALYSIS ---
        if (
            !quick &&
            result &&
            user &&
            (result.verdict === 'ACCEPTED' || result.verdict === 'TIME_LIMIT_EXCEEDED')
        ) {
            ;(async () => {
                try {
                    const aiFeedback = await analyzeSubmissionCode({
                        code,
                        language,
                        problemTitle: `Problem: ${problemId}`,
                        verdict: result.verdict,
                        executionTime: result.stats?.executionTime || 0,
                        memoryUsed: result.stats?.memoryUsed || 0,
                    })
                    if (aiFeedback) {
                        await Submission.findOneAndUpdate(
                            { userId: user.id, problemId },
                            { $set: { aiFeedback } },
                            { sort: { createdAt: -1 } }
                        )
                    }
                } catch (err) {
                    console.error('AI Fail:', err)
                }
            })()
        }

        return NextResponse.json({ success: true, result })
    } catch (error) {
        console.error('Judge API Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
