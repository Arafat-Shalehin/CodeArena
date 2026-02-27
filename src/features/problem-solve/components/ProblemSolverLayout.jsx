'use client'

import React from 'react'

// Internal Components
import DescriptionPanel from './DescriptionPanel'
import CodeWorkspace from './CodeWorkspace'

// Shadcn Components
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

// Problem Data (Mock)
import { PLACEHOLDER_PROBLEM } from '@/features/problem-solve/data/placeholder-problem.data'

/**
 * ProblemSolverLayout Component
 * Orchestrates the split-pane layout for the problem-solving environment.
 * Left Panel: Problem Description
 * Right Panel: Code Workspace
 */
export default function ProblemSolverLayout() {
    // Retrieve full mock data (Imagine a fetch operation here based on router ID)
    const problem = PLACEHOLDER_PROBLEM

    return (
        <div className="bg-bg-page flex h-[calc(100vh-theme(spacing.16))] flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
                {/* LEFT PANEL: Description (60% default) */}
                <ResizablePanel defaultSize={50} minSize={30}>
                    <DescriptionPanel problem={problem} />
                </ResizablePanel>

                {/* RESIZABLE DIVIDER (Handle) */}
                <ResizableHandle className="hover:bg-accent/50 group w-1 cursor-col-resize bg-transparent transition-colors">
                    <div className="bg-border group-hover:bg-accent mx-auto h-full w-px" />
                </ResizableHandle>

                {/* RIGHT PANEL: Editor & Results (40% default) */}
                <ResizablePanel defaultSize={50} minSize={30}>
                    <CodeWorkspace problem={problem} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
