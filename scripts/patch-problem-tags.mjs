/**
 * Patch script: Adds algorithm tags to all problems in the database.
 * Also adds tags for problems that didn't have any.
 *
 * Usage: node scripts/patch-problem-tags.mjs
 */
import mongoose from 'mongoose'

const MONGODB_URI =
    'mongodb+srv://CodeArenaAdmin:CSb7y4KBtTSA0kKc@crud-server.b5xdndi.mongodb.net/CodeArena?appName=Crud-Server'

const TAG_MAP = {
    'The Lone Guard': ['Array', 'Bit Manipulation', 'XOR'],
    'Cyclic Symmetry': ['String', 'String Matching'],
    'Zero Terminator': ['Math', 'Number Theory'],
    'Bracket Depth': ['Stack', 'String'],
    'Cargo Distribution': ['Binary Search', 'Greedy', 'Array'],
    'Edit Distance Pro': ['Dynamic Programming', 'String'],
    'Island Architect': ['Graph', 'BFS', 'DFS', 'Matrix'],
    'Optimal Resource Raid': ['Dynamic Programming', 'Knapsack'],
    'Network Latency': ['Graph', 'Shortest Path', 'Dijkstra'],
    'Maximal Empire': ['Dynamic Programming', 'Matrix'],
}

async function main() {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)

    const Problem =
        mongoose.models.Problem ||
        mongoose.model('Problem', new mongoose.Schema({}, { strict: false }))

    for (const [title, tags] of Object.entries(TAG_MAP)) {
        const result = await Problem.updateOne({ title }, { $set: { tags } })
        if (result.matchedCount > 0) {
            console.log(`✅ "${title}" → [${tags.join(', ')}]`)
        } else {
            console.log(`⚠️  Not found: "${title}"`)
        }
    }

    // Verify
    const problems = await Problem.find({}).select('title tags').lean()
    console.log(`\n📊 All problems:`)
    for (const p of problems) {
        console.log(`  ${p.title}: [${(p.tags || []).join(', ')}]`)
    }

    await mongoose.disconnect()
    console.log('\n✅ Done!')
}

main().catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
})
