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
    const limit = Math.min(parseInt(query.limit, 10) || 10, 50) // cap limit
    const skip = (page - 1) * limit

    const filter = {}

    // Filter by difficulty
    if (query.difficulty) {
        filter.difficulty = query.difficulty
    }

    // Search by title (case-insensitive)
    if (query.search) {
        filter.title = { $regex: query.search, $options: 'i' }
    }

    // Filter by tag (e.g. ?tag=Array)
    if (query.tag) {
        filter.tags = { $in: [query.tag] }
    }

    // Filter by status (Solved, Attempted, Unsolved)
    // Requires userId to be passed in the query object
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

            // Attempted but NOT solved
            const attemptedOnly = allAttempted.filter(
                (id) => !solvedIds.some((s) => s.toString() === id.toString())
            )
            filter._id = { $in: attemptedOnly }
        } else if (query.status === 'unsolved') {
            const allAttempted = await Submission.find({
                userId: query.userId,
            }).distinct('problemId')
            filter._id = { $not: { $in: allAttempted } }
        }
    }

    // Running queries in parallel for better performance.
    const [problems, total] = await Promise.all([
        Problem.find(filter)
            .select('-sampleTestCases') // Keep list view light
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Problem.countDocuments(filter),
    ])

    return {
        problems,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
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
