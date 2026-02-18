'use client';

import { useState } from 'react';

const SAMPLE_CODES = {
    python: `# Simple addition program
a, b = map(int, input().split())
print(a + b)`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
    java: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
    }
}`,
    javascript: `const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    const [a, b] = line.split(' ').map(Number);
    console.log(a + b);
    rl.close();
});`,
};

export default function DockerTestPage() {
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(SAMPLE_CODES.python);
    const [input, setInput] = useState('5 10');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState(null);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setCode(SAMPLE_CODES[lang]);
    };

    const checkSystemStatus = async () => {
        try {
            const response = await fetch('/api/evaluation/status');
            const data = await response.json();
            setSystemStatus(data);
        } catch (error) {
            console.error('Failed to check system status:', error);
            setSystemStatus({ success: false, error: error.message });
        }
    };

    const executeCode = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/evaluation/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    input,
                    timeLimit: 5000,
                    memoryLimit: 512000,
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const testWithTestCase = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/evaluation/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language,
                    testCase: {
                        input: input,
                        output: '15', // Expected output for 5 + 10
                    },
                    timeLimit: 5000,
                    memoryLimit: 512000,
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                error: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">Docker Code Execution Test</h1>
                <p className="text-gray-600 mb-8">
                    Test the Docker-based code execution system
                </p>

                {/* System Status */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">System Status</h2>
                        <button
                            onClick={checkSystemStatus}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Check Status
                        </button>
                    </div>

                    {systemStatus && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Docker:</span>
                                <span className={systemStatus.docker?.available ? 'text-green-600' : 'text-red-600'}>
                                    {systemStatus.docker?.available ? '✓ Available' : '✗ Not Available'}
                                </span>
                            </div>

                            {systemStatus.languages && (
                                <div className="mt-4">
                                    <p className="font-medium mb-2">Languages:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {systemStatus.languages.map((lang) => (
                                            <div
                                                key={lang.language}
                                                className={`p-2 rounded ${lang.ready ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {lang.name} {lang.ready ? '✓' : '✗'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Code Editor */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <div className="flex gap-2 flex-wrap">
                            {Object.keys(SAMPLE_CODES).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`px-4 py-2 rounded ${language === lang
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        }`}
                                >
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Code</label>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-64 p-3 border rounded font-mono text-sm"
                            spellCheck="false"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Input</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-24 p-3 border rounded font-mono text-sm"
                            placeholder="Enter input here..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={executeCode}
                            disabled={loading}
                            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                        >
                            {loading ? 'Executing...' : 'Execute Code'}
                        </button>

                        <button
                            onClick={testWithTestCase}
                            disabled={loading}
                            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
                        >
                            {loading ? 'Testing...' : 'Test (Expected: 15)'}
                        </button>
                    </div>
                </div>

                {/* Results */}
                {result && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Result</h2>

                        {result.success ? (
                            <div className="space-y-4">
                                {result.result && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">Verdict:</span>
                                            <span
                                                className={`px-3 py-1 rounded ${result.result.verdict === 'SUCCESS' || result.result.verdict === 'ACCEPTED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : result.result.verdict === 'WRONG_ANSWER'
                                                        ? 'bg-red-100 text-red-800'
                                                        : result.result.verdict === 'TIME_LIMIT_EXCEEDED'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {result.result.verdict}
                                            </span>
                                        </div>

                                        {result.result.executionTime !== undefined && (
                                            <div>
                                                <span className="font-medium">Execution Time:</span>{' '}
                                                {result.result.executionTime}ms
                                            </div>
                                        )}

                                        {result.result.memoryUsed !== undefined && (
                                            <div>
                                                <span className="font-medium">Memory Used:</span>{' '}
                                                {result.result.memoryUsed}KB
                                            </div>
                                        )}

                                        {result.result.output && (
                                            <div>
                                                <p className="font-medium mb-2">Output:</p>
                                                <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                                                    {result.result.output}
                                                </pre>
                                            </div>
                                        )}

                                        {result.result.actualOutput && (
                                            <div>
                                                <p className="font-medium mb-2">Actual Output:</p>
                                                <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                                                    {result.result.actualOutput}
                                                </pre>
                                            </div>
                                        )}

                                        {result.result.error && (
                                            <div>
                                                <p className="font-medium mb-2 text-red-600">Error:</p>
                                                <pre className="bg-red-50 p-3 rounded overflow-x-auto text-red-800">
                                                    {result.result.error}
                                                </pre>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-red-50 text-red-800 p-4 rounded">
                                <p className="font-medium">Error:</p>
                                <p>{result.error || 'Failed to execute code'}</p>
                                {result.message && <p className="mt-2 text-sm">{result.message}</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
