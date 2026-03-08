'use client'

import { useState } from 'react'
import { Plus, Trash2, Database, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Swal from 'sweetalert2'

export default function TestcaseManager() {
    const [testcases, setTestcases] = useState([])
    const [currentInput, setCurrentInput] = useState('')
    const [currentOutput, setCurrentOutput] = useState('')

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
        setCurrentInput('')
        setCurrentOutput('')

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Testcase added',
            showConfirmButton: false,
            timer: 1500,
        })
    }

    const removeTestcase = (id) => {
        setTestcases(testcases.filter((tc) => tc.id !== id))
    }

    return (
        // mx-auto এবং max-w-2xl দিয়ে মাঝখানে আনা হয়েছে
        <div className="mx-auto max-w-2xl space-y-6 p-4">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-3">
                <Database className="h-5 w-5 text-slate-600" />
                <h1 className="text-xl font-bold text-slate-800">Manage Testcases</h1>
            </div>

            {/* ইনপুট সেকশন - বর্ডার গ্রে করা হয়েছে */}
            <div className="grid gap-4 rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
                <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">Input Data</Label>
                    <Textarea
                        placeholder="Enter input here..."
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        className="min-h-[120px] border-slate-300 font-mono text-sm focus:border-emerald-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="font-semibold text-slate-700">Expected Output</Label>
                    <Textarea
                        placeholder="Enter expected output..."
                        value={currentOutput}
                        onChange={(e) => setCurrentOutput(e.target.value)}
                        className="min-h-[100px] border-slate-300 font-mono text-sm focus:border-emerald-500"
                    />
                </div>

                <Button
                    onClick={addTestcase}
                    className="h-11 w-full gap-2 bg-[#00bc7d] font-semibold text-white hover:bg-[#00a870]"
                >
                    <Plus className="h-5 w-5" /> Add Testcase to List
                </Button>
            </div>

            {/* টেস্টকেস লিস্ট - বর্ডার গ্রে করা হয়েছে */}
            <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-sm font-bold tracking-widest text-slate-500 uppercase">
                    Testcase List{' '}
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">
                        {testcases.length}
                    </span>
                </h2>

                {testcases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 py-12 text-slate-400">
                        <AlertCircle className="mb-2 h-10 w-10 opacity-30" />
                        <p className="font-medium">No testcases added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {testcases.map((tc, index) => (
                            <Card
                                key={tc.id}
                                className="overflow-hidden border-slate-300 shadow-sm"
                            >
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between border-b border-slate-300 bg-slate-50 px-4 py-2">
                                        <span className="text-xs font-bold text-slate-600 uppercase">
                                            Testcase #{index + 1}
                                        </span>
                                        <button
                                            onClick={() => removeTestcase(tc.id)}
                                            className="p-1 text-slate-400 transition-colors hover:text-rose-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-slate-300 bg-white">
                                        <div className="p-4">
                                            <p className="mb-2 text-[10px] font-bold text-slate-400 uppercase">
                                                Input
                                            </p>
                                            <pre className="overflow-x-auto rounded border border-slate-200 bg-slate-50 p-2 font-mono text-xs">
                                                {tc.input}
                                            </pre>
                                        </div>
                                        <div className="p-4">
                                            <p className="mb-2 text-[10px] font-bold text-slate-400 uppercase">
                                                Expected Output
                                            </p>
                                            <pre className="overflow-x-auto rounded border border-slate-400 bg-slate-50 p-2 font-mono text-xs">
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
