import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const EditorContent = ({ isSidebarOpen, isSettingsOpen }) => {
    return (
        <main
            className={`bg-bg-page min-h-screen pt-16 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0 lg:pl-64'} ${isSettingsOpen ? 'pr-80' : 'pr-0 lg:pr-80'}`}
        >
            <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-12">
                {/* Header Info */}
                <div className="mb-8 md:mb-12">
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                        <Badge
                            variant="secondary"
                            className="bg-accent-light text-accent-text border-accent/20 font-mono text-[10px] tracking-wider uppercase"
                        >
                            Unsaved Changes
                        </Badge>
                        <span className="text-text-muted font-mono text-[10px] tracking-widest uppercase">
                            Last edited 2m ago
                        </span>
                    </div>
                    <input
                        className="font-display placeholder:text-text-muted/30 text-text-primary w-full border-none bg-transparent p-0 text-3xl font-bold tracking-tighter outline-none focus:ring-0 md:text-5xl"
                        placeholder="The Art of Kinetic Architectures..."
                        type="text"
                    />
                </div>

                {/* Editor Input */}
                <div className="group relative">
                    {/* Tool Palette (Visible on hover on desktop) */}
                    <div className="absolute top-2 -left-12 hidden flex-col gap-4 opacity-0 transition-opacity group-hover:opacity-100 xl:flex">
                        <button className="text-text-muted hover:text-accent p-2 transition-colors">
                            <span className="material-symbols-outlined">add_circle</span>
                        </button>
                        <button className="text-text-muted hover:text-accent p-2 transition-colors">
                            <span className="material-symbols-outlined">image</span>
                        </button>
                        <button className="text-text-muted hover:text-accent p-2 transition-colors">
                            <span className="material-symbols-outlined">code</span>
                        </button>
                    </div>
                    <textarea
                        className="text-text-secondary placeholder:text-text-muted/30 min-h-[500px] w-full resize-none border-none bg-transparent p-0 font-sans text-lg leading-relaxed outline-none focus:ring-0"
                        placeholder="Start your technical journey here..."
                    />
                </div>
            </div>
        </main>
    )
}

export default EditorContent
