'use client'

import React from 'react'

// Layout Split
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

// Internal Components
import CodeEditor from './CodeEditor'
import ExecutionConsole from './ExecutionConsole'
import WorkspaceToolbar from './WorkspaceToolbar'
import ActionFooter from './ActionFooter'

/**
 * CodeWorkspace Component
 * Handles the right side of the problem solver layout encompassing the Editor Toolbar,
 * the actual Monaco Editor instance, the collapsible Execution Console, and the Submit footer.
 *
 * @param {Object} props
 * @param {Object} props.problem - Problem initialization data
 */
export default function CodeWorkspace({ problem }) {
    if (!problem) return null

    return (
        <div className="flex h-full flex-col overflow-hidden bg-[#1e1e1e]">
            {/* Toolbar Top */}
            <WorkspaceToolbar />

            {/* Vertical Split Context for Code Area vs Console Area */}
            <ResizablePanelGroup direction="vertical" className="flex-1">
                {/* Monaco Editor Container */}
                <ResizablePanel defaultSize={70} minSize={20}>
                    <CodeEditor initialCode={problem.defaultCode} />
                </ResizablePanel>

                {/* Horizontal Divider */}
                <ResizableHandle className="bg-border/20 hover:bg-accent/50 group h-1 cursor-row-resize transition-colors">
                    <div className="bg-border group-hover:bg-accent my-auto h-px w-full" />
                </ResizableHandle>

                {/* Testcases & Execution Console */}
                <ResizablePanel defaultSize={30} minSize={20}>
                    <ExecutionConsole />
                </ResizablePanel>
            </ResizablePanelGroup>

            {/* Sticky Action Footer */}
            <ActionFooter />
        </div>
    )
}
