import mongoose from 'mongoose'

const testCaseSchema = new mongoose.Schema(
    {
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
            index: true,
        },
        input: {
            type: String,
            required: true,
        },
        expectedOutput: {
            type: String,
            required: true,
        },
        isSample: {
            type: Boolean,
            default: false,
        },
        explanation: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
)

// Indexing is handled via index: true in the field definition above

export const TestCase = mongoose.models.TestCase || mongoose.model('TestCase', testCaseSchema)
