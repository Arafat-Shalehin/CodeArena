'use client'

import { useState } from 'react'
import { Plus, Trash2, Database, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Swal from 'sweetalert2'

export default function TestcaseManager() {
    // টেস্টকেসের লিস্ট মেইনটেইন করার জন্য স্টেট
    const [testcases, setTestcases] = useState([])
    const [currentInput, setCurrentInput] = useState('')
    const [currentOutput, setCurrentOutput] = useState('')

    // নতুন টেস্টকেস লিস্টে যোগ করা
    const addTestcase = () => {
        if (!currentInput.trim() || !currentOutput.trim()) {
            return Swal.fire({
                title: 'Missing Fields',
                text: 'Both Input and Expected Output are required.',
                icon: 'warning',
                confirmButtonColor: '#00bc7d',
            })
        }

        const newTestcase = {
            id: Date.now(),
            input: currentInput,
            output: currentOutput,
        }

        setTestcases([...testcases, newTestcase])

        // ইনপুট ফিল্ড খালি করে দেওয়া
        setCurrentInput('')
        setCurrentOutput('')

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Testcase added to list',
            showConfirmButton: false,
            timer: 1500,
        })
    }

    // লিস্ট থেকে কোনো টেস্টকেস মুছে ফেলা
    const removeTestcase = (id) => {
        setTestcases(testcases.filter((tc) => tc.id !== id))
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-2 border-b pb-2">
                <Database className="h-5 w-5 text-emerald-600" />
                <h1 className="text-xl font-bold text-slate-800">Manage Testcases</h1>
            </div>

            {/* ইনপুট সেকশন */}
            <div className="grid gap-4 rounded-lg border bg-slate-50/50 p-4 shadow-sm">
                <div className="space-y-2">
                    <Label className="font-semibold">Input Data</Label>
                    <Textarea
                        placeholder="e.g. 4 5\n10100..."
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        className="min-h-[100px] bg-white font-mono text-sm"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="font-semibold">Expected Output</Label>
                    <Textarea
                        placeholder="e.g. 4"
                        value={currentOutput}
                        onChange={(e) => setCurrentOutput(e.target.value)}
                        className="min-h-[80px] bg-white font-mono text-sm"
                    />
                </div>

                <Button
                    onClick={addTestcase}
                    className="w-full gap-2 bg-[#00bc7d] text-white hover:bg-[#00a870]"
                >
                    <Plus className="h-4 w-4" /> Add to List
                </Button>
            </div>

            {/* টেস্টকেস লিস্ট ডিসপ্লে */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium tracking-wider text-slate-500 uppercase">
                    Added Testcases ({testcases.length})
                </h2>

                {testcases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 py-10 text-slate-400">
                        <AlertCircle className="mb-2 h-8 w-8 opacity-20" />
                        <p>No testcases added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {testcases.map((tc, index) => (
                            <Card key={tc.id} className="overflow-hidden border-slate-200">
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between border-b bg-slate-100 px-4 py-2">
                                        <span className="text-sm font-bold text-slate-600">
                                            Testcase #{index + 1}
                                        </span>
                                        <button
                                            onClick={() => removeTestcase(tc.id)}
                                            className="text-rose-500 transition-colors hover:text-rose-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x bg-white">
                                        <div className="p-3">
                                            <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                                                Input
                                            </p>
                                            <pre className="truncate rounded bg-slate-50 p-2 font-mono text-xs">
                                                {tc.input}
                                            </pre>
                                        </div>
                                        <div className="p-3">
                                            <p className="mb-1 text-[10px] font-bold text-slate-400 uppercase">
                                                Output
                                            </p>
                                            <pre className="truncate rounded bg-slate-50 p-2 font-mono text-xs">
                                                {tc.output}
                                            </pre>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
