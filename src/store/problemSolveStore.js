import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Problem Solve Store with Persistence
 * Automatically persists state to localStorage and restores on page reload
 */
export const useProblemSolveStore = create(
    persist(
        (set, get) => ({
            // Code Editor State
            code: '',
            language: 'python',
            setCode: (code) => set({ code }),
            setLanguage: (language) => set({ language }),

            // Execution State
            isRunning: false,
            isSubmitting: false,
            testResult: null,
            testInput: '',
            activeTestCase: 0,
            consoleTab: 'testcase',
            testResultData: null,

            setIsRunning: (running) => set({ isRunning: running }),
            setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
            setTestResult: (result) => set({ testResult: result }),
            setTestInput: (input) => set({ testInput: input }),
            setActiveTestCase: (index) => set({ activeTestCase: index }),
            setConsoleTab: (tab) => set({ consoleTab: tab }),
            setTestResultData: (data) => set({ testResultData: data }),

            // UI State
            isConsoleOpen: true,
            leftTab: 'description',
            setIsConsoleOpen: (open) => set({ isConsoleOpen: open }),
            setLeftTab: (tab) => set({ leftTab: tab }),

            // Problem Data Caching
            cachedProblem: null,
            cachedProblems: [],
            setCachedProblem: (problem) => set({ cachedProblem: problem }),
            setCachedProblems: (problems) => set({ cachedProblems: problems }),

            // Navigation/View State - Track which page user is on
            currentProblemId: null,
            currentPage: 'problem-solve', // 'problem-solve' | 'submission-details' | 'ai-feedback'
            submissionViewId: null, // Which submission is being viewed
            setCurrentProblemId: (id) => set({ currentProblemId: id }),
            setCurrentPage: (page) => set({ currentPage: page }),
            setSubmissionViewId: (id) => set({ submissionViewId: id }),

            // Submission Detail State
            submissionDetails: null,
            setSubmissionDetails: (details) => set({ submissionDetails: details }),

            // Submission & AI Feedback State
            submissionId: null,
            aiFeedback: null,
            complexityAnalysis: null,
            lastSubmittedCode: '',
            lastSubmittedLanguage: 'python',

            setSubmissionId: (id) => set({ submissionId: id }),
            setAiFeedback: (feedback) => set({ aiFeedback: feedback }),
            setComplexityAnalysis: (analysis) => set({ complexityAnalysis: analysis }),
            setLastSubmittedCode: (code) => set({ lastSubmittedCode: code }),
            setLastSubmittedLanguage: (lang) => set({ lastSubmittedLanguage: lang }),

            // Reset function for when switching problems
            resetProblemState: (newProblemId) =>
                set({
                    currentProblemId: newProblemId,
                    currentPage: 'problem-solve', // Reset to problem-solve view
                    submissionViewId: null,
                    isRunning: false,
                    isSubmitting: false,
                    testResult: null,
                    testInput: '',
                    activeTestCase: 0,
                    consoleTab: 'testcase',
                    testResultData: null,
                    isConsoleOpen: true,
                    leftTab: 'description',
                    submissionId: null,
                    aiFeedback: null,
                    complexityAnalysis: null,
                    // Keep code and language when switching problems
                }),

            // Clear all state
            clearStore: () =>
                set({
                    code: '',
                    language: 'python',
                    isRunning: false,
                    isSubmitting: false,
                    testResult: null,
                    testInput: '',
                    activeTestCase: 0,
                    consoleTab: 'testcase',
                    testResultData: null,
                    isConsoleOpen: true,
                    leftTab: 'description',
                    currentProblemId: null,
                    submissionId: null,
                    aiFeedback: null,
                    complexityAnalysis: null,
                    lastSubmittedCode: '',
                    lastSubmittedLanguage: 'python',
                }),
        }),
        {
            name: 'problem-solve-storage', // localStorage key name
            partialPersist: false, // Persist all state by default
            skipHydration: false, // Auto-hydrate on mount
            // Optional: Customize which parts of state persist
            // partialize: (state) => ({
            //     code: state.code,
            //     language: state.language,
            //     leftTab: state.leftTab,
            // }),
        }
    )
)

/**
 * Leaderboard/Contest Store with Persistence
 */
export const useContestStore = create(
    persist(
        (set) => ({
            selectedContest: null,
            contestFilter: 'active',

            setSelectedContest: (contest) => set({ selectedContest: contest }),
            setContestFilter: (filter) => set({ contestFilter: filter }),
            clearContestStore: () => set({ selectedContest: null, contestFilter: 'active' }),
        }),
        {
            name: 'contest-storage',
            skipHydration: false,
        }
    )
)

/**
 * User Preferences Store with Persistence
 */
export const usePreferencesStore = create(
    persist(
        (set) => ({
            theme: 'dark',
            fontSize: 14,
            editorLayout: 'horizontal',

            setTheme: (theme) => set({ theme }),
            setFontSize: (size) => set({ fontSize: size }),
            setEditorLayout: (layout) => set({ editorLayout: layout }),
        }),
        {
            name: 'preferences-storage',
            skipHydration: false,
        }
    )
)
