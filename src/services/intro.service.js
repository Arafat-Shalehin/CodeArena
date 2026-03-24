/**
 * intro.service.js
 *
 * Provides high-quality, templated interview introductions.
 * Persona: Alex (Senior Software Engineer)
 * Tone: Socratic, encouraging, professional.
 */

const TEMPLATES = [
    {
        style: 'warm',
        template:
            "Hi there! I'm Alex, a Senior Software Engineer here. It's great to meet you! For today's session, we'll be looking at {{title}}. We'll start with some conceptual questions to understand your thought process, and then we'll dive into the coding phase. To get us started, what's your first impression of this problem?",
    },
    {
        style: 'direct',
        template:
            "Hello! I'm Alex. We're going to work through {{title}} today. The structure is simple: first, we'll discuss the high-level approach and complexity (Conceptual Phase), and then you'll implement the solution (Coding Phase). How would you describe the core challenge of this problem in your own words?",
    },
    {
        style: 'socratic',
        template:
            "Welcome! I'm Alex. Today's problem is {{title}} ({{difficulty}} difficulty). I'm interested in how you break down complex tasks. We'll spend the first few minutes discussing the constraints and potential edge cases before writing any code. Looking at the description, what's the first thing that jumps out at you as a potential pitfall?",
    },
    {
        style: 'confident',
        template:
            "Great to have you here! I'm Alex. We've got an interesting one today: {{title}}. I love seeing how different engineers approach this. We'll start with a conceptual deep-dive before moving to the editor. Before we look at the code, what kind of data structures do you think would be most efficient here?",
    },
    {
        style: 'encouraging',
        template:
            "Hi! I'm Alex, and I'll be your interviewer today. We're tackling {{title}}. Don't worry if it looks tricky at first — we'll break it down together. First, we'll chat conceptually about the algorithm, then we'll move to the implementation. What's the very first approach that comes to mind when you read the requirements?",
    },
    {
        style: 'professional',
        template:
            "Good to meet you. I'm Alex, a Senior Engineer on the team. Today we're evaluating {{title}}. I'll be looking for clear communication and efficient logic. We'll begin with a conceptual discussion to map out our strategy before opening the IDE. How do you suggest we handle the core logic of this problem?",
    },
]

/**
 * Generates a random, high-quality intro message.
 * @param {string} problemTitle
 * @param {string} difficulty
 * @returns {string}
 */
export function generateIntro(problemTitle, difficulty = 'Medium') {
    const templateObj = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
    let intro = templateObj.template
        .replace(/{{title}}/g, `"${problemTitle}"`)
        .replace(/{{difficulty}}/g, difficulty)

    console.log(
        `[Intro] Templated intro generated (${templateObj.style}) for problem: ${problemTitle}`
    )
    return intro
}
