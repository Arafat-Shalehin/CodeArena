// Language configurations for Docker execution
export const LANGUAGE_CONFIG = {
    cpp: {
        name: 'C++',
        extension: '.cpp',
        image: 'codearena-executor-cpp:latest',
        fileName: 'solution.cpp',
        compileRequired: true,
        defaultTimeLimit: 5000, // milliseconds
        defaultMemoryLimit: 512000, // KB
    },
    python: {
        name: 'Python',
        extension: '.py',
        image: 'codearena-executor-python:latest',
        fileName: 'solution.py',
        compileRequired: false,
        defaultTimeLimit: 5000,
        defaultMemoryLimit: 512000,
    },
    java: {
        name: 'Java',
        extension: '.java',
        image: 'codearena-executor-java:latest',
        fileName: 'Solution.java',
        compileRequired: true,
        defaultTimeLimit: 5000,
        defaultMemoryLimit: 512000,
    },
    javascript: {
        name: 'JavaScript',
        extension: '.js',
        image: 'codearena-executor-javascript:latest',
        fileName: 'solution.js',
        compileRequired: false,
        defaultTimeLimit: 5000,
        defaultMemoryLimit: 512000,
    },
};

export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CONFIG);

export const getLanguageConfig = (language) => {
    const config = LANGUAGE_CONFIG[language.toLowerCase()];
    if (!config) {
        throw new Error(`Unsupported language: ${language}`);
    }
    return config;
};

export const isLanguageSupported = (language) => {
    return SUPPORTED_LANGUAGES.includes(language.toLowerCase());
};
