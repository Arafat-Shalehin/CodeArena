import { Contest } from "@/models/contest.models";

/**
 * Helper to validate contest dates
 */
function validateDates(startTime, endTime) {
    if (new Date(startTime) >= new Date(endTime)) {
        throw new Error("Start time must be before end time.");
    }
}

/**
 * Create a new contest
 */
export async function createContest(data) {
    const { title, startTime, endTime } = data;

    if (!title || !startTime || !endTime) {
        throw new Error("Title, start time, and end time are required.");
    }

    validateDates(startTime, endTime);

    // Automatically derive status based on start time
    const now = new Date();
    const status =
        now < new Date(startTime)
            ? "upcoming"
            : now >= new Date(startTime) && now <= new Date(endTime)
                ? "active"
                : "completed";

    const contest = await Contest.create({
        ...data,
        status,
    });

    return contest;
}

/**
 * Get all contests with pagination & optional status filter
 */
export async function getAllContests(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (query.status) filter.status = query.status;

    const contests = await Contest.find(filter)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean(); // lean() for performance

    const total = await Contest.countDocuments(filter);

    return {
        contests,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    };
}

/**
 * Get contest by ID with optional paginated problems
 */
export async function getContestById(id, options = { problemLimit: 50 }) {
    const contest = await Contest.findOne({ _id: id, isDeleted: false });

    if (!contest) throw new Error("Contest not found.");

    // Populate problems if contest is completed (or optionally always for admin)
    if (contest.status === "completed" && contest.problemIds.length > 0) {
        await contest.populate({
            path: "problemIds",
            select: "title difficulty",
            options: { limit: options.problemLimit },
        });
    }

    return contest;
}

/**
 * Update contest
 */
export async function updateContest(id, data) {
    if (data.startTime && data.endTime) validateDates(data.startTime, data.endTime);

    const contest = await Contest.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

    if (!contest) throw new Error("Contest not found.");

    return contest;
}

/**
 * Soft delete contest
 */
export async function deleteContest(id) {
    const contest = await Contest.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );

    if (!contest) throw new Error("Contest not found.");

    return contest;
}
