import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Mock models
const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    performanceStats: {
        type: Map,
        of: new mongoose.Schema(
            { attempted: Number, solved: Number, failed: Number },
            { _id: false }
        ),
        default: {},
    },
    stats: { solvedProblems: [mongoose.Schema.Types.ObjectId] },
})

const problemSchema = new mongoose.Schema(
    {
        title: String,
        difficulty: String,
        tags: [String],
        totalSubmissions: Number,
        acceptedSubmissions: Number,
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

async function run() {
    try {
        console.log('Connecting to MongoDB...')
        await mongoose.connect(
            'mongodb+srv://CodeArenaAdmin:CSb7y4KBtTSA0kKc@crud-server.b5xdndi.mongodb.net/CodeArena?appName=Crud-Server'
        )
        console.log('Connected.')

        const User = mongoose.models.User || mongoose.model('User', userSchema)
        const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema)

        // 1. Create a fake user with weakness in "Graphs" and "Dynamic Programming"
        const testUser = new User({
            email: 'test_recommender@example.com',
            name: 'Test Recommender',
            performanceStats: {
                Graphs: { attempted: 10, solved: 2, failed: 8 }, // 80% fail rate -> Weakness Score = 8 + 0.8*5 = 12
                'Dynamic Programming': { attempted: 5, solved: 1, failed: 4 }, // 80% fail rate -> Score = 4 + 0.8*5 = 8
                Math: { attempted: 20, solved: 18, failed: 2 }, // 10% fail rate -> Score = 2 + 0.1*5 = 2.5
            },
            stats: { solvedProblems: [] },
        })
        await testUser.save()
        console.log('Created test user:', testUser._id)

        // 2. Create some problems with those tags
        const p1 = new Problem({
            title: 'Graph Basics',
            difficulty: 'easy',
            tags: ['Graphs'],
            totalSubmissions: 100,
            acceptedSubmissions: 90,
        })
        const p2 = new Problem({
            title: 'Advanced DP',
            difficulty: 'hard',
            tags: ['Dynamic Programming'],
            totalSubmissions: 50,
            acceptedSubmissions: 5,
        })
        const p3 = new Problem({
            title: 'Math Trick',
            difficulty: 'easy',
            tags: ['Math'],
            totalSubmissions: 200,
            acceptedSubmissions: 190,
        })
        const p4 = new Problem({
            title: 'Graph Traversal',
            difficulty: 'medium',
            tags: ['Graphs'],
            totalSubmissions: 80,
            acceptedSubmissions: 40,
        })
        const p5 = new Problem({ title: 'String parsing', difficulty: 'easy', tags: ['Strings'] })

        await Promise.all([p1.save(), p2.save(), p3.save(), p4.save(), p5.save()])
        console.log('Created test problems.')

        // 3. Run Recommendation Logic (same as API)
        console.log('\n--- Running Recommendation Logic ---')
        let weakTags = []
        if (testUser.performanceStats && testUser.performanceStats.size > 0) {
            const statsArray = Array.from(testUser.performanceStats.entries()).map(
                ([tag, stats]) => {
                    const totalAttempts = stats.attempted || 0
                    const failedCount = stats.failed || 0
                    let weaknessScore = 0
                    if (totalAttempts > 0) {
                        const failRate = failedCount / totalAttempts
                        weaknessScore = failedCount + failRate * 5
                    }
                    return { tag, weaknessScore }
                }
            )

            statsArray.sort((a, b) => b.weaknessScore - a.weaknessScore)
            console.log('Calculated Weakness Scores:', statsArray)
            weakTags = statsArray.slice(0, 3).map((item) => item.tag)
        }

        console.log('Selected Weak Tags:', weakTags)

        const query = { _id: { $nin: testUser.stats.solvedProblems } }
        if (weakTags.length > 0) {
            query.tags = { $in: weakTags }
        }

        let recommendations = await Problem.find(query)
            .select('title difficulty tags')
            .limit(5)
            .lean()

        console.log('\n--- Recommendations Results ---')
        recommendations.forEach((r) => {
            console.log(`- [${r.difficulty.toUpperCase()}] ${r.title} (Tags: ${r.tags.join(', ')})`)
        })

        // Cleanup
        console.log('\nCleaning up db...')
        await User.findByIdAndDelete(testUser._id)
        await Problem.deleteMany({ _id: { $in: [p1._id, p2._id, p3._id, p4._id, p5._id] } })

        console.log('Verification Finished Successfully!')
        process.exit(0)
    } catch (e) {
        console.error(e)
        process.exit(1)
    }
}

run()
