import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

/**
 * Streams a live interview chat response using a pre-assembled prompt
 * from AIConversationService.buildPrompt().
 *
 * @param {Object} opts
 * @param {string}  opts.systemPrompt - Assembled by AIConversationService
 * @param {Array}   opts.messages     - sanitised history + current user turn
 * @param {string}  opts.model        - Targeted LLM (Fast vs Quality)
 * @param {string}  opts.phase        - Current session phase
 * @param {string}  opts.jobType      - Calling origin identity
 */
export async function* generateInterviewChatResponse({
    systemPrompt,
    messages = [],
    model,
    phase = 'unknown',
    jobType = 'unknown',
}) {
    if (!process.env.GROQ_API_KEY) {
        yield 'AI Interviewer is currently unavailable (API Key missing).'
        return
    }

    // Safety Fallback: Default to maximum reasoning if router failed
    let activeModel = model
    if (!activeModel) {
        console.error('[Groq] Model selection failed or missing. Defaulting to QUALITY.', {
            phase,
            jobType,
        })
        activeModel = 'llama-3.3-70b-versatile'
    }

    // Mandatory Observability Logging
    console.log('[Groq]', {
        model: activeModel,
        phase,
        jobType,
    })

    try {
        const stream = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            model: activeModel,
            temperature: 0.7,
            stream: true,
        })

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) yield content
        }
    } catch (error) {
        console.error('[Interview Groq] Streaming error:', error)
        yield 'I encountered an error while processing your request. Please try again.'
    }
}
