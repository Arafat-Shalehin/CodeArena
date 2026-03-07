'use client'

import { useState } from 'react'

export default function TestcaseManager() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')

    const addTestcase = () => {
        console.log({
            input,
            output,
        })
    }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">Manage Testcases</h1>

            <textarea
                placeholder="Input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded border p-2"
            />

            <textarea
                placeholder="Expected Output"
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                className="w-full rounded border p-2"
            />

            <button onClick={addTestcase} className="rounded bg-[#00bc7d] px-4 py-2 text-white">
                Add Testcase
            </button>
        </div>
    )
}
