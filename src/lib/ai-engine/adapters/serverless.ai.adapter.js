import { AIEnginePort } from '../ai-engine.port'
import dbConnect from '@/lib/mongodb'
import { InterviewMessage } from '@/models/InterviewMessage.model'
import { InterviewSession } from '@/models/InterviewSession.model'
import { InterviewSnapshot } from '@/models/InterviewSnapshot.model'
import { InterviewResult } from '@/models/InterviewResult.model'
import { Submission } from '@/models/Submission.models'
import { Problem } from '@/models/Problem.models'
import { syncUserStats } from '@/services/user.service'
import { transitionPhase, releaseProcessingLock } from '@/services/interviewSession.service'
import { generateInterviewChatResponse } from '@/lib/ai/interviewGroqClient'
import { buildPrompt, buildScorecardPrompt } from '@/services/aiConversation.service'
import crypto from 'crypto'

/**
 * ServerlessAIAdapter
 * 
 * Implements AIEnginePort for serverless mode without Redis or BullMQ workers.
 * Runs AI processes asynchronously using background timers and directly updates MongoDB collections,
 * with optional Groq integration and a high-fidelity local fallback system.
 */
export class ServerlessAIAdapter extends AIEnginePort {
    static activeSessions = new Map() // sessionId -> Timeout

    async submitChat(data) {
        const { sessionId, userId, content, phase, messageId } = data
        console.log(`[SERVERLESS AI] submitChat called for session: ${sessionId}`)

        // If there's an ongoing job, clear it or skip
        if (ServerlessAIAdapter.activeSessions.has(sessionId)) {
            console.log(`[SERVERLESS AI] Job already active for session ${sessionId}. Skipping duplicate.`)
            return
        }

        // Simulating the interview AI worker flow in an asynchronous block
        const timeout = setTimeout(async () => {
            try {
                await dbConnect()
                ServerlessAIAdapter.activeSessions.delete(sessionId)

                const session = await InterviewSession.findById(sessionId).populate('problemIds')
                if (!session) {
                    throw new Error(`Interview session ${sessionId} not found`)
                }

                let currentPhase = session.currentPhase
                const problem = session.problemIds?.[0]

                // ── Intro -> QA Phase Transition ──
                if (currentPhase === 'intro') {
                    await transitionPhase(sessionId, 'qa')
                    currentPhase = 'qa'
                }

                const adjustedContent = content === '[SYSTEM_START_INTERVIEW]'
                    ? 'Introduce yourself as Alex and start the interview. Explain the rules (Conceptual then Coding) and ask the first conceptual question.'
                    : content

                // Groq API client integration if API Key exists
                let aiResponse = ''
                if (process.env.GROQ_API_KEY) {
                    try {
                        const history = await InterviewMessage.find({ sessionId }).sort({ ts: 1 })
                        const { systemPrompt, messages } = buildPrompt({
                            problemTitle: problem?.title,
                            problemDescription: problem?.description,
                            difficulty: problem?.difficulty,
                            correctAnswer: problem?.correctAnswer,
                            expectedConcepts: problem?.expectedConcepts,
                            evaluationCriteria: problem?.evaluationCriteria,
                            currentPhase,
                            history: history.map(h => ({ role: h.role, content: h.content, phase: h.phase })),
                            userMessage: adjustedContent,
                        })

                        const generator = generateInterviewChatResponse({ systemPrompt, messages })
                        for await (const chunk of generator) {
                            aiResponse += chunk
                        }
                    } catch (groqErr) {
                        console.error('[SERVERLESS AI] Groq generation failed. Falling back to local response.', groqErr)
                    }
                }

                // If Groq is not configured or failed, generate high-fidelity technical mock response
                if (!aiResponse) {
                    aiResponse = this._generateMockChatResponse(currentPhase, problem, adjustedContent)
                }

                // ── QA -> Coding Transition ──
                if (currentPhase === 'qa') {
                    const qaUserCount = await InterviewMessage.countDocuments({
                        sessionId,
                        role: 'user',
                        phase: 'qa',
                    })
                    if (qaUserCount >= 2) {
                        await transitionPhase(sessionId, 'coding')
                        currentPhase = 'coding'
                    }
                }

                // Save final assistant message to DB
                await InterviewMessage.create({
                    id: messageId || crypto.randomUUID(),
                    sessionId,
                    role: 'ai',
                    phase: currentPhase,
                    content: aiResponse,
                    ts: new Date(),
                })

                // ── Evaluation -> Completed Transition ──
                if (aiResponse.includes('<WRAP_UP />') || currentPhase === 'evaluation') {
                    await transitionPhase(sessionId, 'completed')
                }

                await releaseProcessingLock(sessionId)
            } catch (err) {
                console.error('[SERVERLESS AI] Error in submitChat background task:', err)
                await releaseProcessingLock(sessionId).catch(console.error)
            }
        }, 1000)

        ServerlessAIAdapter.activeSessions.set(sessionId, timeout)
    }

    async submitScorecard(data, options = {}) {
        const { sessionId, userId } = data
        console.log(`[SERVERLESS AI] submitScorecard called for session: ${sessionId}`)

        setTimeout(async () => {
            try {
                await dbConnect()
                
                const existing = await InterviewResult.findOne({ sessionId })
                if (existing) {
                    console.log('[SERVERLESS AI] Scorecard already exists, skipping.')
                    return
                }

                const session = await InterviewSession.findById(sessionId).populate('problemIds')
                const problem = session?.problemIds?.[0]
                const history = await InterviewMessage.find({ sessionId }).sort({ ts: 1 })
                const snapshots = await InterviewSnapshot.find({
                    sessionId,
                    snapshotType: { $in: ['run', 'submit'] },
                }).sort({ ts: 1 })

                const userMessages = history.filter((m) => m.role === 'user')
                const meaningfulSnapshots = snapshots.filter(
                    (s) => s.snapshotType !== 'auto' || (s.code && s.code.length > 100)
                )

                let result
                if (userMessages.length === 0 && meaningfulSnapshots.length === 0) {
                    // Default 0 result for non-participation
                    result = await InterviewResult.findOneAndUpdate(
                        { sessionId },
                        {
                            sessionId,
                            userId,
                            communicationScore: 0,
                            codeQualityScore: 0,
                            problemSolvingScore: 0,
                            approachScore: 0,
                            overallScore: 0,
                            aiSummary: 'The candidate ended the session without providing any conceptual answers or code implementations. Participation was insufficient for a technical evaluation.',
                            strengths: [],
                            weaknesses: ['No participation detected'],
                            recommendations: [
                                'Engage with the interviewer during the Q&A phase',
                                'Attempt a partial implementation even if stuck',
                            ],
                            createdAt: new Date(),
                        },
                        { upsert: true, new: true }
                    )

                    await InterviewSession.findByIdAndUpdate(sessionId, {
                        status: 'terminated',
                        currentPhase: 'completed',
                        finalScore: 0,
                        endedAt: new Date(),
                    })
                } else {
                    // Normal evaluation - attempt Groq if configured, otherwise premium fallback
                    let overallScore = 75
                    let communicationScore = 80
                    let codeQualityScore = 70
                    let problemSolvingScore = 75
                    let approachScore = 75
                    let aiSummary = 'The candidate demonstrated a solid conceptual understanding of the problem and provided a clean, structured solution. Good communication skills throughout the interview.'
                    let strengths = ['Solid understanding of core algorithmic constraints', 'Clear explanations of space and time complexity']
                    let weaknesses = ['Could optimize edge case validation', 'Minor formatting/naming consistency improvements']
                    let recommendations = ['Practice solving problems under strict timing', 'Review advanced optimization techniques']

                    if (process.env.GROQ_API_KEY && problem) {
                        try {
                            const { systemPrompt, messages } = buildScorecardPrompt({
                                problemTitle: problem.title,
                                problemDescription: problem.description,
                                difficulty: problem.difficulty,
                                correctAnswer: problem.correctAnswer,
                                expectedConcepts: problem.expectedConcepts,
                                evaluationCriteria: problem.evaluationCriteria,
                                conversationHistory: history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n\n'),
                                codeSnapshots: snapshots.map(s => `SNAPSHOT (${s.snapshotType}):\n${s.code}`).join('\n\n'),
                            })

                            let rawScorecard = ''
                            const generator = generateInterviewChatResponse({ systemPrompt, messages })
                            for await (const chunk of generator) {
                                rawScorecard += chunk
                            }

                            // Precise JSON extraction
                            const jsonMatch = rawScorecard.match(/```json\s*([\s\S]*?)```/) || rawScorecard.match(/{[\s\S]*?}/)
                            if (jsonMatch) {
                                const parsed = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim())
                                overallScore = parsed.overallScore || overallScore
                                communicationScore = parsed.communicationScore || communicationScore
                                codeQualityScore = parsed.codeQualityScore || codeQualityScore
                                problemSolvingScore = parsed.problemSolvingScore || problemSolvingScore
                                approachScore = parsed.approachScore || approachScore
                                aiSummary = parsed.aiSummary || aiSummary
                                strengths = parsed.strengths || strengths
                                weaknesses = parsed.weaknesses || weaknesses
                                recommendations = parsed.recommendations || recommendations
                            }
                        } catch (err) {
                            console.error('[SERVERLESS AI] Groq scorecard generation failed, using mock data.', err)
                        }
                    }

                    result = await InterviewResult.findOneAndUpdate(
                        { sessionId },
                        {
                            sessionId,
                            userId,
                            communicationScore,
                            codeQualityScore,
                            problemSolvingScore,
                            approachScore,
                            overallScore,
                            aiSummary,
                            strengths,
                            weaknesses,
                            recommendations,
                            createdAt: new Date(),
                        },
                        { upsert: true, new: true }
                    )

                    await InterviewSession.findByIdAndUpdate(sessionId, {
                        status: 'terminated',
                        currentPhase: 'completed',
                        finalScore: overallScore,
                        endedAt: new Date(),
                    })
                }

                console.log(`[SERVERLESS AI] Scorecard generated successfully for session ${sessionId}`)
            } catch (err) {
                console.error('[SERVERLESS AI] Error generating scorecard:', err)
            }
        }, 1000)
    }

    async submitSubmissionAnalysis(data) {
        const { sessionId, userId, submissionVerdict, code, language } = data
        console.log(`[SERVERLESS AI] submitSubmissionAnalysis called for session: ${sessionId}`)

        // If there's an ongoing job, clear it or skip to avoid duplicate processing
        if (ServerlessAIAdapter.activeSessions.has(sessionId)) {
            console.log(`[SERVERLESS AI] Job already active for session ${sessionId}. Skipping duplicate.`)
            return
        }

        const timeout = setTimeout(async () => {
            try {
                await dbConnect()
                ServerlessAIAdapter.activeSessions.delete(sessionId)

                const session = await InterviewSession.findById(sessionId).populate('problemIds')
                if (!session) {
                    throw new Error(`Interview session ${sessionId} not found`)
                }

                // 1. Transition session to 'evaluation' phase
                await transitionPhase(sessionId, 'evaluation')

                const problem = session.problemIds?.[0]

                // 2. Generate the AI evaluation review
                let aiResponse = ''
                if (process.env.GROQ_API_KEY) {
                    try {
                        const history = await InterviewMessage.find({ sessionId }).sort({ ts: 1 })
                        const { systemPrompt, messages } = buildPrompt({
                            problemTitle: problem?.title || '',
                            problemDescription: problem?.description || '',
                            currentCode: code || '',
                            language: language || 'python',
                            phase: 'evaluation',
                            submissionVerdict: submissionVerdict || null,
                            userMessage: '',
                            history,
                            evaluationMetadata: {
                                correctAnswer: problem?.correctAnswer,
                                expectedConcepts: problem?.expectedConcepts,
                                evaluationCriteria: problem?.evaluationCriteria,
                            }
                        })

                        const generator = generateInterviewChatResponse({ systemPrompt, messages })
                        for await (const chunk of generator) {
                            aiResponse += chunk
                        }
                    } catch (groqErr) {
                        console.error('[SERVERLESS AI] Groq generation failed. Falling back to local response.', groqErr)
                    }
                }

                // Local fallback response containing the essential <WRAP_UP /> tag
                if (!aiResponse) {
                    aiResponse = this._generateMockChatResponse('evaluation', problem, '')
                }

                // 3. Save assistant message to DB
                await InterviewMessage.create({
                    id: crypto.randomUUID(),
                    sessionId,
                    role: 'ai',
                    phase: 'evaluation',
                    content: aiResponse,
                    ts: new Date(),
                })

                // 4. Transition to 'completed' phase (which automatically triggers scorecard generation)
                if (aiResponse.includes('<WRAP_UP />')) {
                    await transitionPhase(sessionId, 'completed')
                }

                await releaseProcessingLock(sessionId)
            } catch (err) {
                console.error('[SERVERLESS AI] Error in submitSubmissionAnalysis background task:', err)
                await releaseProcessingLock(sessionId).catch(console.error)
            }
        }, 1000)

        ServerlessAIAdapter.activeSessions.set(sessionId, timeout)
    }


    async cancelSessionJobs(sessionId) {
        console.log(`[SERVERLESS AI] Cancelling jobs for session: ${sessionId}`)
        const timeout = ServerlessAIAdapter.activeSessions.get(sessionId)
        if (timeout) {
            clearTimeout(timeout)
            ServerlessAIAdapter.activeSessions.delete(sessionId)
        }
    }

    async hasActiveJob(sessionId) {
        const active = ServerlessAIAdapter.activeSessions.has(sessionId)
        console.log(`[SERVERLESS AI] hasActiveJob for session ${sessionId}: ${active}`)
        return active
    }

    _generateMockChatResponse(phase, problem, content) {
        if (content.includes('[SYSTEM_START_INTERVIEW]')) {
            return `Hello! I am Alex, your technical interviewer today. We will focus on the problem: **${problem?.title || 'Algorithmic Problem'}**. The interview consists of two phases: first, a short conceptual Q&A to discuss your design approach, and second, the coding phase where you'll implement the code. To start off, could you explain the general approach you would take to solve this problem?`
        }

        switch (phase) {
            case 'intro':
            case 'qa':
                return `That is a sound conceptual approach. Thinking about the problem scale, what do you think would be the time and space complexity of your approach? Specifically, how would it scale if we increase the inputs by a factor of 1000? Let me know so we can transition to the coding editor.`
            case 'coding':
                return `Excellent logic. I have unlocked the coding editor for you. Please proceed with your implementation. Remember to handle potential edge cases such as empty inputs, negative numbers, or extremely large parameters. Let me know when you are ready to compile/test your code!`
            case 'evaluation':
                return `Thank you for completing the implementation! Your code is fully functional. I am generating your performance scorecard. Overall, you did a wonderful job. I wish you the best of luck in your preparation! <WRAP_UP />`
            default:
                return `Interesting point. Let's keep exploring this structure or begin writing the code if you are ready.`
        }
    }
}
