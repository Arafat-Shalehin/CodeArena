import { Submission } from '@/models/Submission.models'
import { redisClient } from '@/lib/redis'
import { normalizeCode } from '@/lib/plagiarism/normalizeCode'
import { jaccardSimilarity } from '@/lib/plagiarism/similarityEngine'
import dbConnect from '@/lib/mongodb'

const THRESHOLD = parseFloat(process.env.PLAGIARISM_SIMILARITY_THRESHOLD || '0.85')
const CACHE_TTL = 7 * 24 * 60 * 60 // 7 days in seconds

/**
 * Core service for plagiarism detection.
 * Compares a target submission against candidates in the same contest and problem.
 *
 * @param {string} submissionId - The ID of the submission to check.
 */
export async function checkSubmissionPlagiarism(submissionId) {
    try {
        await dbConnect()

        // 1. Fetch the target submission
        const target = await Submission.findById(submissionId)
        if (!target || target.verdict !== 'ACCEPTED') {
            return { skipped: true, reason: 'Invalid submission or non-accepted verdict' }
        }

        // 2. Get normalized code for target (check Redis cache first)
        const targetCacheKey = `plagiarism:norm:${submissionId}`
        let targetNorm = null
        let targetTokenCount = 0

        if (redisClient.isOpen) {
            const cached = await redisClient.get(targetCacheKey)
            if (cached) {
                const parsed = JSON.parse(cached)
                targetNorm = parsed.normalizedCode
                targetTokenCount = parsed.tokenCount
            }
        }

        if (targetNorm === null) {
            const result = normalizeCode(target.code)
            targetNorm = result.normalizedCode
            targetTokenCount = result.tokenCount

            // Cache in Redis if possible
            if (redisClient.isOpen) {
                await redisClient.set(targetCacheKey, JSON.stringify(result), { EX: CACHE_TTL })
            }
        }

        // Exit if target code is too short
        if (!targetNorm || targetTokenCount < 20) {
            await Submission.findByIdAndUpdate(submissionId, {
                plagiarismCheckedAt: new Date(),
                similarityScore: 0,
                suspectedPlagiarism: false,
            })
            return { skipped: true, reason: 'Code too short for plagiarism check' }
        }

        // 3. Query MongoDB for candidate submissions to compare against
        const candidates = await Submission.find({
            problemId: target.problemId,
            contestId: target.contestId,
            language: target.language,
            verdict: 'ACCEPTED',
            userId: { $ne: target.userId }, // exclude own submissions
            _id: { $ne: target._id }, // exclude self
            plagiarismCheckedAt: { $ne: null }, // only compare against already-checked submissions
        })
            .select('_id userId code')
            .limit(200) // Hard cap for Phase 1
            .lean()

        let highestSimilarity = 0
        const matches = []

        // 4. Compare target against each candidate
        for (const candidate of candidates) {
            const candidateCacheKey = `plagiarism:norm:${candidate._id}`
            let candidateNorm = null
            let candidateTokenCount = 0

            if (redisClient.isOpen) {
                const cached = await redisClient.get(candidateCacheKey)
                if (cached) {
                    const parsed = JSON.parse(cached)
                    candidateNorm = parsed.normalizedCode
                    candidateTokenCount = parsed.tokenCount
                }
            }

            if (candidateNorm === null) {
                const result = normalizeCode(candidate.code)
                candidateNorm = result.normalizedCode
                candidateTokenCount = result.tokenCount

                if (redisClient.isOpen) {
                    await redisClient.set(candidateCacheKey, JSON.stringify(result), {
                        EX: CACHE_TTL,
                    })
                }
            }

            // Skip candidates with short code
            if (!candidateNorm || candidateTokenCount < 20) continue

            const similarity = jaccardSimilarity(targetNorm, candidateNorm)
            highestSimilarity = Math.max(highestSimilarity, similarity)

            if (similarity >= THRESHOLD) {
                matches.push({
                    submissionId: candidate._id,
                    userId: candidate.userId,
                    similarity: similarity,
                })
            }
        }

        // 5. Finalize and update document
        const suspectedPlagiarism = highestSimilarity >= THRESHOLD
        const top5matches = matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5)

        await Submission.findByIdAndUpdate(submissionId, {
            $set: {
                similarityScore: highestSimilarity,
                suspectedPlagiarism,
                plagiarismCheckedAt: new Date(),
                matchedSubmissions: top5matches,
            },
        })

        // 6. Notify admin via Redis if flagged
        if (suspectedPlagiarism && redisClient.isOpen) {
            await redisClient.publish(
                'plagiarism:flagged',
                JSON.stringify({
                    submissionId: target._id,
                    userId: target.userId,
                    contestId: target.contestId,
                    problemId: target.problemId,
                    score: highestSimilarity,
                })
            )
        }

        return { success: true, similarityScore: highestSimilarity, suspectedPlagiarism }
    } catch (error) {
        console.error(`[PLAGIARISM SERVICE] Error checking submission ${submissionId}:`, error)
        throw error
    }
}
