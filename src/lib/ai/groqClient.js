import Groq from 'groq-sdk'

// Initialize the Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
})

/**
 * Analyzes executed code using Groq (Llama-3) and returns rich, structured feedback.
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
                    content: `You are a friendly, encouraging, and highly technical "Coding Mentor" for a programmer. 
Your goal is to help the user grow by providing feedback that feels personal, insightful, and deeply connected to their specific code and the problem at hand.

Guidelines:
1. Tone: Warm, professional but conversational, and mentor-like. Use phrases like "I noticed you used...", "A great choice here was...", or "One thing you might find interesting is...".
2. Specificity: Avoid generic statements like "Code is efficient." Instead, say "Your use of a Set here for O(1) lookups was a smart move for this problem."
3. Encouragement: Always find something genuine to praise, even in failing code.
4. Problem Context: Relate your analysis to the specific constraints and goals of "${problemTitle}".
5. Language: Use the language of the programmer (e.g., if they use Python, talk about Pythonic ways).

You MUST respond ONLY with a valid JSON object. No markdown, no code blocks, no extra text.`,
                },
                {
                    role: 'user',
                    content: `Hey Mentor, I've just submitted my ${language} solution for "${problemTitle}". 
Can you take a look at my code and tell me how I did?

My Results:
- Verdict: ${verdict}
- Time: ${executionTime}ms
- Memory: ${memoryUsed}KB

MY CODE:
\`\`\`${language}
${code}
\`\`\`

Analyze this specific implementation. Don't give me a generic lecture—tell me about MY code. 
Respond ONLY with a valid JSON object matching this schema:
{
  "timeComplexity": "O(...) - ONLY the Big-O notation, no extra words",
  "spaceComplexity": "O(...) - ONLY the Big-O notation, no extra words",
  "algorithm": "The specific technique name (e.g. 'Binary Search')",
  "rating": number (1-10),
  "verdict_explanation": "A friendly personal explanation of why this verdict happened (relate to their specific logic).",
  "strengths": ["Personal strength 1", "Personal strength 2"],
  "improvements": ["Specific actionable tip 1", "Specific actionable tip 2"],
  "optimal_approach": "How to refine this specific code or the absolute best way to solve this specific problem.",
  "code_quality": {
    "readability": number (1-5),
    "efficiency": number (1-5),
    "correctness": number (1-5)
  }
}

Rules:
- Be a person, not a template. 
- Talk about specific variable names or logic paths from the code if it helps clarity.
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
