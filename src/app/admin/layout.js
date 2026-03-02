// app/admin/layout.js
import Sidebar from '@/components/admin/Sidebar'

export default function AdminLayout({ children }) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar Component */}
            <Sidebar />

            <div className="flex flex-1 flex-col">
                {/* Modern Top Header */}
                <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                        <h1 className="text-lg font-semibold text-gray-700 italic">
                            CodeArena Control Center
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm leading-none font-bold text-gray-800">
                                Admin Team Leader
                            </p>
                            <p className="text-xs font-medium text-green-600">
                                Root Access [cite: 175]
                            </p>
                        </div>
                        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-green-500 bg-slate-200">
                            <img src="/api/placeholder/40/40" alt="admin" />
                        </div>
                    </div>
                </header>

                {/* Scrollable Main Content */}
                <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    )
}
