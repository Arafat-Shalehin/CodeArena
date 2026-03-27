// Verdict constants for submission evaluation
export const VERDICTS = {
    // Success
    ACCEPTED: 'ACCEPTED',
    EXECUTED: 'EXECUTED', // Playground mode - code ran successfully without errors
    WRONG_ANSWER: 'WRONG_ANSWER',
    TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
    MEMORY_LIMIT_EXCEEDED: 'MEMORY_LIMIT_EXCEEDED',
    RUNTIME_ERROR: 'RUNTIME_ERROR',
    COMPILATION_ERROR: 'COMPILATION_ERROR',
    PENDING: 'PENDING',
    JUDGING: 'JUDGING',
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    SECURITY_ERROR: 'SECURITY_ERROR',
    FEATURE_UNSUPPORTED_IN_CLOUD: 'FEATURE_UNSUPPORTED_IN_CLOUD',
}

// Meta information for UI display
export const VERDICT_META = {
    [VERDICTS.ACCEPTED]: {
        code: 'AC',
        name: 'Accepted',
        description: 'Solution is correct',
        color: 'green',
        score: 100,
    },
    [VERDICTS.EXECUTED]: {
        code: 'EX',
        name: 'Executed',
        description: 'Code ran successfully (playground mode)',
        color: 'cyan', // Positive/neutral color
        score: 0, // No score for playground
    },
    [VERDICTS.WRONG_ANSWER]: {
        code: 'WA',
        name: 'Wrong Answer',
        description: 'Output does not match expected output',
        color: 'red',
        score: 0,
    },
    [VERDICTS.TIME_LIMIT_EXCEEDED]: {
        code: 'TLE',
        name: 'Time Limit Exceeded',
        description: 'Program execution exceeded time limit',
        color: 'orange',
        score: 0,
    },
    [VERDICTS.MEMORY_LIMIT_EXCEEDED]: {
        code: 'MLE',
        name: 'Memory Limit Exceeded',
        description: 'Program used more memory than allowed',
        color: 'orange',
        score: 0,
    },
    [VERDICTS.RUNTIME_ERROR]: {
        code: 'RE',
        name: 'Runtime Error',
        description: 'Program crashed during execution',
        color: 'red',
        score: 0,
    },
    [VERDICTS.COMPILATION_ERROR]: {
        code: 'CE',
        name: 'Compilation Error',
        description: 'Code failed to compile',
        color: 'red',
        score: 0,
    },
    [VERDICTS.PENDING]: {
        code: 'PD',
        name: 'Pending',
        description: 'Submission is waiting to be judged',
        color: 'gray',
        score: 0,
    },
    [VERDICTS.JUDGING]: {
        code: 'JD',
        name: 'Judging',
        description: 'Submission is being evaluated',
        color: 'blue',
        score: 0,
    },
    [VERDICTS.SYSTEM_ERROR]: {
        code: 'SE',
        name: 'System Error',
        description: 'Internal system error occurred',
        color: 'purple',
        score: 0,
    },
    [VERDICTS.SECURITY_ERROR]: {
        code: 'XE',
        name: 'Security Error',
        description: 'Code contains unsafe operations',
        color: 'red',
        score: 0,
    },
    [VERDICTS.FEATURE_UNSUPPORTED_IN_CLOUD]: {
        code: 'FUC',
        name: 'Feature Unsupported In Cloud',
        description: 'This judge feature is not available in cloud fallback mode',
        color: 'purple',
        score: 0,
    },
}

export const getVerdict = (code) => {
    if (!code) return VERDICT_META[VERDICTS.SYSTEM_ERROR]
    const normalized = code.toString().toUpperCase().replace(/\s+/g, '_')
    return VERDICT_META[normalized] || VERDICT_META[VERDICTS.SYSTEM_ERROR]
}

export const isAccepted = (verdict) => {
    if (!verdict) return false
    const v = verdict.toString().toUpperCase()
    return v === 'AC' || v === 'ACCEPTED'
}

export const isPending = (verdict) => {
    if (!verdict) return false
    const v = verdict.toString().toUpperCase()
    return v === 'PD' || v === 'PENDING' || v === 'JD' || v === 'JUDGING'
}

export const isError = (verdict) => {
    return !isAccepted(verdict) && !isPending(verdict)
}
