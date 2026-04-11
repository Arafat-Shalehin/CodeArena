import React from 'react'

const EditorSidebar = ({ isSidebarOpen }) => {
    const navItemClass =
        'flex items-center gap-3 px-4 py-3 font-mono uppercase tracking-widest text-[10px] transition-all cursor-pointer rounded-md'
    const activeNavItem = 'text-accent bg-accent-light border-r-2 border-accent'
    const inactiveNavItem =
        'text-text-secondary hover:text-text-primary hover:bg-bg-muted hover:translate-x-1'

    return (
        <aside
            className={`border-border bg-bg-subtle z-modal lg:z-raised fixed top-0 left-0 flex h-screen w-64 flex-col border-r pt-20 pb-6 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="mb-8 px-6">
                <div className="bg-bg-page border-border flex items-center gap-3 rounded-xl border p-3 shadow-sm">
                    <div className="bg-accent-light flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg">
                        <img
                            alt="Avatar"
                            className="h-full w-full object-cover"
                            src="https://ui-avatars.com/api/?background=02BA4C&color=FFFFFF&name=Technical+Blog"
                        />
                    </div>
                    <div>
                        <p className="text-accent font-mono text-[10px] tracking-widest uppercase">
                            Workspace
                        </p>
                        <p className="text-text-primary text-xs font-bold">Technical Blog</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-1 px-4">
                <div className={`${navItemClass} ${activeNavItem}`}>
                    <span className="material-symbols-outlined text-sm">description</span>
                    <span>Drafts</span>
                </div>
                <div className={`${navItemClass} ${inactiveNavItem}`}>
                    <span className="material-symbols-outlined text-sm">layers</span>
                    <span>Templates</span>
                </div>
                <div className={`${navItemClass} ${inactiveNavItem}`}>
                    <span className="material-symbols-outlined text-sm">image</span>
                    <span>Media</span>
                </div>
                <div className={`${navItemClass} ${inactiveNavItem}`}>
                    <span className="material-symbols-outlined text-sm">query_stats</span>
                    <span>Analytics</span>
                </div>
            </nav>

            <div className="mt-auto px-4">
                <button className="bg-accent-light border-accent/20 text-accent hover:bg-accent mb-4 w-full rounded-xl border py-3 font-mono text-[10px] font-bold tracking-widest uppercase transition-all hover:text-white">
                    New Post
                </button>
            </div>
        </aside>
    )
}

export default EditorSidebar
