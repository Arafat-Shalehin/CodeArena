import dbConnect from '../lib/mongodb.js'
import { redisClient } from '../lib/redis.js'
import { Problem } from '../models/Problem.models.js'
import mongoose from 'mongoose'

/**
 * Reaction Sync Worker
 * This worker reads "dirty" problem IDs from Redis and performs bulk updates to MongoDB.
 */
async function syncReactions() {
    try {
        console.log('--- Starting Reaction Sync ---')
        await dbConnect()

        const redisDirtyKey = 'reactions:dirty_problems'

        // 1. Get all dirty problem IDs and clear the set atomically
        // We use a temporary key to ensure we don't miss any concurrent updates
        const tempKey = `sync:temp:${Date.now()}`
        await redisClient.rename(redisDirtyKey, tempKey).catch(() => null)

        const problemIds = await redisClient.sMembers(tempKey)
        if (problemIds.length === 0) {
            console.log('No dirty problems to sync.')
            return
        }

        console.log(`Syncing ${problemIds.length} problems...`)

        const bulkOps = []

        for (const problemId of problemIds) {
            const redisCountKey = `reactions:problem:${problemId}`
            const countsRaw = await redisClient.zRangeWithScores(redisCountKey, 0, -1)

            const reactionCounts = {}
            countsRaw.forEach(({ value, score }) => {
                reactionCounts[value] = Math.max(0, score)
            })

            bulkOps.push({
                updateOne: {
                    filter: { _id: new mongoose.Types.ObjectId(problemId) },
                    update: { $set: { reactionCounts } },
                },
            })
        }

        // 2. Perform bulk write to MongoDB
        if (bulkOps.length > 0) {
            const result = await Problem.bulkWrite(bulkOps)
            console.log(`Bulk update successful: ${result.modifiedCount} documents updated.`)
        }

        // 3. Cleanup temp key
        await redisClient.del(tempKey)
        console.log('--- Reaction Sync Completed ---')
    } catch (error) {
        console.error('Reaction Sync Error:', error)
    }
}

// If running as a standalone script
if (process.argv[1].endsWith('reactionSyncWorker.js')) {
    syncReactions().then(() => {
        // In a real scenario, this might run in a loop or be called by a scheduler
        process.exit(0)
    })
}

export default syncReactions
