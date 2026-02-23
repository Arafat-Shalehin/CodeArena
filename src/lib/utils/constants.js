// Application constants
export const APP_NAME = 'CodeArena';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'AI-Powered Competitive Coding & Interview Preparation Platform';

// API endpoints
export const API_ROUTES = {
    EXECUTE: '/api/evaluation/execute',
    JUDGE: '/api/evaluation/judge',
    TEST: '/api/evaluation/test',
    STATUS: '/api/evaluation/status',
};

// Execution defaults
export const EXECUTION_DEFAULTS = {
    TIME_LIMIT: 5000, // milliseconds
    MEMORY_LIMIT: 512000, // KB
    MAX_SOURCE_SIZE: 65536, // bytes (64KB)
    MAX_OUTPUT_SIZE: 10485760, // bytes (10MB)
};

// Problem difficulty levels
export const DIFFICULTY_LEVELS = {
    EASY: { name: 'Easy', color: 'green', value: 1 },
    MEDIUM: { name: 'Medium', color: 'yellow', value: 2 },
    HARD: { name: 'Hard', color: 'red', value: 3 },
};

// Comparison modes
export const COMPARISON_MODES = {
    EXACT: 'exact',
    TOKEN: 'token',
    FLOAT: 'float',
    LINE: 'line',
    CUSTOM: 'custom',
};

// User roles
export const USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest',
};

// Contest status
export const CONTEST_STATUS = {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    ENDED: 'ended',
};

// Submission status (for UI)
export const SUBMISSION_STATUS = {
    PENDING: { name: 'Pending', color: 'gray' },
    JUDGING: { name: 'Judging', color: 'blue' },
    ACCEPTED: { name: 'Accepted', color: 'green' },
    WRONG_ANSWER: { name: 'Wrong Answer', color: 'red' },
    TIME_LIMIT_EXCEEDED: { name: 'Time Limit Exceeded', color: 'orange' },
    MEMORY_LIMIT_EXCEEDED: { name: 'Memory Limit Exceeded', color: 'orange' },
    RUNTIME_ERROR: { name: 'Runtime Error', color: 'red' },
    COMPILATION_ERROR: { name: 'Compilation Error', color: 'red' },
    SYSTEM_ERROR: { name: 'System Error', color: 'purple' },
};

// Language display names
export const LANGUAGE_NAMES = {
    cpp: 'C++',
    python: 'Python',
    java: 'Java',
    javascript: 'JavaScript',
    go: 'Go',
};

// Default code templates
export const CODE_TEMPLATES = {
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
    python: `# Write your code here

`,
    java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your code here
        
    }
}`,
    javascript: `// Write your code here
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
});

let input = [];
rl.on('line', (line) => {
    input.push(line);
});

rl.on('close', () => {
    // Write your solution here
    
});`,
    go: `package main

import "fmt"

func main() {
    // Write your code here
    
}`,
};
