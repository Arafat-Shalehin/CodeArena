'use client'

import { useProblemSolve, useProblemSolveSync, useStoreHydration } from '@/hooks/useStores'

/**
 * Example: Code Editor Component using Zustand Store
 *
 * Benefits:
 * - State automatically persists to localStorage on every change
 * - State automatically restores from localStorage on page reload
 * - No manual JSON.stringify/parse needed
 * - Works with page navigation and browser refresh
 */
export function CodeEditorExample({ problemId, initialCode }) {
    // Auto-hydrate store from localStorage
    useStoreHydration()

    // Reset state when problem ID changes
    useProblemSolveSync(problemId)

    const { code, language, isRunning, testResult, setCode, setLanguage, setIsRunning } =
        useProblemSolve()

    const handleCodeChange = (newCode) => {
        setCode(newCode) // Automatically persists to localStorage
    }

    const handleLanguageChange = (lang) => {
        setLanguage(lang) // Automatically persists to localStorage
    }

    const handleRun = async () => {
        setIsRunning(true)
        try {
            // Your execution logic
            // State persists automatically during async operations
            await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    language: language,
                }),
            })
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div>
            <div className="editor-controls">
                <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                </select>
            </div>

            <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="Write your code here..."
                className="code-editor"
            />

            <button onClick={handleRun} disabled={isRunning}>
                {isRunning ? 'Running...' : 'Run Code'}
            </button>

            {testResult && <div className="test-result">{/* Display test results */}</div>}
        </div>
    )
}

/**
 * MIGRATION GUIDE:
 *
 * 1. Replace old useState calls:
 *    OLD: const [code, setCode] = useState('')
 *    NEW: const { code, setCode } = useProblemSolve()
 *
 * 2. Add hook calls at component top:
 *    useStoreHydration()           // Once per app
 *    useProblemSolveSync(problemId) // In pages that use it
 *
 * 3. All state changes are auto-persisted
 *    No need for useEffect + localStorage anymore!
 *
 * 4. On page reload:
 *    - State automatically restores from localStorage
 *    - Components re-render with restored state
 *    - No data loss!
 */
