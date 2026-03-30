/**
 * Seed script: Inserts sample contests into the CodeArena MongoDB database.
 *
 * Usage: node scripts/seed-contests.mjs
 *
 * This creates a mix of:
 *  - 3 Upcoming contests (future dates)
 *  - 1 Active/Live contest (happening right now)
 *  - 3 Completed/Past contests (already ended)
 *
 * Each contest references real problems from the database.
 */
import mongoose from 'mongoose'

const MONGODB_URI =
    'mongodb+srv://CodeArenaAdmin:CSb7y4KBtTSA0kKc@crud-server.b5xdndi.mongodb.net/CodeArena?appName=Crud-Server'

// Real problem IDs from the database
const PROBLEM_IDS = [
    '65f1a1b1c1d1e1f1a1b1c1d1', // The Lone Guard (Easy)
    '65f1a1b1c1d1e1f1a1b1c1d2', // Cyclic Symmetry (Easy)
    '65f1a1b1c1d1e1f1a1b1c1d3', // Zero Terminator (Easy)
    '65f1a1b1c1d1e1f1a1b1c1d4', // Bracket Depth (Medium)
    '65f1a1b1c1d1e1f1a1b1c1d5', // Cargo Distribution (Medium)
    '65f1a1b1c1d1e1f1a1b1c1d6', // Edit Distance Pro (Medium)
    '65f1a1b1c1d1e1f1a1b1c1d7', // Island Architect (Medium)
    '65f1a1b1c1d1e1f1a1b1c1d8', // Optimal Resource Raid (Hard)
    '65f1a1b1c1d1e1f1a1b1c1d9', // Network Latency (Hard)
    '65f1a1b1c1d1e1f1a1b1c1e0', // Maximal Empire (Hard)
]

function hoursFromNow(h) {
    return new Date(Date.now() + h * 60 * 60 * 1000)
}
function daysFromNow(d) {
    return new Date(Date.now() + d * 24 * 60 * 60 * 1000)
}
function daysAgo(d) {
    return new Date(Date.now() - d * 24 * 60 * 60 * 1000)
}

const CONTESTS = [
    // ─── Upcoming Contests ──────────────────────────
    {
        title: 'Weekly Challenge #45',
        problemIds: [PROBLEM_IDS[0], PROBLEM_IDS[3], PROBLEM_IDS[7]],
        startTime: daysFromNow(1),
        endTime: new Date(daysFromNow(1).getTime() + 2 * 60 * 60 * 1000), // 2 hours
        status: 'upcoming',
        maxParticipants: 500,
    },
    {
        title: 'Bi-Weekly Contest #8',
        problemIds: [PROBLEM_IDS[1], PROBLEM_IDS[4], PROBLEM_IDS[5], PROBLEM_IDS[8]],
        startTime: daysFromNow(3),
        endTime: new Date(daysFromNow(3).getTime() + 1.5 * 60 * 60 * 1000), // 1.5 hours
        status: 'upcoming',
        maxParticipants: 300,
    },
    {
        title: 'Global Code Cup 2026',
        problemIds: [
            PROBLEM_IDS[2],
            PROBLEM_IDS[5],
            PROBLEM_IDS[6],
            PROBLEM_IDS[8],
            PROBLEM_IDS[9],
        ],
        startTime: daysFromNow(7),
        endTime: new Date(daysFromNow(7).getTime() + 3 * 60 * 60 * 1000), // 3 hours
        status: 'upcoming',
        maxParticipants: null, // Pro event — unlimited
    },

    // ─── Active / Live Contest ───────────────────────
    {
        title: 'Weekend Algorithm Sprint #12',
        problemIds: [PROBLEM_IDS[0], PROBLEM_IDS[2], PROBLEM_IDS[4], PROBLEM_IDS[7]],
        startTime: hoursFromNow(-1), // started 1 hour ago
        endTime: hoursFromNow(2), // ends in 2 hours
        status: 'active',
        maxParticipants: 1000,
    },

    // ─── Completed / Past Contests ──────────────────
    {
        title: 'Weekly Challenge #44',
        problemIds: [PROBLEM_IDS[0], PROBLEM_IDS[1], PROBLEM_IDS[3]],
        startTime: daysAgo(3),
        endTime: new Date(daysAgo(3).getTime() + 2 * 60 * 60 * 1000),
        status: 'completed',
        maxParticipants: 500,
    },
    {
        title: 'Algorithm Sprint #11',
        problemIds: [PROBLEM_IDS[2], PROBLEM_IDS[6], PROBLEM_IDS[8], PROBLEM_IDS[9]],
        startTime: daysAgo(7),
        endTime: new Date(daysAgo(7).getTime() + 2.5 * 60 * 60 * 1000),
        status: 'completed',
        maxParticipants: 800,
    },
    {
        title: 'CodeArena Kickoff Challenge',
        problemIds: [
            PROBLEM_IDS[0],
            PROBLEM_IDS[1],
            PROBLEM_IDS[2],
            PROBLEM_IDS[3],
            PROBLEM_IDS[4],
        ],
        startTime: daysAgo(14),
        endTime: new Date(daysAgo(14).getTime() + 3 * 60 * 60 * 1000),
        status: 'completed',
        maxParticipants: null,
    },
]

async function main() {
    console.log('🔗 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)

    const Contest =
        mongoose.models.Contest ||
        mongoose.model(
            'Contest',
            new mongoose.Schema(
                {
                    title: { type: String, required: true, unique: true },
                    problemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
                    startTime: { type: Date, required: true },
                    endTime: { type: Date, required: true },
                    status: {
                        type: String,
                        enum: ['upcoming', 'active', 'completed'],
                        default: 'upcoming',
                    },
                    isDeleted: { type: Boolean, default: false },
                    maxParticipants: { type: Number, default: null },
                },
                { timestamps: true }
            )
        )

    // Clear existing contests
    const deleteResult = await Contest.deleteMany({})
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing contests`)

    // Insert new contests
    for (const c of CONTESTS) {
        try {
            const doc = await Contest.create(c)
            const statusIcon = c.status === 'active' ? '🔴' : c.status === 'upcoming' ? '🟢' : '⚪'
            console.log(
                `${statusIcon} Created: "${doc.title}" [${doc.status}] — ${doc.problemIds.length} problems`
            )
        } catch (err) {
            if (err.code === 11000) {
                console.log(`⚠️  Skipped (duplicate): "${c.title}"`)
            } else {
                console.error(`❌ Error creating "${c.title}":`, err.message)
            }
        }
    }

    console.log(`\n✅ Done! ${CONTESTS.length} contests seeded.`)
    await mongoose.disconnect()
}

main().catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
})
