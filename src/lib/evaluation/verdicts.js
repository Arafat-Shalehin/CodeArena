// Verdict constants for submission evaluation
export const VERDICTS = {
    // Success
    ACCEPTED: {
        code: 'AC',
        name: 'Accepted',
        description: 'Solution is correct',
        color: 'green',
        score: 100,
    },

    // Errors
    WRONG_ANSWER: {
        code: 'WA',
        name: 'Wrong Answer',
        description: 'Output does not match expected output',
        color: 'red',
        score: 0,
    },

    TIME_LIMIT_EXCEEDED: {
        code: 'TLE',
        name: 'Time Limit Exceeded',
        description: 'Program execution exceeded time limit',
        color: 'orange',
        score: 0,
    },

    MEMORY_LIMIT_EXCEEDED: {
        code: 'MLE',
        name: 'Memory Limit Exceeded',
        description: 'Program used more memory than allowed',
        color: 'orange',
        score: 0,
    },

    RUNTIME_ERROR: {
        code: 'RE',
        name: 'Runtime Error',
        description: 'Program crashed during execution',
        color: 'red',
        score: 0,
    },

    COMPILATION_ERROR: {
        code: 'CE',
        name: 'Compilation Error',
        description: 'Code failed to compile',
        color: 'red',
        score: 0,
    },

    // System
    PENDING: {
        code: 'PD',
        name: 'Pending',
        description: 'Submission is waiting to be judged',
        color: 'gray',
        score: 0,
    },

    JUDGING: {
        code: 'JD',
        name: 'Judging',
        description: 'Submission is being evaluated',
        color: 'blue',
        score: 0,
    },

    SYSTEM_ERROR: {
        code: 'SE',
        name: 'System Error',
        description: 'Internal system error occurred',
        color: 'purple',
        score: 0,
    },

    SECURITY_ERROR: {
        code: 'XE',
        name: 'Security Error',
        description: 'Code contains unsafe operations',
        color: 'red',
        score: 0,
    },
};

export const getVerdict = (code) => {
    const verdictKey = Object.keys(VERDICTS).find(
        key => VERDICTS[key].code === code || key === code
    );
    return verdictKey ? VERDICTS[verdictKey] : VERDICTS.SYSTEM_ERROR;
};

export const isAccepted = (verdict) => {
    return verdict === 'AC' || verdict === 'ACCEPTED';
};

export const isPending = (verdict) => {
    return verdict === 'PD' || verdict === 'PENDING' || verdict === 'JD' || verdict === 'JUDGING';
};

export const isError = (verdict) => {
    return !isAccepted(verdict) && !isPending(verdict);
};
