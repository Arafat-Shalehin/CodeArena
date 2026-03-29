import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

/**
 * Streams a live interview chat response using a pre-assembled prompt
 * from AIConversationService.buildPrompt().
 *
 * @param {Object} opts
 * @param {string}  opts.systemPrompt - Assembled by AIConversationService
 * @param {Array}   opts.messages     - sanitised history + current user turn
 */
export async function* generateInterviewChatResponse({ systemPrompt, messages = [] }) {
    if (!process.env.GROQ_API_KEY) {
        yield 'AI Interviewer is currently unavailable (API Key missing).'
        return
    }

    try {
        const stream = await groq.chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            model: 'llama-3.3-70b-versatile',
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
