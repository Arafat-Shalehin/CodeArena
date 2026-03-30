import fs from 'fs'
import path from 'path'

const VERSION = process.env.PROMPT_VERSION || 'v1'
const promptCache = {}

export function loadPrompt(phase) {
    if (promptCache[phase]) return promptCache[phase]

    const filePath = path.join(process.cwd(), 'src', 'prompts', VERSION, `${phase}.txt`)

    if (!fs.existsSync(filePath)) {
        throw new Error(`[Prompt Loader] Missing template file: ${filePath}`)
    }

    const content = fs.readFileSync(filePath, 'utf-8')

    if (!content || !content.trim()) {
        throw new Error(`[Prompt Loader] Empty template file: ${filePath}`)
    }

    promptCache[phase] = content
    return content
}
