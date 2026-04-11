import React from 'react'
import { Button } from '@/components/ui/button'

const EditorHeader = ({ isSidebarOpen, setSidebarOpen, isSettingsOpen, setSettingsOpen }) => {
    return (
        <header className="z-sticky bg-bg-page/60 border-border fixed top-0 h-16 w-full border-b shadow-sm backdrop-blur-xl">
            <div className="flex h-full items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="text-text-secondary hover:text-accent p-2 transition-colors lg:hidden"
                        aria-label="Toggle Workspace Sidebar"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    <span className="text-accent font-display text-xl font-bold tracking-tighter md:text-2xl">
                        CodeArena
                    </span>

                    <nav className="font-display hidden gap-6 text-sm tracking-tight md:flex">
                        <a className="text-accent border-accent border-b-2 pb-1 font-bold" href="#">
                            Editor
                        </a>
                        <a
                            className="text-text-secondary hover:text-accent font-medium transition-colors"
                            href="#"
                        >
                            Preview
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <Button
                        variant="ghost"
                        className="text-text-secondary hover:text-accent inline-flex h-9 px-3 font-medium"
                    >
                        <span className="material-symbols-outlined text-lg sm:hidden">save</span>
                        <span className="hidden sm:inline">Save Draft</span>
                    </Button>
                    <Button className="bg-accent hover:bg-accent-hover shadow-accent-glow h-9 rounded-full px-4 text-xs text-white md:px-6 md:text-sm">
                        Publish
                    </Button>

                    <div className="bg-border mx-1 h-8 w-[1px] md:mx-2"></div>

                    <button
                        onClick={() => setSettingsOpen(!isSettingsOpen)}
                        className="text-text-secondary hover:text-accent p-2 transition-colors lg:hidden"
                        aria-label="Toggle Settings Sidebar"
                    >
                        <span className="material-symbols-outlined">settings</span>
                    </button>

                    <span
                        className="material-symbols-outlined text-text-secondary hover:text-accent hidden cursor-pointer sm:block"
                        data-icon="account_circle"
                    >
                        account_circle
                    </span>
                </div>
            </div>
        </header>
    )
}

export default EditorHeader
