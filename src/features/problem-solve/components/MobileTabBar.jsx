import React from 'react'

export default function MobileTabBar({ mobileActivePanel, setMobileActivePanel }) {
    return (
        <div className="border-border bg-bg-subtle fixed right-0 bottom-0 left-0 flex h-14 shrink-0 items-center justify-around border-t px-2 sm:hidden">
            <button
                onClick={() => setMobileActivePanel('description')}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 transition-colors ${
                    mobileActivePanel === 'description'
                        ? 'bg-bg-muted text-accent'
                        : 'text-text-muted'
                }`}
                aria-label="Show description panel"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <span className="text-[10px] font-medium">Problem</span>
            </button>
            <button
                onClick={() => setMobileActivePanel('editor')}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 transition-colors ${
                    mobileActivePanel === 'editor' ? 'bg-bg-muted text-accent' : 'text-text-muted'
                }`}
                aria-label="Show code editor"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                </svg>
                <span className="text-[10px] font-medium">Code</span>
            </button>
            <button
                onClick={() => setMobileActivePanel('console')}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 transition-colors ${
                    mobileActivePanel === 'console' ? 'bg-bg-muted text-accent' : 'text-text-muted'
                }`}
                aria-label="Show console"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                </svg>
                <span className="text-[10px] font-medium">Console</span>
            </button>
        </div>
    )
}
