import React from 'react'
import { Input } from '@/components/ui/input'

const EditorSettings = ({ isSettingsOpen }) => {
    return (
        <aside
            className={`bg-bg-subtle/80 border-border z-modal lg:z-raised fixed top-16 right-0 h-[calc(100vh-64px)] w-[85vw] overflow-y-auto border-l p-6 backdrop-blur-xl transition-transform duration-300 sm:w-80 lg:translate-x-0 ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="space-y-8">
                <div>
                    <h3 className="font-display text-text-secondary mb-6 text-sm font-bold tracking-wide uppercase">
                        Post Configuration
                    </h3>

                    {/* Cover Image Upload */}
                    <div className="mb-8">
                        <label className="text-text-muted mb-3 block font-mono text-[10px] tracking-widest uppercase">
                            Cover Image
                        </label>
                        <div className="bg-bg-muted border-border group relative aspect-video cursor-pointer overflow-hidden rounded-xl border shadow-sm">
                            <div className="group-hover:bg-accent/5 absolute inset-0 flex flex-col items-center justify-center bg-black/5 opacity-100 transition-all">
                                <span className="material-symbols-outlined text-text-muted group-hover:text-accent mb-2 text-3xl transition-colors">
                                    upload_file
                                </span>
                                <p className="text-text-muted group-hover:text-accent font-mono text-[10px] font-bold transition-colors">
                                    UPLOAD IMAGE
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="mb-6 space-y-2">
                        <label className="text-text-muted mb-3 block font-mono text-[10px] tracking-widest uppercase">
                            Category
                        </label>
                        <div className="bg-accent-light border-accent/20 text-accent-text flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <span className="font-sans text-xs font-bold">Engineering</span>
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                        </div>
                        <div className="bg-bg-page border-border text-text-secondary hover:bg-bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-3 shadow-sm transition-colors">
                            <span className="font-sans text-xs font-bold">Tutorials</span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-6">
                        <label className="text-text-muted mb-3 block font-mono text-[10px] tracking-widest uppercase">
                            Tags
                        </label>
                        <div className="mb-3 flex flex-wrap gap-2">
                            {['React', 'Architecture'].map((tag) => (
                                <span
                                    key={tag}
                                    className="bg-bg-muted text-text-secondary border-border flex items-center gap-1 rounded border px-2 py-1 font-mono text-[10px]"
                                >
                                    {tag}{' '}
                                    <span className="material-symbols-outlined hover:text-error cursor-pointer text-[10px] transition-colors">
                                        close
                                    </span>
                                </span>
                            ))}
                        </div>
                        <div className="relative">
                            <Input
                                className="bg-bg-page border-border focus:ring-accent w-full rounded-lg px-3 py-2 pr-8 pl-3 text-xs shadow-sm transition-all outline-none focus:border-transparent focus:ring-2"
                                placeholder="Add tag..."
                                type="text"
                            />
                            <span className="text-text-muted material-symbols-outlined hover:text-accent absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-sm transition-colors">
                                add
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default EditorSettings
