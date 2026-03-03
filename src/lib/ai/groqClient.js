import Groq from 'groq-sdk'

// Initialize the Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
})

/**
 * Analyzes executed code using Groq (Llama-3) and returns rich, structured feedback.
 * @param {Object} params
 * @param {string} params.code          The user's submitted source code
 * @param {string} params.language      The programming language used
 * @param {string} params.problemTitle  The title or description of the problem
 * @param {string} params.verdict       The execution verdict (e.g., 'ACCEPTED', 'WRONG_ANSWER')
 * @param {number} params.executionTime The time taken by the code to execute in ms
 * @param {number} params.memoryUsed    The memory used by the code in KB
 * @returns {Promise<Object|null>} Structured JSON response with feedback, or null on failure
 */
export async function analyzeSubmissionCode({
    code,
    language,
    problemTitle = 'Code Challenge',
    verdict,
    executionTime = 0,
    memoryUsed = 0,
}) {
    if (!process.env.GROQ_API_KEY) {
        console.warn('GROQ_API_KEY is not set. Skipping AI analysis.')
        return null
    }

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an elite competitive programming coach and senior software engineer. You analyze code submissions with surgical precision — identifying algorithmic patterns, complexity bottlenecks, and optimization opportunities. Your feedback is concise, actionable, and encouraging. You MUST respond ONLY with a valid JSON object. No markdown, no code blocks, no extra text.`,
                },
                {
                    role: 'user',
                    content: `Analyze the following ${language} code submitted for the problem "${problemTitle}".

Verdict: ${verdict}
Execution Time: ${executionTime}ms
Memory Used: ${memoryUsed}KB

CODE:
\`\`\`${language}
${code}
\`\`\`

Respond ONLY with a valid JSON object matching this exact schema:
{
  "timeComplexity": "string — Big-O time complexity of the solution (e.g. O(N), O(N log N))",
  "spaceComplexity": "string — Big-O space complexity (e.g. O(1), O(N))",
  "algorithm": "string — Name the algorithm/technique used (e.g. 'XOR Bit Manipulation', 'Two Pointer', 'Dynamic Programming', 'Brute Force', 'Sorting + Binary Search'). Be specific.",
  "rating": "number — overall score from 1 to 10 (10 = optimal, production-quality code)",
  "verdict_explanation": "string — A 1-sentence explanation of why this verdict was given. If WRONG_ANSWER, hint at what might be wrong without giving the answer.",
  "strengths": ["string — each strength is a single concise sentence (max 3 items)"],
  "improvements": ["string — each improvement is a specific, actionable suggestion (max 3 items)"],
  "optimal_approach": "string — Briefly describe the most optimal approach for this problem in 1-2 sentences. If the submitted solution IS optimal, say so.",
  "code_quality": {
    "readability": "number — 1 to 5 (5 = crystal clear, well-named variables, clean structure)",
    "efficiency": "number — 1 to 5 (5 = optimal time/space complexity for this problem)",
    "correctness": "number — 1 to 5 (5 = handles all edge cases correctly)"
  }
}

Rules:
- Be encouraging but honest. Highlight what was done well.
- "improvements" should be ACTIONABLE (e.g., "Use XOR to solve in O(N) time and O(1) space" not "optimize the code").
- "algorithm" should identify the specific technique, not a vague description.
- If the code is already optimal, acknowledge it in "optimal_approach".
- Keep everything concise and impactful.`,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.25,
            max_completion_tokens: 1024,
            response_format: { type: 'json_object' },
        })

        const responseText = chatCompletion.choices[0]?.message?.content || ''

        try {
            const parsedFeedback = JSON.parse(responseText)
            return parsedFeedback
        } catch (jsonError) {
            console.error('Failed to parse Groq response as JSON:', responseText)
            return null
        }
    } catch (error) {
        console.error('Error calling Groq API:', error.message || error)
        return null
    }
}
