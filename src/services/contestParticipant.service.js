import mongoose from "mongoose";
import { ContestParticipant } from "@/models/ContestParticipant.models";
import { Contest } from "@/models/Contest.models";
import { User } from "@/models/User.models";

/**
 * Register a user for a contest
 */
export async function registerUserForContest(contestId, userId) {
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
        throw new Error("Invalid contest ID.");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID.");
    }

    // Validate contest existence
    const contest = await Contest.findById(contestId).lean();
    if (!contest) {
        throw new Error("Contest not found.");
    }

    // Prevent registration if contest completed
    if (contest.status === "completed") {
        throw new Error("Cannot register for a completed contest.");
    }

    // prevent registration after contest start
    if (contest.startTime && contest.startTime < new Date()) {
        throw new Error("Registration closed. Contest already started.");
    }

    // Validate user existence
    const user = await User.findById(userId).lean();
    if (!user) {
        throw new Error("User not found.");
    }

    try {
        const participant = await ContestParticipant.create({
            contestId,
            userId,
        });

        return participant;
    } catch (error) {
        // Handle duplicate registration via unique index
        if (error.code === 11000) {
            throw new Error("User already registered for this contest.");
        }
        throw error;
    }
}

/**
 * Get contest leaderboard (paginated)
 */
export async function getContestParticipants(contestId, query = {}) {
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
        throw new Error("Invalid contest ID.");
    }

    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.min(parseInt(query.limit) || 20, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const filter = { contestId };

    const participants = await ContestParticipant.find(filter)
        .populate("userId", "name email stats")
        .sort({ score: -1, updatedAt: 1 }) // High score first, earliest submission wins tie
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await ContestParticipant.countDocuments(filter);

    return {
        participants,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
}

/**
 * Get specific participant details
 */
export async function getParticipantDetails(contestId, userId) {
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
        throw new Error("Invalid contest ID.");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID.");
    }

    const participant = await ContestParticipant.findOne({
        contestId,
        userId,
    })
        .populate("userId", "name email stats")
        .lean();

    if (!participant) {
        throw new Error("Participant not found.");
    }

    return participant;
}

/**
 * Update participant score (called after submission evaluation)
 */
export async function updateParticipantScore(
    contestId,
    userId,
    scoreIncrement
) {
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
        throw new Error("Invalid contest ID.");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID.");
    }

    if (typeof scoreIncrement !== "number") {
        throw new Error("Score increment must be a number.");
    }

    const participant = await ContestParticipant.findOneAndUpdate(
        { contestId, userId },
        { $inc: { score: scoreIncrement } },
        { new: true }
    );

    if (!participant) {
        throw new Error("Participant not found.");
    }

    return participant;
}

/**
 * Remove participant (admin use)
 */
export async function removeParticipant(contestId, userId) {
    if (!mongoose.Types.ObjectId.isValid(contestId)) {
        throw new Error("Invalid contest ID.");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID.");
    }

    const deleted = await ContestParticipant.findOneAndDelete({
        contestId,
        userId,
    });

    if (!deleted) {
        throw new Error("Participant not found.");
    }

    return true;
}
