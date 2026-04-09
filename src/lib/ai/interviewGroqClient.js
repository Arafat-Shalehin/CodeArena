import Groq from 'groq-sdk'

function extractRetryAfterSeconds(message = '') {
    const minutes = message.match(/try again in\s+(\d+)m/i)
    const seconds = message.match(/try again in\s+(?:\d+m)?([\d.]+)s/i)

    const m = minutes ? Number(minutes[1]) : 0
    const s = seconds ? Number(seconds[1]) : 0
    const total = m * 60 + s

    return Number.isFinite(total) && total > 0 ? total : undefined
}

function normalizeGroqError(error) {
    const rawMessage = error?.error?.message || error?.message || 'Groq API request failed'
    const status = Number(error?.status || error?.response?.status || 0) || 500
    const code = error?.error?.code || (status === 429 ? 'rate_limit_exceeded' : 'groq_api_error')
    const retryAfterSeconds = extractRetryAfterSeconds(rawMessage)

    return {
        status,
        code,
        message: rawMessage,
        retryAfterSeconds,
    }
}

/**
 * Streams a live interview chat response using a pre-assembled prompt
 * from AIConversationService.buildPrompt().
 *
 * @param {Object} opts
 * @param {string}  opts.systemPrompt - Assembled by AIConversationService
 * @param {Array}   opts.messages     - sanitised history + current user turn
 */
export async function* generateInterviewChatResponse({ systemPrompt, messages = [] }) {
    const apiKey = process.env.GROQ_API_KEY?.trim()
    if (!apiKey) {
        yield 'AI Interviewer is currently unavailable (API Key missing).'
        return
    }

    const groq = new Groq({ apiKey })

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
        const normalizedError = normalizeGroqError(error)
        console.error('[Interview Groq] Streaming error:', normalizedError.message)

        if (normalizedError.status === 429) {
            const suffix = normalizedError.retryAfterSeconds
                ? ` Please retry in ${Math.max(1, Math.ceil(normalizedError.retryAfterSeconds))}s.`
                : ' Please retry shortly.'
            yield `AI Interviewer is currently rate-limited.${suffix}`
            return
        }

        yield 'I encountered an error while processing your request. Please try again.'
    }
}
