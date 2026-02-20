import mongoose from "mongoose";
import { Submission } from "@/models/Submission.models";
import { User } from "@/models/User.models";
import { Problem } from "@/models/Problem.models";
import { ContestParticipant } from "@/models/ContestParticipant.models";

/**
 * Create a new submission
 */
export async function createSubmission(data) {
    const { userId, problemId, code, language, contestId } = data;

    if (!userId || !problemId) {
        throw new Error("User and problem are required.");
    }

    if (!code || !language) {
        throw new Error("Code and language are required.");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1️⃣ Validate user
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error("User not found.");
        }

        // 2️⃣ Validate problem
        const problem = await Problem.findById(problemId).session(session);
        if (!problem) {
            throw new Error("Problem not found.");
        }

        // 3️⃣ Rate limit (basic DB-based throttle: 3 sec cooldown)
        // Here i will use redis for rate limit later
        const lastSubmission = await Submission.findOne({ userId })
            .sort({ createdAt: -1 })
            .session(session);

        if (
            lastSubmission &&
            Date.now() - new Date(lastSubmission.createdAt).getTime() < 3000
        ) {
            throw new Error("Submission rate limit exceeded. Please wait.");
        }

        // 4️⃣ Contest validation (if provided)
        if (contestId) {
            const contest = await ContestParticipant.findById(contestId).session(session);
            if (!contest) {
                throw new Error("Contest not found.");
            }

            const now = new Date();

            if (contest.startTime && now < contest.startTime) {
                throw new Error("Contest has not started yet.");
            }

            if (contest.endTime && now > contest.endTime) {
                throw new Error("Contest has already ended.");
            }

            // Check participant registration via ContestParticipant collection
            const isRegistered = await ContestParticipant.findOne({
                contestId,
                userId,
            }).session(session);

            if (!isRegistered) {
                throw new Error("User is not registered for this contest.");
            }
        }

        // 5️⃣ Create submission
        const submission = await Submission.create(
            [
                {
                    userId,
                    problemId,
                    contestId,
                    code,
                    language,
                    status: "queued",
                },
            ],
            { session }
        );

        // 6️⃣ Increment user stats atomically
        await User.findByIdAndUpdate(
            userId,
            { $inc: { "stats.totalSubmissions": 1 } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();
        // Here i will push the submissionId to a Message Queue using BullMQ

        return submission[0];
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}

/**
 * Get all submissions (with filtering)
 */
export async function getAllSubmissions(query) {
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.problemId) filter.problemId = query.problemId;
    if (query.userId) filter.userId = query.userId;
    if (query.contestId) filter.contestId = query.contestId;
    if (query.verdict) filter.verdict = query.verdict;
    if (query.status) filter.status = query.status;

    const [submissions, total] = await Promise.all([
        Submission.find(filter)
            .populate("userId", "name email")
            .populate("problemId", "title difficulty")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Submission.countDocuments(filter),
    ]);

    return {
        submissions,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(id) {
    const submission = await Submission.findById(id)
        .populate("userId", "name email")
        .populate("problemId", "title difficulty");

    if (!submission) {
        const err = new Error("Submission not found.");
        err.status = 404;
        throw err;
    }

    return submission;
}
