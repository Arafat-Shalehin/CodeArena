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
        name: {
            type: String,
            required: [true, 'Name is required for creating a account'],
            unique: [true, 'Name already exists.'],
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
            accepted: { type: Number, default: 0 },
            score: { type: Number, default: 0 },
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

export const User = mongoose.models.User || mongoose.model('User', userSchema)
