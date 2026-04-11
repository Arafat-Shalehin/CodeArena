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
        // 'run' is for temporary test executions, 'submit' is for actual problem submissions
        type: {
            type: String,
            enum: ['run', 'submit'],
            default: 'submit',
        },
        code: {
            type: String,
            required: [true, 'Need to write some code before try to submit.'],
        },
        customInput: {
            type: String,
            default: '',
        },
        files: [
            {
                filename: { type: String, required: true },
                content: { type: String, required: true },
                isMain: { type: Boolean, default: false },
            },
        ],
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
            // Standardized uppercase verdicts
            enum: [
                'ACCEPTED',
                'EXECUTED',
                'WRONG_ANSWER',
                'TIME_LIMIT_EXCEEDED',
                'MEMORY_LIMIT_EXCEEDED',
                'RUNTIME_ERROR',
                'COMPILATION_ERROR',
                'SYSTEM_ERROR',
                'SECURITY_ERROR',
                'PENDING',
                'JUDGING',
            ],
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        comments: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                text: {
                    type: String,
                    trim: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        executionTime: { type: Number }, // ms
        memoryUsed: { type: Number }, // KB
        error: { type: String }, // Compilation or Runtime error details
        aiFeedback: {
            timeComplexity: { type: String },
            spaceComplexity: { type: String },
            algorithm: { type: String },
            optimal_approach: { type: String },
            verdict_explanation: { type: String },
            strengths: [{ type: String }],
            improvements: [{ type: String }],
            rating: { type: Number },
            code_quality: {
                readability: { type: Number },
                efficiency: { type: Number },
                correctness: { type: Number },
            },
        },
        testCaseResults: [
            {
                testCaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
                verdict: String,
                time: Number,
                memory: Number,
                error: String,
                actualOutput: String, // Only for sample test cases
                isSample: { type: Boolean, default: false },
            },
        ],
    },
    { timestamps: true }
)

submissionSchema.index({ userId: 1, problemId: 1 })
submissionSchema.index({ contestId: 1 })
submissionSchema.index({ createdAt: -1 })

const existingSubmissionModel = mongoose.models.Submission

// In long-lived dev processes, Mongoose can keep an old compiled schema.
// If the cached model is missing newer paths (like comments), recompile it.
if (existingSubmissionModel && !existingSubmissionModel.schema.path('comments')) {
    delete mongoose.models.Submission
}

export const Submission =
    mongoose.models.Submission || mongoose.model('Submission', submissionSchema)
