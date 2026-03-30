import dbConnect from '@/lib/mongodb'
import { Problem } from '@/models/Problem.models'
import { Submission } from '@/models/Submission.models'
import { logger } from '@/lib/logger'

/**
 * @typedef {Object} IndexInfo
 * @property {string} name - Index name
 * @property {string} collection - Collection name
 * @property {Object} fields - Index fields definition
 * @property {Object} options - Index options (unique, sparse, etc.)
 */

/**
 * Index definitions for Problems collection
 * Optimized for filtering, sorting, and searching
 * @type {Array<IndexInfo>}
 */
const PROBLEM_INDEXES = [
    {
        name: 'difficulty_createdAt',
        collection: 'Problem',
        fields: { difficulty: 1, createdAt: -1 },
        options: {
            name: 'difficulty_createdAt_idx',
            background: true,
        },
    },
    {
        name: 'tags_compound',
        collection: 'Problem',
        fields: { tags: 1 },
        options: {
            name: 'tags_idx',
            background: true,
        },
    },
    {
        name: 'text_search',
        collection: 'Problem',
        fields: { title: 'text', description: 'text', tags: 'text' },
        options: {
            name: 'text_search_idx',
            background: true,
            default_language: 'english',
        },
    },
    {
        name: 'difficulty_tags_createdAt',
        collection: 'Problem',
        fields: { difficulty: 1, tags: 1, createdAt: -1 },
        options: {
            name: 'difficulty_tags_createdAt_idx',
            background: true,
        },
    },
    {
        name: 'acceptanceRate_sort',
        collection: 'Problem',
        fields: { acceptanceRate: -1, createdAt: -1 },
        options: {
            name: 'acceptanceRate_idx',
            background: true,
        },
    },
    {
        name: 'totalSubmissions_acceptedSubmissions',
        collection: 'Problem',
        fields: { totalSubmissions: -1, acceptedSubmissions: -1 },
        options: {
            name: 'submissions_idx',
            background: true,
        },
    },
]

/**
 * Index definitions for Submissions collection
 * Optimized for user submission queries and status filtering
 * @type {Array<IndexInfo>}
 */
const SUBMISSION_INDEXES = [
    {
        name: 'userId_verdict_problemId',
        collection: 'Submission',
        fields: { userId: 1, verdict: 1, problemId: 1 },
        options: {
            name: 'userId_verdict_problemId_idx',
            background: true,
        },
    },
    {
        name: 'userId_problemId',
        collection: 'Submission',
        fields: { userId: 1, problemId: 1 },
        options: {
            name: 'userId_problemId_idx',
            background: true,
        },
    },
    {
        name: 'problemId_verdict',
        collection: 'Submission',
        fields: { problemId: 1, verdict: 1 },
        options: {
            name: 'problemId_verdict_idx',
            background: true,
        },
    },
    {
        name: 'contestId_userId',
        collection: 'Submission',
        fields: { contestId: 1, userId: 1 },
        options: {
            name: 'contestId_userId_idx',
            background: true,
        },
    },
    {
        name: 'createdAt_userId',
        collection: 'Submission',
        fields: { createdAt: -1, userId: 1 },
        options: {
            name: 'createdAt_userId_idx',
            background: true,
        },
    },
]

/**
 * Create indexes for a specific collection
 * Handles graceful failures and logging
 *
 * @async
 * @param {Object} model - Mongoose model
 * @param {Array<IndexInfo>} indexes - Index definitions
 * @param {string} collectionName - Human-readable collection name
 * @returns {Promise<Object>} - { created: number, failed: number, errors: Array }
 */
async function createIndexesForCollection(model, indexes, collectionName) {
    const results = {
        created: 0,
        failed: 0,
        errors: [],
        skipped: 0,
    }

    if (!model || !model.collection) {
        results.failed++
        results.errors.push(`Invalid model for collection: ${collectionName}`)
        await logger.database.error(`Invalid model for ${collectionName}`, {
            collectionName,
        })
        return results
    }

    for (const indexDef of indexes) {
        try {
            // Check if index already exists
            const existingIndexes = await model.collection.getIndexes()
            const indexName = indexDef.options.name
            const alreadyExists = Object.keys(existingIndexes).includes(indexName)

            if (alreadyExists) {
                results.skipped++
                continue
            }

            // Create the index
            await model.collection.createIndex(indexDef.fields, indexDef.options)

            results.created++
            await logger.database.info(`Index created: ${collectionName}.${indexName}`, {
                collectionName,
                indexName,
                fields: JSON.stringify(indexDef.fields),
            })
        } catch (error) {
            results.failed++
            results.errors.push(`${indexDef.options.name}: ${error.message}`)

            // Log the error but don't throw - allow other indexes to be created
            await logger.database.warn(
                `Failed to create index: ${collectionName}.${indexDef.options.name}`,
                {
                    collectionName,
                    indexName: indexDef.options.name,
                    error: error.message,
                }
            )
        }
    }

    return results
}

/**
 * Get all indexes for a collection with detailed information
 *
 * @async
 * @param {Object} model - Mongoose model
 * @param {string} collectionName - Human-readable collection name
 * @returns {Promise<Array>} - Array of index information
 */
async function getIndexesInfo(model, collectionName) {
    try {
        if (!model || !model.collection) {
            return []
        }

        const stats = await model.collection.indexInformation()
        return Object.entries(stats).map(([name, info]) => ({
            name,
            collectionName,
            key: info.key,
            size: info.size || 'unknown',
        }))
    } catch (error) {
        await logger.database.warn(`Failed to get index info for ${collectionName}`, {
            collectionName,
            error: error.message,
        })
        return []
    }
}

/**
 * Drop a specific index from a collection
 *
 * @async
 * @param {Object} model - Mongoose model
 * @param {string} indexName - Name of the index to drop
 * @param {string} collectionName - Human-readable collection name
 * @returns {Promise<boolean>} - Success status
 */
async function dropIndex(model, indexName, collectionName) {
    try {
        if (!model || !model.collection) {
            return false
        }

        await model.collection.dropIndex(indexName)
        await logger.database.info(`Index dropped: ${collectionName}.${indexName}`, {
            collectionName,
            indexName,
        })
        return true
    } catch (error) {
        if (error.message.includes('index not found')) {
            // Index doesn't exist, not really an error
            return true
        }

        await logger.database.warn(`Failed to drop index: ${collectionName}.${indexName}`, {
            collectionName,
            indexName,
            error: error.message,
        })
        return false
    }
}

/**
 * Initialize all database indexes
 * Called during application startup
 *
 * @async
 * @returns {Promise<Object>} - Summary of index creation results
 */
export async function setupDatabaseIndexes() {
    const startTime = Date.now()
    const summary = {
        success: false,
        duration: 0,
        collections: [],
        totalCreated: 0,
        totalFailed: 0,
        totalSkipped: 0,
        errors: [],
    }

    try {
        // Ensure database connection
        await dbConnect()

        await logger.database.info('Starting database index setup', {
            timestamp: new Date().toISOString(),
        })

        // Setup Problem indexes
        const problemResults = await createIndexesForCollection(Problem, PROBLEM_INDEXES, 'Problem')

        summary.collections.push({
            name: 'Problem',
            ...problemResults,
        })

        summary.totalCreated += problemResults.created
        summary.totalFailed += problemResults.failed
        summary.totalSkipped += problemResults.skipped

        if (problemResults.errors.length > 0) {
            summary.errors.push(...problemResults.errors.map((e) => `Problem: ${e}`))
        }

        // Setup Submission indexes
        const submissionResults = await createIndexesForCollection(
            Submission,
            SUBMISSION_INDEXES,
            'Submission'
        )

        summary.collections.push({
            name: 'Submission',
            ...submissionResults,
        })

        summary.totalCreated += submissionResults.created
        summary.totalFailed += submissionResults.failed
        summary.totalSkipped += submissionResults.skipped

        if (submissionResults.errors.length > 0) {
            summary.errors.push(...submissionResults.errors.map((e) => `Submission: ${e}`))
        }

        summary.success = summary.totalFailed === 0
        summary.duration = Date.now() - startTime

        await logger.database.info('Database index setup completed', {
            success: summary.success,
            duration: `${summary.duration}ms`,
            created: summary.totalCreated,
            failed: summary.totalFailed,
            skipped: summary.totalSkipped,
        })

        return summary
    } catch (error) {
        summary.duration = Date.now() - startTime
        summary.errors.push(error.message)

        await logger.database.error('Database index setup failed', {
            error: error.message,
            duration: `${summary.duration}ms`,
        })

        return summary
    }
}

/**
 * Get comprehensive index statistics
 * Useful for monitoring and optimization
 *
 * @async
 * @returns {Promise<Object>} - Index statistics for all collections
 */
export async function getIndexStatistics() {
    try {
        await dbConnect()

        const statistics = {
            timestamp: new Date().toISOString(),
            collections: {},
        }

        // Get Problem indexes
        statistics.collections.Problem = await getIndexesInfo(Problem, 'Problem')

        // Get Submission indexes
        statistics.collections.Submission = await getIndexesInfo(Submission, 'Submission')

        return statistics
    } catch (error) {
        await logger.database.error('Failed to get index statistics', {
            error: error.message,
        })

        return {
            timestamp: new Date().toISOString(),
            error: error.message,
        }
    }
}

/**
 * Drop all non-essential indexes from a collection
 * Useful for maintenance operations
 *
 * @async
 * @param {string} collectionName - 'Problem' or 'Submission'
 * @returns {Promise<Object>} - Dropped indexes summary
 */
export async function dropNonEssentialIndexes(collectionName) {
    const summary = {
        collectionName,
        dropped: 0,
        failed: 0,
        errors: [],
    }

    try {
        await dbConnect()

        const model = collectionName === 'Problem' ? Problem : Submission

        // Keep only the most essential indexes
        const essentialIndexNames = ['_id_', 'userId_problemId_idx', 'difficulty_createdAt_idx']

        const indexInfo = await getIndexesInfo(model, collectionName)

        for (const indexData of indexInfo) {
            if (!essentialIndexNames.includes(indexData.name)) {
                const dropped = await dropIndex(model, indexData.name, collectionName)
                if (dropped) {
                    summary.dropped++
                } else {
                    summary.failed++
                    summary.errors.push(`Failed to drop ${indexData.name}`)
                }
            }
        }

        await logger.database.info(`Non-essential indexes dropped from ${collectionName}`, {
            collectionName,
            dropped: summary.dropped,
            failed: summary.failed,
        })

        return summary
    } catch (error) {
        summary.failed++
        summary.errors.push(error.message)

        await logger.database.error(`Failed to drop non-essential indexes from ${collectionName}`, {
            collectionName,
            error: error.message,
        })

        return summary
    }
}

/**
 * Rebuild all indexes for a collection
 * Useful for optimization after bulk operations
 *
 * @async
 * @param {string} collectionName - 'Problem' or 'Submission'
 * @returns {Promise<Object>} - Rebuild operation summary
 */
export async function rebuildIndexes(collectionName) {
    const summary = {
        collectionName,
        success: false,
        duration: 0,
        errors: [],
    }

    const startTime = Date.now()

    try {
        await dbConnect()

        const model = collectionName === 'Problem' ? Problem : Submission
        const indexes = collectionName === 'Problem' ? PROBLEM_INDEXES : SUBMISSION_INDEXES

        if (!model || !model.collection) {
            throw new Error(`Invalid collection: ${collectionName}`)
        }

        // Drop all indexes except _id
        await model.collection.dropAllIndexes()
        await logger.database.info(`All indexes dropped for ${collectionName}`, {
            collectionName,
        })

        // Recreate indexes
        const results = await createIndexesForCollection(model, indexes, collectionName)

        summary.success = results.failed === 0
        summary.duration = Date.now() - startTime

        await logger.database.info(`Indexes rebuilt for ${collectionName}`, {
            collectionName,
            created: results.created,
            failed: results.failed,
            duration: `${summary.duration}ms`,
        })

        return summary
    } catch (error) {
        summary.duration = Date.now() - startTime
        summary.errors.push(error.message)

        await logger.database.error(`Failed to rebuild indexes for ${collectionName}`, {
            collectionName,
            error: error.message,
            duration: `${summary.duration}ms`,
        })

        return summary
    }
}

export default {
    setupDatabaseIndexes,
    getIndexStatistics,
    dropNonEssentialIndexes,
    rebuildIndexes,
}
