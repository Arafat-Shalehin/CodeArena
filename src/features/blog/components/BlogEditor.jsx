'use client'

import React, { useState } from 'react'
import { EditorHeader, EditorSidebar, EditorContent, EditorSettings, EditorStatus } from './editor'

/**
 * BlogEditor — Main orchestration component for the technical blog editor.
 * Follows CodeArena Design System and feature-based architecture.
 */
const BlogEditor = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const [isSettingsOpen, setSettingsOpen] = useState(false)

    return (
        <div className="bg-bg-page text-text-primary selection:bg-accent/30 selection:text-accent-text min-h-screen font-sans">
            {/* --- Top Navigation --- */}
            <EditorHeader
                isSidebarOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isSettingsOpen={isSettingsOpen}
                setSettingsOpen={setSettingsOpen}
            />

            {/* --- Left Sidebar (Workspace) --- */}
            <EditorSidebar isSidebarOpen={isSidebarOpen} />

            {/* --- Main Editor Area --- */}
            <EditorContent isSidebarOpen={isSidebarOpen} isSettingsOpen={isSettingsOpen} />

            {/* --- Right Sidebar (Settings) --- */}
            <EditorSettings isSettingsOpen={isSettingsOpen} />

            {/* --- Floating Status Chip --- */}
            <EditorStatus isSettingsOpen={isSettingsOpen} />

            {/* Mobile Overlays for preventing interaction with main content when sidebars are open */}
            {(isSidebarOpen || isSettingsOpen) && (
                <div
                    className="z-overlay fixed inset-0 cursor-pointer bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => {
                        setSidebarOpen(false)
                        setSettingsOpen(false)
                    }}
                    aria-hidden="true"
                />
            )}
        </div>
    )
}

export default BlogEditor
