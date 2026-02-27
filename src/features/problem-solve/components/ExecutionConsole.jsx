'use client'

import React from 'react'
import { CheckCircle, ChevronDown } from 'lucide-react'

// Shadcn Tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ExecutionConsole() {
    return (
        <div className="bg-bg-subtle border-border flex h-full flex-col overflow-hidden border-t">
            {/* Header Result Line */}
            <div className="bg-bg-page border-border flex shrink-0 items-center justify-between border-b px-4 py-2">
                <div className="flex items-center gap-4">
                    <button className="text-success flex items-center gap-1.5 text-sm font-semibold focus:outline-none">
                        <CheckCircle size={16} />
                        Accepted
                    </button>
                    <div className="bg-border my-auto h-4 w-px" />
                    <div className="text-text-muted flex items-center gap-4 text-xs">
                        <span>
                            Runtime:{' '}
                            <span className="text-text-primary font-mono font-medium">42 ms</span>
                        </span>
                        <span>
                            Memory:{' '}
                            <span className="text-text-primary font-mono font-medium">16.1 MB</span>
                        </span>
                    </div>
                </div>

                {/* Optional Expand Toggle */}
                <button className="hover:bg-bg-subtle text-text-muted rounded p-1 transition-colors">
                    <ChevronDown size={18} />
                </button>
            </div>

            {/* Console Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Use Tabs for Testcases like the mockup logic */}
                <Tabs defaultValue="case1" className="w-full">
                    <TabsList className="mb-4 flex h-auto items-center justify-start gap-2 bg-transparent p-0">
                        <TabsTrigger
                            value="case1"
                            className="bg-bg-muted text-text-primary data-[state=active]:bg-bg-muted rounded-md px-3 py-1.5 text-xs font-semibold"
                        >
                            Case 1
                        </TabsTrigger>
                        <TabsTrigger
                            value="case2"
                            className="text-text-muted hover:text-text-primary data-[state=active]:bg-bg-muted data-[state=active]:text-text-primary rounded-md px-3 py-1.5 text-xs font-semibold shadow-none"
                        >
                            Case 2
                        </TabsTrigger>
                        <TabsTrigger
                            value="case3"
                            className="text-text-muted hover:text-text-primary data-[state=active]:bg-bg-muted data-[state=active]:text-text-primary rounded-md px-3 py-1.5 text-xs font-semibold shadow-none"
                        >
                            Case 3
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="case1" className="m-0 space-y-4 outline-none">
                        {/* Input Box */}
                        <div className="space-y-1.5">
                            <label className="text-text-muted text-[11px] font-bold tracking-wide uppercase">
                                Input
                            </label>
                            <div className="bg-bg-page border-border text-text-primary rounded-md border p-3 font-mono text-xs tracking-wide">
                                nums = [2,7,11,15], target = 9
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {/* Output Box */}
                            <div className="flex-1 space-y-1.5">
                                <label className="text-text-muted text-[11px] font-bold tracking-wide uppercase">
                                    Output
                                </label>
                                <div className="bg-bg-page border-border text-success rounded-md border p-3 font-mono text-xs tracking-wide">
                                    [0,1]
                                </div>
                            </div>

                            {/* Expected Box */}
                            <div className="flex-1 space-y-1.5">
                                <label className="text-text-muted text-[11px] font-bold tracking-wide uppercase">
                                    Expected
                                </label>
                                <div className="bg-bg-page border-border text-text-primary rounded-md border p-3 font-mono text-xs tracking-wide">
                                    [0,1]
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="case2" className="text-text-muted outline-none">
                        Case 2 details coming soon...
                    </TabsContent>

                    <TabsContent value="case3" className="text-text-muted outline-none">
                        Case 3 details coming soon...
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
