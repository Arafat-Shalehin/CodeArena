import { Problem } from '@/models/Problem.models'
import { TestCase } from '@/models/TestCase.models'
import mongoose from 'mongoose'
import { redisClient } from '@/lib/redis'

/**
 * Fetch paginated list of problems with optional filtering.
 *
 * Responsibilities:
 * - Build MongoDB filter object
 * - Apply pagination
 * - Exclude private fields (testCases)
 * - Return structured pagination metadata
 * @param {Object} query - Query parameters (page, limit, difficulty, search) *
 * @returns {Object} - { problems, total, page, pages }
 */
export async function getAllProblems(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1)
    const limit = Math.min(parseInt(query.limit, 10) || 20, 50)
    const skip = (page - 1) * limit

    // Simple cache key based on query parameters
    const cacheKey = `problem:list:p:${page}:l:${limit}:d:${query.difficulty || 'all'}:s:${query.search || 'none'}:t:${query.tag || 'all'}:st:${query.status || 'all'}:u:${query.userId || 'none'}:sort:${query.sortBy || 'recent'}`

    const isCurated = query.sortBy?.toLowerCase() === 'curated'

    try {
        if (redisClient.isOpen && !isCurated) {
            const cached = await redisClient.get(cacheKey)
            if (cached) {
                console.log(`[Cache Hit] Problem list: ${cacheKey}`)
                return JSON.parse(cached)
            }
        }
    } catch (err) {
        console.error('Redis read error in getAllProblems:', err)
    }

    const filter = {}

    // 1. Difficulty Filter (Supports comma-separated or single)
    if (query.difficulty) {
        const diffs = query.difficulty.split(',')
        filter.difficulty = { $in: diffs }
    }

    // 2. Search by title
    if (query.search) {
        filter.title = { $regex: query.search, $options: 'i' }
    }

    // 3. Tag Filter (Supports comma-separated or single)
    if (query.tag) {
        // Use case-insensitive regex for tags to ensure matching regardless of casing
        const tags = query.tag.split(',').map((t) => new RegExp(`^${t.trim()}$`, 'i'))
        filter.tags = { $in: tags }
    }

    // 4. Status Filter (Solved, Attempted, Unsolved)
    if (query.status && query.userId) {
        const { Submission } = await import('@/models/Submission.models')

        if (query.status === 'solved') {
            const solvedIds = await Submission.find({
                userId: query.userId,
                verdict: { $regex: new RegExp('^ACCEPTED$', 'i') },
            }).distinct('problemId')
            filter._id = { $in: solvedIds }
        } else if (query.status === 'attempted') {
            const allAttempted = await Submission.find({
                userId: query.userId,
            }).distinct('problemId')
            const solvedIds = await Submission.find({
                userId: query.userId,
                verdict: { $regex: new RegExp('^ACCEPTED$', 'i') },
            }).distinct('problemId')

            const attemptedOnly = allAttempted.filter(
                (id) => !solvedIds.some((s) => s.toString() === id.toString())
            )
            filter._id = { $in: attemptedOnly }
        } else if (query.status === 'unsolved') {
            const allAttempted = await Submission.find({
                userId: query.userId,
            }).distinct('problemId')
            filter._id = { $nin: allAttempted }
        }
    }

    // 5. Special Case for Home Page "Curated" Sorting
    if (query.sortBy?.toLowerCase() === 'curated') {
        const curatedPipeline = [
            { $match: filter },
            {
                $facet: {
                    easy: [{ $match: { difficulty: 'easy' } }, { $sample: { size: 2 } }],
                    medium: [{ $match: { difficulty: 'medium' } }, { $sample: { size: 2 } }],
                    hard: [{ $match: { difficulty: 'hard' } }, { $sample: { size: 2 } }],
                },
            },
            { $project: { all: { $concatArrays: ['$easy', '$medium', '$hard'] } } },
            { $unwind: '$all' },
            { $replaceRoot: { newRoot: '$all' } },
            { $sample: { size: 6 } }, // Final shuffle for variety
            {
                $addFields: {
                    acceptanceRate: {
                        $cond: [
                            { $eq: ['$totalSubmissions', 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ['$acceptedSubmissions', '$totalSubmissions'] },
                                    100,
                                ],
                            },
                        ],
                    },
                    numericDifficulty: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$difficulty', 'easy'] }, then: 1 },
                                { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
                                { case: { $eq: ['$difficulty', 'hard'] }, then: 3 },
                            ],
                            default: 2,
                        },
                    },
                },
            },
        ]

        const curatedResults = await Problem.aggregate(curatedPipeline)

        return {
            problems: curatedResults,
            pagination: {
                total: curatedResults.length,
                page: 1,
                limit: curatedResults.length,
                pages: 1,
            },
        }
    }

    // 6. Build Aggregation Pipeline for Sorting and Calculation (Normal Sort)
    const pipeline = [
        { $match: filter },
        {
            $addFields: {
                acceptanceRate: {
                    $cond: [
                        { $eq: ['$totalSubmissions', 0] },
                        0,
                        {
                            $multiply: [
                                { $divide: ['$acceptedSubmissions', '$totalSubmissions'] },
                                100,
                            ],
                        },
                    ],
                },
                numericDifficulty: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$difficulty', 'easy'] }, then: 1 },
                            { case: { $eq: ['$difficulty', 'medium'] }, then: 2 },
                            { case: { $eq: ['$difficulty', 'hard'] }, then: 3 },
                        ],
                        default: 2,
                    },
                },
            },
        },
    ]

    let sortStage = { createdAt: -1 } // Default: Most Recent
    const sortBy = query.sortBy?.toLowerCase()

    if (sortBy === 'difficulty') {
        sortStage = { numericDifficulty: 1, createdAt: -1 }
    } else if (sortBy === 'acceptance rate') {
        sortStage = { acceptanceRate: -1, createdAt: -1 }
    } else if (sortBy === 'frequency') {
        sortStage = { totalSubmissions: -1, createdAt: -1 }
    } else if (sortBy === 'most recent') {
        sortStage = { createdAt: -1 }
    }

    pipeline.push({ $sort: sortStage })

    // 7. Execute Queries
    const [results, totalCount] = await Promise.all([
        Problem.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: limit },
            { $project: { sampleTestCases: 0, specialJudgeCode: 0 } },
        ]),
        Problem.countDocuments(filter),
    ])

    const result = {
        problems: results,
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit),
        },
    }

    try {
        if (redisClient.isOpen && !isCurated) {
            // Cache for 5 minutes
            await redisClient.set(cacheKey, JSON.stringify(result), { EX: 300 })
        }
    } catch (err) {
        console.error('Redis write error in getAllProblems:', err)
    }

    return result
}

/**
 * Fetch a single problem by ID.
 *
 * @param {String} id - MongoDB ObjectId
 * @param {Object} options - Optional flags
 * @param {Boolean} options.includeTestCases - Whether to include test cases
 */
export async function getProblemById(id, { includeTestCases = false } = {}) {
    // Only cache if we are NOT including test cases (public view)
    const cacheKey = includeTestCases ? null : `problem:${id}:detail`

    if (cacheKey) {
        try {
            if (redisClient.isOpen) {
                const cached = await redisClient.get(cacheKey)
                if (cached) {
                    console.log(`[Cache Hit] Problem detail: ${id}`)
                    return JSON.parse(cached)
                }
            }
        } catch (err) {
            console.error('Redis read error in getProblemById:', err)
        }
    }

    const problem = await Problem.findById(id)

    if (!problem) {
        const error = new Error('Problem not found')
        error.status = 404
        throw error
    }

    if (includeTestCases) {
        const testCases = await TestCase.find({ problemId: id }).sort({ order: 1 })
        // Return a plain object with the test cases included
        return {
            ...problem.toObject(),
            testCases,
        }
    }

    if (cacheKey) {
        try {
            if (redisClient.isOpen) {
                // Cache for 10 minutes
                await redisClient.set(cacheKey, JSON.stringify(problem), { EX: 600 })
            }
        } catch (err) {
            console.error('Redis write error in getProblemById:', err)
        }
    }

    return problem
}

/**
 * Create a new problem
 * Validation is primarily handled by Mongoose schema.
 * @param {Object} data - Problem data
 * @returns {Object} - Created problem
 */
export async function createProblem(data) {
    const { testCases, ...problemData } = data

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const problem = await Problem.create([problemData], { session })
        const problemId = problem[0]._id

        if (testCases && testCases.length > 0) {
            const testCaseDocs = testCases.map((tc, index) => ({
                problemId,
                input: tc.input,
                expectedOutput: tc.expectedOutput || tc.output,
                isSample: tc.isSample || false,
                explanation: tc.explanation || '',
                order: tc.order || index,
            }))

            await TestCase.insertMany(testCaseDocs, { session })
            await Problem.findByIdAndUpdate(
                problemId,
                { testCaseCount: testCaseDocs.length },
                { session }
            )
        }

        await session.commitTransaction()

        // Invalidate caches
        if (redisClient.isOpen) {
            try {
                const listKeys = await redisClient.keys(`problem:list:*`)
                if (listKeys.length > 0) await redisClient.del(listKeys)
            } catch (err) {
                console.error('Redis invalidation error in createProblem:', err)
            }
        }

        return problem[0]
    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}

/**
 * Update a problem
 * @param {String} id - Problem ID
 * @param {Object} data - Update data
 * @returns {Object} - Updated problem
 */
export async function updateProblem(id, data) {
    const { testCases, ...problemData } = data

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const problem = await Problem.findByIdAndUpdate(id, problemData, {
            new: true,
            runValidators: true,
            session,
        })

        if (!problem) {
            const error = new Error('Problem not found')
            error.status = 404
            throw error
        }

        if (testCases) {
            // Re-sync strategy: delete all and re-insert
            await TestCase.deleteMany({ problemId: id }, { session })

            if (testCases.length > 0) {
                const testCaseDocs = testCases.map((tc, index) => ({
                    problemId: id,
                    input: tc.input,
                    expectedOutput: tc.expectedOutput || tc.output,
                    isSample: tc.isSample || false,
                    explanation: tc.explanation || '',
                    order: tc.order || index,
                }))

                await TestCase.insertMany(testCaseDocs, { session })
                problem.testCaseCount = testCaseDocs.length
                await problem.save({ session })
            } else {
                problem.testCaseCount = 0
                await problem.save({ session })
            }
        }

        await session.commitTransaction()

        // Invalidate caches
        if (redisClient.isOpen) {
            try {
                const listKeys = await redisClient.keys(`problem:list:*`)
                if (listKeys.length > 0) await redisClient.del(listKeys)
                await redisClient.del(`problem:${id}:detail`)
            } catch (err) {
                console.error('Redis invalidation error in updateProblem:', err)
            }
        }

        return problem
    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}

/**
 * Delete a problem
 * @param {String} id - Problem ID
 * @returns {Object} - Deleted problem
 */
export async function deleteProblem(id) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const problem = await Problem.findByIdAndDelete(id, { session })

        if (!problem) {
            const error = new Error('Problem not found')
            error.status = 404
            throw error
        }

        // Delete associated test cases
        await TestCase.deleteMany({ problemId: id }, { session })

        await session.commitTransaction()

        // Invalidate caches
        if (redisClient.isOpen) {
            try {
                const listKeys = await redisClient.keys(`problem:list:*`)
                if (listKeys.length > 0) await redisClient.del(listKeys)
                await redisClient.del(`problem:${id}:detail`)
            } catch (err) {
                console.error('Redis invalidation error in deleteProblem:', err)
            }
        }

        return problem
    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}
/**
 * Fetch problems grouped by their tags for the explore or admin page.
 * Added to resolve build error.
 */
export async function getProblemsGroupedByTag({ minCount = 1, sampleSize = 3 } = {}) {
    try {
        const results = await Problem.aggregate([
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 },
                    easy: {
                        $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] },
                    },
                    medium: {
                        $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] },
                    },
                    hard: {
                        $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] },
                    },
                    problems: {
                        $push: { _id: '$_id', title: '$title', difficulty: '$difficulty' },
                    },
                },
            },
            { $match: { count: { $gte: minCount } } },
            { $sort: { count: -1 } },
            {
                $project: {
                    tag: '$_id',
                    count: 1,
                    difficulties: {
                        easy: '$easy',
                        medium: '$medium',
                        hard: '$hard',
                    },
                    problems: { $slice: ['$problems', sampleSize] },
                    _id: 0,
                },
            },
        ])
        return results
    } catch (error) {
        console.error('Error in getProblemsGroupedByTag:', error)
        return []
    }
}
