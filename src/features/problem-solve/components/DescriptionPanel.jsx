'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Icons
import { FileText, MessageSquare, Lock } from 'lucide-react'

// Internal Components
import DescriptionContent from './DescriptionContent'

/**
 * DescriptionPanel Component
 * Handles the left side of the solver layout. Dislays the problem tabs
 * (Description, Discussion, Solutions) and the primary problem content.
 *
 * @param {Object} props
 * @param {Object} props.problem - The mock or fetched problem data object
 */
export default function DescriptionPanel({ problem }) {
    if (!problem) return null

    return (
        <div className="bg-bg-page flex h-full flex-col overflow-hidden">
            <Tabs defaultValue="description" className="flex h-full flex-col">
                {/* Header / Tabs Row */}
                <div className="border-border bg-bg-subtle flex shrink-0 border-b">
                    <TabsList className="flex h-auto w-full justify-start rounded-none bg-transparent p-0">
                        {/* Description Tab */}
                        <TabsTrigger
                            value="description"
                            className="text-text-muted data-[state=active]:border-accent data-[state=active]:text-text-primary flex items-center gap-2 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-semibold data-[state=active]:shadow-none"
                        >
                            <FileText size={18} />
                            Description
                        </TabsTrigger>

                        {/* Discussion Tab */}
                        <TabsTrigger
                            value="discussion"
                            className="text-text-muted hover:text-text-primary data-[state=active]:border-accent data-[state=active]:text-text-primary flex items-center gap-2 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium data-[state=active]:shadow-none"
                        >
                            <MessageSquare size={18} />
                            Discussion
                        </TabsTrigger>

                        {/* Solutions Tab */}
                        <TabsTrigger
                            value="solutions"
                            className="text-text-muted data-[state=active]:border-accent data-[state=active]:text-text-primary flex items-center gap-2 rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium data-[state=active]:shadow-none"
                        >
                            <Lock size={18} />
                            Solutions
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Content Area (Scrollable) */}
                <div className="flex-1 overflow-y-auto">
                    <TabsContent
                        value="description"
                        className="m-0 h-full border-none p-0 outline-none"
                    >
                        <DescriptionContent problem={problem} />
                    </TabsContent>

                    <TabsContent value="discussion" className="m-0 h-full p-6 outline-none">
                        <div className="text-text-muted flex h-full items-center justify-center">
                            Discussion forum coming soon...
                        </div>
                    </TabsContent>

                    <TabsContent value="solutions" className="m-0 h-full p-6 outline-none">
                        <div className="text-text-muted flex h-full items-center justify-center">
                            Unlock official solutions (Premium feature).
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
