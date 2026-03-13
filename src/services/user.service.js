import { User } from '@/models/User.models'
import { Submission } from '@/models/Submission.models'
import { Problem } from '@/models/Problem.models'
import { signToken } from '@/lib/jwt'
import { redisClient } from '@/lib/redis'

/**
 * Registers a new user.
 * @param {Object} data - User registration data (name, email, password, role).
 * @returns {Promise<Object>} The created user object (excluding password).
 * @throws {Error} If email already exists or validation fails.
 */
export async function registerUser(data) {
    try {
        const safeData = {
            name: data.name,
            email: data.email,
            password: data.password,
            role: 'user',
        }

        const user = await User.create(safeData)

        return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        }
    } catch (error) {
        if (error.code === 11000) {
            const err = new Error('Email already exists.')
            err.status = 400
            throw err
        }
        throw error
    }
}

/**
 * Authenticates a user.
 * @param {string} email - User email.
 * @param {string} password - User password.
 * @returns {Promise<Object>} Object containing auth token and user details.
 * @throws {Error} If credentials are invalid.
 */
export async function loginUser(email, password) {
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        const err = new Error('User not found')
        err.status = 401
        throw err
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000))
        const err = new Error(
            `Account is temporarily locked. Please try again in ${remainingMinutes} minutes.`
        )
        err.status = 403
        throw err
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
        // Increment failed attempts
        user.loginAttempts += 1

        // Lock account if threshold reached
        if (user.loginAttempts >= 5) {
            user.lockUntil = Date.now() + 15 * 60 * 1000 // 15 minutes lock
        }

        await user.save()

        const err = new Error(
            user.loginAttempts >= 5
                ? 'Account locked due to multiple failed attempts. Please try again in 15 minutes.'
                : 'Invalid credentials.'
        )
        err.status = 401
        throw err
    }

    // Reset attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil > 0) {
        user.loginAttempts = 0
        user.lockUntil = 0
        await user.save()
    }

    const token = signToken({
        id: user._id,
        role: user.role,
    })

    return {
        token,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    }
}

/**
 * Retrieves all users.
 * @returns {Promise<Array>} List of all users.
 */
export async function getAllUsers() {
    return User.find().select('-password')
}

/**
 * Retrieves a user by ID.
 * @param {string} id - User ID.
 * @returns {Promise<Object>} User object.
 * @throws {Error} If user is not found.
 */
export async function getUserById(id) {
    const cacheKey = `user:${id}:profile`

    try {
        if (redisClient.isOpen) {
            const cachedUser = await redisClient.get(cacheKey)
            if (cachedUser) {
                console.log(`[Cache Hit] User profile: ${id}`)
                return JSON.parse(cachedUser)
            }
        }
    } catch (err) {
        console.error('Redis read error in getUserById:', err)
    }

    const user = await User.findById(id).select('-password')
    if (!user) {
        const err = new Error('User not found')
        err.status = 404
        throw err
    }

    try {
        if (redisClient.isOpen) {
            await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 }) // 1 hour
        }
    } catch (err) {
        console.error('Redis write error in getUserById:', err)
    }

    return user
}

/**
 * Deletes a user by ID.
 * @param {string} id - User ID.
 * @returns {Promise<Object>} The deleted user object.
 * @throws {Error} If user is not found.
 */
export async function deleteUser(id) {
    const user = await User.findByIdAndDelete(id)
    if (!user) {
        const err = new Error('User not found')
        err.status = 404
        throw err
    }

    // Invalidate cache
    if (redisClient.isOpen) {
        await redisClient.del(`user:${id}:profile`).catch(console.error)
    }

    return user
}

/**
 * Updates a user's profile.
 * @param {string} id - User ID.
 * @param {Object} updateData - Data to update (e.g., bio, location, website, socials).
 * @returns {Promise<Object>} The updated user object.
 * @throws {Error} If user is not found.
 */
export async function updateUser(id, updateData) {
    // Only allow updating specific profile fields to prevent privilege escalation
    const allowedFields = ['name', 'bio', 'location', 'website', 'socials', 'avatarSeed']
    const safeData = {}

    console.log('updateUser called with:', { id, updateData, allowedFields })

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            safeData[field] = updateData[field]
        }
    }

    console.log('safeData to update:', safeData)

    const user = await User.findByIdAndUpdate(
        id,
        { $set: safeData },
        { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
        const err = new Error('User not found')
        err.status = 404
        throw err
    }

    // Invalidate cache
    if (redisClient.isOpen) {
        await redisClient.del(`user:${id}:profile`).catch(console.error)
    }

    console.log('Updated user:', user)
    return user
}

/**
 * Toggles follow/unfollow status between two users.
 * @param {string} currentUserId - The ID of the primary user doing the following.
 * @param {string} targetUserId - The ID of the user being followed/unfollowed.
 * @returns {Promise<Object>} An object with the new status and updated user data.
 */
export async function toggleFollowUser(currentUserId, targetUserId) {
    if (currentUserId === targetUserId) {
        const err = new Error('You cannot follow yourself.')
        err.status = 400
        throw err
    }

    // Double-check both users exist
    const [currentUser, targetUser] = await Promise.all([
        User.findById(currentUserId),
        User.findById(targetUserId),
    ])

    if (!currentUser || !targetUser) {
        const err = new Error('User not found.')
        err.status = 404
        throw err
    }

    const isFollowing = currentUser.following.includes(targetUserId)

    if (isFollowing) {
        // Unfollow
        const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
            User.findByIdAndUpdate(
                currentUserId,
                { $pull: { following: targetUserId } },
                { new: true }
            ),
            User.findByIdAndUpdate(
                targetUserId,
                { $pull: { followers: currentUserId } },
                { new: true }
            ),
        ])
        return {
            following: false,
            followersCount: updatedTargetUser.followers.length,
            followingCount: updatedTargetUser.following.length, // Returns target user's stats
        }
    } else {
        // Follow
        const [updatedCurrentUser, updatedTargetUser] = await Promise.all([
            User.findByIdAndUpdate(
                currentUserId,
                { $addToSet: { following: targetUserId } },
                { new: true }
            ),
            User.findByIdAndUpdate(
                targetUserId,
                { $addToSet: { followers: currentUserId } },
                { new: true }
            ),
        ])

        // NEW: Follower Notification
        const { sendNotification } = await import('@/services/notification.service')
        await sendNotification({
            recipientId: targetUserId,
            senderId: currentUserId,
            type: 'social',
            message: `${currentUser.name} started following you! 👤`,
            link: `/profile/${currentUserId}`,
        })

        return {
            following: true,
            followersCount: updatedTargetUser.followers.length,
            followingCount: updatedTargetUser.following.length,
        }
    }
}

/**
 * Re-calculates and synchronizes a user's problem-solving statistics from their submissions.
 * This is the single source of truth for user stats (solved problems, distribution, activity).
 * @param {string} userId - The ID of the user to synchronize.
 * @returns {Promise<Object>} The updated user object.
 */
export async function syncUserStats(userId) {
    const submissions = await Submission.find({ userId }).lean()

    // 1. Total Submissions
    const totalSubmissions = submissions.length

    // 2. Map all problem interactions
    const problemMap = new Map() // problemId -> { isAccepted: boolean, date: string }

    submissions.forEach((sub) => {
        const pId = sub.problemId.toString()
        const verdict = (sub.verdict || '').toUpperCase()
        const isAccepted = verdict === 'ACCEPTED'
        const date = sub.createdAt.toISOString().split('T')[0]

        if (!problemMap.has(pId)) {
            problemMap.set(pId, { isAccepted, dates: new Set([date]), acceptedDates: new Set() })
            if (isAccepted) problemMap.get(pId).acceptedDates.add(date)
        } else {
            const entry = problemMap.get(pId)
            entry.dates.add(date)
            if (isAccepted) {
                entry.isAccepted = true
                entry.acceptedDates.add(date)
            }
        }
    })

    const attemptedProblems = Array.from(problemMap.keys())
    const solvedProblems = Array.from(problemMap.entries())
        .filter(([_, entry]) => entry.isAccepted)
        .map(([pId, _]) => pId)

    const acceptedCount = solvedProblems.length

    // 3. Solved Distribution and Score (Easy, Medium, Hard)
    const solvedDistribution = { easy: 0, medium: 0, hard: 0 }
    let calculatedScore = 0

    if (solvedProblems.length > 0) {
        const problems = await Problem.find({ _id: { $in: solvedProblems } }).select('difficulty')
        const pointsMap = { easy: 10, medium: 20, hard: 50 }

        problems.forEach((p) => {
            const diff = p.difficulty?.toLowerCase() || 'medium'
            if (solvedDistribution[diff] !== undefined) {
                solvedDistribution[diff]++
            }
            // Add points according to difficulty mapping, fallback to medium points
            calculatedScore += pointsMap[diff] || 20
        })
    }
    // 4. Activity Calendar
    // Rule: Increment count for EVERY accepted submission on a given day (not just unique problems)
    const activityCalendar = new Map()
    submissions.forEach((sub) => {
        const verdict = (sub.verdict || '').toUpperCase()
        if (verdict === 'ACCEPTED') {
            const date = sub.createdAt.toISOString().split('T')[0]
            activityCalendar.set(date, (activityCalendar.get(date) || 0) + 1)
        }
    })

    // 5. Performance Stats Per Tag (Crucial for Recommendations)
    const performanceStats = new Map()
    const problemIdsForTags = Array.from(problemMap.keys())
    const problemsWithTags = await Problem.find({ _id: { $in: problemIdsForTags } }).select('tags')
    const problemTagMap = new Map(problemsWithTags.map((p) => [p._id.toString(), p.tags || []]))

    // Sort submissions by date to calculate streaks and last attempt accurately
    const sortedSubmissions = [...submissions].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    )

    sortedSubmissions.forEach((sub) => {
        const pId = sub.problemId.toString()
        const tags = problemTagMap.get(pId) || []
        const verdict = (sub.verdict || '').toUpperCase()
        const isAccepted = verdict === 'ACCEPTED'

        tags.forEach((tag) => {
            if (!performanceStats.has(tag)) {
                performanceStats.set(tag, {
                    attempted: 0,
                    solved: 0,
                    failed: 0,
                    uniqueProblems: new Set(),
                    lastAttemptDate: sub.createdAt,
                    recentSolveStreak: 0,
                })
            }

            const stats = performanceStats.get(tag)
            stats.attempted++
            if (isAccepted) {
                stats.solved++
                stats.recentSolveStreak++
            } else {
                stats.failed++
                stats.recentSolveStreak = 0 // Reset streak on failure
            }

            stats.uniqueProblems.add(pId)
            if (new Date(sub.createdAt) > new Date(stats.lastAttemptDate)) {
                stats.lastAttemptDate = sub.createdAt
            }
        })
    })

    // Convert Set to count for storage
    const finalPerformanceStats = new Map()
    performanceStats.forEach((stats, tag) => {
        finalPerformanceStats.set(tag, {
            ...stats,
            uniqueProblems: stats.uniqueProblems.size,
        })
    })

    // 6. Update User Record
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                'stats.totalSubmissions': totalSubmissions,
                'stats.accepted': acceptedCount,
                'stats.score': calculatedScore,
                'stats.solvedProblems': solvedProblems,
                'stats.attemptedProblems': attemptedProblems,
                'stats.solvedDistribution': solvedDistribution,
                'stats.activityCalendar': Object.fromEntries(activityCalendar),
                performanceStats: finalPerformanceStats,
            },
        },
        { new: true }
    ).select('-password')

    return user
}
