import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required for creating a user.'],
            unique: [true, 'Email already exists.'],
            trim: true,
            lowercase: true,
        },
        username: {
            type: String,
            unique: [true, 'Username already exists.'],
            trim: true,
            lowercase: true,
            sparse: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required for creating a account'],
        },
        password: {
            type: String,
            required: [
                function () {
                    return !this.authProvider || this.authProvider === 'local'
                },
                'Password is required.',
            ],
            minlength: [6, 'Password should be contain more than 6 character.'],
            select: false,
        },
        authProvider: {
            type: String,
            enum: ['local', 'google', 'github', 'firebase'],
            default: 'local',
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'contestant'],
            default: 'user',
        },
        avatarSeed: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        location: {
            type: String,
            default: '',
        },
        country: {
            type: String,
            default: '',
        },
        lastUsernameChange: {
            type: Date,
            default: null,
        },
        website: {
            type: String,
            default: '',
        },
        socials: {
            github: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            twitter: { type: String, default: '' },
        },
        stats: {
            totalSubmissions: { type: Number, default: 0 },
            accepted: { type: Number, default: 0 }, // Unique problems solved
            score: { type: Number, default: 0 },
            globalRank: { type: Number, default: 0 },
            weeklyGoal: { type: Number, default: 10 },
            solvedProblems: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Problem',
                },
            ],
            attemptedProblems: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Problem',
                },
            ],
            solvedDistribution: {
                easy: { type: Number, default: 0 },
                medium: { type: Number, default: 0 },
                hard: { type: Number, default: 0 },
            },
            activityCalendar: {
                type: Map,
                of: Number,
                default: {},
            },
            contestsParticipated: { type: Number, default: 0 },
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        performanceStats: {
            type: Map,
            of: new mongoose.Schema(
                {
                    attempted: { type: Number, default: 0 },
                    solved: { type: Number, default: 0 },
                    failed: { type: Number, default: 0 },
                    uniqueProblems: { type: Number, default: 0 },
                    lastAttemptDate: { type: Date, default: null },
                    recentSolveStreak: { type: Number, default: 0 },
                },
                { _id: false }
            ),
            default: {},
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Number,
            default: 0,
        },
        preferences: {
            type: new mongoose.Schema(
                {
                    language: { type: String, default: 'en' },
                    timezone: { type: String, default: 'UTC' },
                    theme: { type: String, default: 'system' },
                    weeklyGoal: { type: Number, default: 10 },
                },
                { _id: false }
            ),
            default: () => ({
                language: 'en',
                timezone: 'UTC',
                theme: 'system',
                weeklyGoal: 10,
            }),
        },
        notificationSettings: {
            type: new mongoose.Schema(
                {
                    emailSubmissions: { type: Boolean, default: true },
                    emailContests: { type: Boolean, default: true },
                    emailFollowers: { type: Boolean, default: true },
                    emailWeekly: { type: Boolean, default: false },
                    pushSubmissions: { type: Boolean, default: true },
                    pushContests: { type: Boolean, default: true },
                    pushFollowers: { type: Boolean, default: false },
                    notifyAchievements: { type: Boolean, default: true },
                    notifyMentions: { type: Boolean, default: true },
                    notifyComments: { type: Boolean, default: true },
                },
                { _id: false }
            ),
            default: () => ({
                emailSubmissions: true,
                emailContests: true,
                emailFollowers: true,
                emailWeekly: false,
                pushSubmissions: true,
                pushContests: true,
                pushFollowers: false,
                notifyAchievements: true,
                notifyMentions: true,
                notifyComments: true,
            }),
        },
        privacySettings: {
            type: new mongoose.Schema(
                {
                    profileVisibility: {
                        type: String,
                        enum: ['public', 'followers', 'private'],
                        default: 'public',
                    },
                    showStats: { type: Boolean, default: true },
                    showSubmissions: { type: Boolean, default: true },
                    showContestHistory: { type: Boolean, default: true },
                    showFollowers: { type: Boolean, default: true },
                    allowMessaging: { type: Boolean, default: true },
                    indexProfile: { type: Boolean, default: true },
                },
                { _id: false }
            ),
            default: () => ({
                profileVisibility: 'public',
                showStats: true,
                showSubmissions: true,
                showContestHistory: true,
                showFollowers: true,
                allowMessaging: true,
                indexProfile: true,
            }),
        },
        subscription: {
            type: new mongoose.Schema(
                {
                    plan: {
                        type: String,
                        enum: ['free', 'pro', 'teams'],
                        default: 'free',
                    },
                    status: {
                        type: String,
                        enum: ['active', 'cancelled', 'cancelling', 'past_due'],
                        default: 'active',
                    },
                    currentPeriodEnd: { type: Date, default: null },
                    cancelAtPeriodEnd: { type: Boolean, default: false },
                    stripeCustomerId: { type: String, default: null },
                    stripeSubscriptionId: { type: String, default: null },
                },
                { _id: false }
            ),
            default: () => ({
                plan: 'free',
                status: 'active',
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
            }),
        },
    },
    { timestamps: true }
)

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next()
    }
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash

    next()
})

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

// Database indexes for common query patterns (email and name are auto-indexed via unique: true)
userSchema.index({ 'stats.score': -1 }) // For leaderboard sorting
userSchema.index({ 'stats.accepted': -1 }) // For problems solved ranking
userSchema.index({ following: 1 }) // For feed queries (users you follow)
userSchema.index({ followers: 1 }) // For follower queries
userSchema.index({ createdAt: -1 }) // For newest users
userSchema.index({ role: 1 }) // For role-based queries

export const User = mongoose.models.User || mongoose.model('User', userSchema)
