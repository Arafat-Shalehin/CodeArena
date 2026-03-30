import dbConnect from '@/lib/mongodb'
import { User } from '@/models/User.models'

/**
 * PRODUCTION SAFETY GUARD
 * Prevents accidental feature bypass in production environments.
 */
if (
    process.env.NODE_ENV === 'production' &&
    (process.env.VOICE_FEATURE_BYPASS === 'true' || process.env.SESSION_LIMIT_BYPASS === 'true')
) {
    throw new Error('[SECURITY] Feature bypasses must not be enabled in production')
}

/**
 * Checks if a user has access to voice features.
 * Priority 1: Feature Flag (Development Bypass)
 * Priority 2: Subscription verification (Pro/Teams)
 *
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function hasVoiceAccess(userId) {
    // 1. Feature Flag Bypass (Controlled via .env)
    const isBypassEnabled = process.env.VOICE_FEATURE_BYPASS === 'true'
    if (isBypassEnabled) {
        console.log(`[AccessControl] Bypass ACTIVE for user ${userId}`)
        return true
    }

    if (!userId) return false

    try {
        await dbConnect()
        const user = await User.findById(userId).select('subscription').lean()

        if (!user || !user.subscription) return false

        // Subscription verification logic
        const isProOrTeams = ['pro', 'teams'].includes(user.subscription.plan)
        const isActive = user.subscription.status === 'active'

        return isProOrTeams && isActive
    } catch (err) {
        console.error(
            `[AccessControl] Failed to check voice access for user ${userId}:`,
            err.message
        )
        return false // Fail Closed
    }
}
