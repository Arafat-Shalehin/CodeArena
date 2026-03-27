import Groq from 'groq-sdk'

// Initialize the Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
})

/**
 * Analyzes executed code using Groq (Llama-3) and returns rich, structured feedback.
 * Used exclusively by the AI Feedback feature (ai.worker.js → post-submission pipeline).
 *
 * NOTE: Interview AI is handled separately in `src/lib/ai/interviewGroqClient.js`
 *       to keep the two features fully decoupled.
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
                    content: `You are the "Master Architect & Coding Mentor" for CodeArena. 
Your personality: Highly technical, direct, and brutally honest. You prioritize correctness and truthful feedback above all else.

### 🎯 MANDATORY SCORING LOGIC (Internal Audit):
Before generating the JSON, you MUST evaluate the code based on these strict rules:

1. **The "Wrong Problem" Filter:** If the user's code is solving a different problem or is irrelevant to "${problemTitle}", the 'rating' MUST be 1/10 and 'correctness' MUST be 0/5.
2. **The Verdict Anchor:** 
   - If verdict is 'WRONG_ANSWER': Max Rating = 4/10. Max Correctness = 1/5.
   - If verdict is 'TIME_LIMIT_EXCEEDED': Max Rating = 5/10. Max Correctness = 3/5.
   - If verdict is 'RUNTIME_ERROR': Max Rating = 3/10. Max Correctness = 0/5.
   - If verdict is 'ACCEPTED': Rating starts from 7/10 and goes up based on efficiency.
3. **Consistency Check:** Do not give a high "Efficiency" score if the verdict is 'TLE'.
4. **Honesty First:** Only praise what deserves praise. If the code is poorly written, say so directly. Generic praise is worthless.

### 📋 FEEDBACK GUIDELINES:
- **Specificity:** Mention actual variable names and logic paths (e.g., "Your 'visited' Set lookup is O(1)...").
- **Tone:** Direct and professional. Be kind without being fake. Avoid excessive pleasantries.
- **Problem Context:** Always relate feedback to the specific constraints of "${problemTitle}".
- **Language-Aware:** Use the language of the programmer (Pythonic patterns, Java idioms, etc.).
- **Brutal Honesty:** If the code has a fundamental flaw, don't hide it behind positive language. Explain clearly what went wrong.

### 🛡️ NO-CODE ZONE:
NEVER provide the full solution. Use Socratic hints. If you must show code, only show a 1-2 line snippet of a specific fix.`,
                },
                {
                    role: 'user',
                    content: `Mentor, analyze my ${language} solution for "${problemTitle}". 

[CONTEXT]
Verdict: ${verdict}
Execution: ${executionTime}ms | ${memoryUsed}KB

[CODE]
\`\`\`${language}
${code}
\`\`\`

Respond with this JSON structure:
{
  "internal_monologue": "Think step-by-step: Does the code solve ${problemTitle}? Does it match the verdict? Set the rating ceiling based on the anchor rules. What did they do RIGHT, and what's FUNDAMENTALLY WRONG?",
  "rating": number (1-10),
  "verdict_explanation": "Direct explanation of why this verdict happened. If WRONG, pinpoint the exact logical flaw. Be honest, not diplomatic.",
  "algorithm": "The specific technique name (e.g., 'Binary Search', 'DFS', 'Dynamic Programming')",
  "complexities": { "time": "O(...)", "space": "O(...)" },
  "strengths": ["Only include if genuinely present in the code - don't force positivity"],
  "critical_flaws": ["Be direct about what's broken. Don't soften it."],
  "hints": ["Socratic hint 1 - guide them to think about a critical aspect", "Socratic hint 2 - ask what happens in an edge case"],
  "optimal_approach": "Brief description of the best way to solve this. No fluff.",
  "quality_metrics": { "readability": 1-5, "efficiency": 1-5, "correctness": 1-5 }
}

Rules:
- Honesty > Encouragement. If the code is bad, say it's bad.
- Reference actual variable names from their code when pointing out issues.
- Only praise what genuinely deserves praise.
- Be direct. Avoid sugarcoating or diplomatic language.
- Ensure the JSON is perfectly valid.`,
                },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4,
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
