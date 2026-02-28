import mongoose from 'mongoose'

const problemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        timeLimit: { type: Number, required: true }, // ms
        memoryLimit: { type: Number, required: true }, // KB
        testCases: [
            {
                input: String,
                output: String,
            },
        ],
        // Searchable topic tags (e.g. ["Array", "Hash Table"])
        tags: {
            type: [String],
            default: [],
        },
        // Submission counters — incremented by the judge on each submission
        totalSubmissions: { type: Number, default: 0 },
        acceptedSubmissions: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        // Expose virtual fields (e.g. acceptanceRate) when converting to JSON/Object
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

/**
 * Virtual: acceptanceRate
 * Computes acceptance % on the fly so we never store stale data.
 * Returns a number rounded to one decimal place (e.g. 67.3).
 */
problemSchema.virtual('acceptanceRate').get(function () {
    if (!this.totalSubmissions || this.totalSubmissions === 0) return 0
    return parseFloat(((this.acceptedSubmissions / this.totalSubmissions) * 100).toFixed(1))
})

export const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema)
