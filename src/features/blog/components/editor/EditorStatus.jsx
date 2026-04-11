import React from 'react'

const EditorStatus = ({ isSettingsOpen }) => {
    return (
        <div
            className={`z-overlay fixed right-6 bottom-6 transition-all duration-300 lg:right-88 ${isSettingsOpen ? 'lg:mr-80' : ''}`}
        >
            <div className="bg-accent shadow-accent-glow border-accent/20 flex items-center gap-2 rounded-full border px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
                <span className="font-mono text-[10px] font-bold tracking-widest text-white uppercase">
                    Autosave Active
                </span>
            </div>
        </div>
    )
}

export default EditorStatus
