import { Problem } from '@/models/Problem.models'
import { TestCase } from '@/models/TestCase.models'
import mongoose from 'mongoose'

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
        const tags = query.tag.split(',')
        filter.tags = { $in: tags }
    }

    // 4. Status Filter (Solved, Attempted, Unsolved)
    if (query.status && query.userId) {
        const { Submission } = await import('@/models/Submission.models')

        if (query.status === 'solved') {
            const solvedIds = await Submission.find({
                userId: query.userId,
                verdict: 'accepted',
            }).distinct('problemId')
            filter._id = { $in: solvedIds }
        } else if (query.status === 'attempted') {
            const allAttempted = await Submission.find({
                userId: query.userId,
            }).distinct('problemId')
            const solvedIds = await Submission.find({
                userId: query.userId,
                verdict: 'accepted',
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

    // 5. Build Aggregation Pipeline for Sorting and Calculation
    const pipeline = [
        { $match: filter },
        {
            $addFields: {
                // acceptanceRate = (accepted / total) * 100
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
                // numericDifficulty for logical sorting
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

    // 6. Apply Sorting Logic
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

    return {
        problems: results,
        pagination: {
            total: totalCount,
            page,
            limit,
            pages: Math.ceil(totalCount / limit),
        },
    }
}

/**
 * Fetch a single problem by ID.
 *
 * @param {String} id - MongoDB ObjectId
 * @param {Object} options - Optional flags
 * @param {Boolean} options.includeTestCases - Whether to include test cases
 */
export async function getProblemById(id, { includeTestCases = false } = {}) {
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
        return problem
    } catch (error) {
        await session.abortTransaction()
        throw error
    } finally {
        session.endSession()
    }
}
