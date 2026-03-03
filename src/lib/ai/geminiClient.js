import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Analyzes executed code using Google Gemini and returns actionable feedback.
 * @param {Object} params
 * @param {string} params.code The user's submitted source code
 * @param {string} params.language The programming language used
 * @param {string} params.problemTitle The title or description of the problem
 * @param {string} params.verdict The execution verdict (e.g., 'accepted', 'time_limit_exceeded')
 * @param {number} params.executionTime The time taken by the code to execute in ms
 * @param {number} params.memoryUsed The memory used by the code in KB
 * @returns {Promise<Object>} Structured JSON response with feedback
 */
export async function analyzeSubmissionCode({
    code,
    language,
    problemTitle = 'Code Challenge',
    verdict,
    executionTime,
    memoryUsed,
}) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. Skipping AI analysis.')
        return null
    }

    try {
        // Use Gemini 1.5 Flash as it is optimized for high-volume, low-latency text/code tasks
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
You are an expert Senior Software Engineer reviewing code submitted for a competitive programming / algorithmic problem called "${problemTitle}". 
The code was written in ${language}.
The execution verdict was: ${verdict.toUpperCase()}.
Metrics: Execution Time: ${executionTime}ms, Memory Used: ${memoryUsed}KB.

Please analyze the user's code and provide constructive, detailed feedback. 

USER CODE:
\`\`\`${language}
${code}
\`\`\`

Respond ONLY with a valid JSON object matching this exact schema. Do not include Markdown blocks (like \`\`\`json) outside the JSON, just the raw JSON data.
{
  "timeComplexity": "string (e.g., O(N), O(N^2). Be accurate based on the code)",
  "spaceComplexity": "string (e.g., O(1), O(N))",
  "strengths": ["string", "string"], // 1-3 bullet points on what the code did well
  "improvements": ["string", "string"], // 1-3 actionable bullet points on how to make the code cleaner, faster, or more optimal
  "rating": number // A score from 1 to 10 evaluating the overall code quality, readability, and logic
}`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text()

        // Clean up formatting in case Gemini returns markdown code blocks
        const cleanedText = responseText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim()

        try {
            const parsedFeedback = JSON.parse(cleanedText)
            return parsedFeedback
        } catch (jsonError) {
            console.error('Failed to parse Gemini response as JSON:', cleanedText)
            return null
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error)
        return null
    }
}
