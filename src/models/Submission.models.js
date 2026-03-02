import mongoose from 'mongoose'

const submissionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Problem',
            required: true,
        },
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contest',
        },
        code: {
            type: String,
            required: [true, 'Need to write some code before try to submit.'],
        },
        language: {
            type: String,
            enum: ['javascript', 'java', 'python', 'cpp'],
            required: true,
        },
        status: {
            type: String,
            enum: ['queued', 'running', 'completed', 'error'],
            default: 'queued',
        },
        verdict: {
            type: String,
            enum: [
                'accepted',
                'wrong_answer',
                'time_limit_exceeded',
                'memory_limit_exceeded',
                'runtime_error',
                'compilation_error',
                'system_error',
                'security_error',
            ],
        },
        executionTime: { type: Number }, // ms
        memoryUsed: { type: Number }, // KB
        error: { type: String }, // Compilation or Runtime error details
        aiFeedback: {
            timeComplexity: { type: String },
            spaceComplexity: { type: String },
            strengths: [{ type: String }],
            improvements: [{ type: String }],
            rating: { type: Number },
        },
    },
    { timestamps: true }
)

submissionSchema.index({ userId: 1, problemId: 1 })
submissionSchema.index({ contestId: 1 })

export const Submission =
    mongoose.models.Submission || mongoose.model('Submission', submissionSchema)
