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
                title: 'MISSING DATA',
                text: 'Both Input and Expected Output are required for validation.',
                icon: 'warning',
                background: 'var(--ca-bg-page)',
                color: 'var(--ca-text-primary)',
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
            title: 'TESTCASE REGISTERED',
            showConfirmButton: false,
            timer: 1500,
            background: 'var(--ca-bg-page)',
            color: 'var(--ca-text-primary)',
        })
    }

    const removeTestcase = (id) => {
        setTestcases(testcases.filter((tc) => tc.id !== id))
    }

    return (
        <div className="mx-auto max-w-4xl space-y-10 py-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-text-primary text-3xl font-black tracking-tight uppercase italic">
                    Manage <span className="text-accent">Testcases</span>
                </h1>
                <p className="text-text-muted text-[10px] font-black tracking-widest uppercase opacity-70">
                    Operational validation data for problem engine
                </p>
            </header>

            {/* Input Section */}
            <div className="matte-surface border-border bg-bg-subtle/40 grid gap-8 rounded-3xl border p-10 shadow-2xl">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-text-muted ml-1 text-[10px] font-black tracking-widest uppercase opacity-70">
                            Input Sequence
                        </Label>
                        <Textarea
                            placeholder="e.g. [1, 2, 3, 4, 5]"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            className="bg-bg-page/50 border-border focus-visible:ring-accent/20 min-h-[140px] rounded-2xl p-4 font-mono text-sm font-bold shadow-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-text-muted ml-1 text-[10px] font-black tracking-widest uppercase opacity-70">
                            Expected Response
                        </Label>
                        <Textarea
                            placeholder="e.g. 15"
                            value={currentOutput}
                            onChange={(e) => setCurrentOutput(e.target.value)}
                            className="bg-bg-page/50 border-border focus-visible:ring-accent/20 min-h-[140px] rounded-2xl p-4 font-mono text-sm font-bold shadow-none"
                        />
                    </div>
                </div>

                <Button
                    onClick={addTestcase}
                    className="bg-accent hover:bg-accent/90 shadow-accent/20 h-14 w-full rounded-2xl text-[13px] font-black tracking-widest text-white uppercase shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-95"
                >
                    <Plus className="mr-3 h-5 w-5" /> APPEND TESTCASE TO SET
                </Button>
            </div>

            {/* Testcase List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-text-primary flex items-center gap-3 text-sm font-black tracking-widest uppercase italic">
                        <Database className="text-accent h-4 w-4" />
                        Operational Dataset
                    </h2>
                    <span className="bg-bg-subtle border-border text-text-muted rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase">
                        {testcases.length} ENTRIES
                    </span>
                </div>

                {testcases.length === 0 ? (
                    <div className="border-border bg-bg-subtle/20 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-20 text-center opacity-40">
                        <AlertCircle className="text-text-muted mb-4 h-12 w-12" />
                        <p className="text-[10px] font-black tracking-[0.2em] uppercase">
                            Dataset currently empty
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {testcases.map((tc, index) => (
                            <div
                                key={tc.id}
                                className="matte-surface border-border bg-bg-subtle/30 group overflow-hidden rounded-3xl border shadow-lg transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="border-border bg-bg-muted/10 flex items-center justify-between border-b px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-accent h-2 w-2 animate-pulse rounded-full" />
                                        <span className="text-text-primary text-[10px] font-black tracking-widest uppercase">
                                            Testcase Node #{index + 1}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeTestcase(tc.id)}
                                        className="text-text-muted transition-all hover:scale-110 hover:text-rose-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    <div className="border-border border-b p-6 md:border-r md:border-b-0">
                                        <p className="text-text-muted mb-3 text-[9px] font-black tracking-widest uppercase opacity-60">
                                            Input Data
                                        </p>
                                        <div className="bg-bg-page/50 border-border/50 rounded-xl border p-4">
                                            <pre className="custom-scrollbar overflow-x-auto font-mono text-xs leading-relaxed font-bold">
                                                {tc.input}
                                            </pre>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-text-muted mb-3 text-[9px] font-black tracking-widest uppercase opacity-60">
                                            Expected Output
                                        </p>
                                        <div className="bg-bg-page/50 border-border/50 rounded-xl border p-4">
                                            <pre className="custom-scrollbar overflow-x-auto font-mono text-xs leading-relaxed font-bold">
                                                {tc.output}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
