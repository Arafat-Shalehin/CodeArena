import React from 'react'
import { Check, X, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DashboardLeftSidebar({
    user,
    isEditingGoal,
    setIsEditingGoal,
    newGoal,
    setNewGoal,
    handleUpdateGoal,
}) {
    return (
        <aside className="no-scrollbar hidden flex-col gap-6 pt-8 pr-1 pb-8 lg:sticky lg:top-20 lg:col-span-3 lg:flex lg:h-fit">
            {/* Quick Stats Card */}
            <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
                <p className="text-text-muted mb-4 text-xs font-bold tracking-wider uppercase">
                    Your Stats
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-text-primary text-2xl font-bold">
                            {user?.stats?.globalRank || 'N/A'}
                        </p>
                        <p className="text-text-muted text-[10px] font-medium uppercase">
                            Global Rank
                        </p>
                    </div>
                    <div>
                        <p className="text-accent text-2xl font-bold">
                            {user?.stats?.accepted || 0}
                        </p>
                        <p className="text-text-muted text-[10px] font-medium uppercase">Solved</p>
                    </div>
                </div>
                <div className="border-border mt-6 border-t pt-4">
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-text-secondary font-medium">Weekly Goal</span>
                        <div className="flex items-center gap-2">
                            {isEditingGoal ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        value={newGoal}
                                        onChange={(e) => setNewGoal(e.target.value)}
                                        className="bg-bg-muted border-border w-12 rounded border px-1 text-center text-xs font-bold"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleUpdateGoal}
                                        className="text-success transition-transform hover:scale-110"
                                    >
                                        <Check className="h-3 w-3" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingGoal(false)
                                            setNewGoal(user?.stats?.weeklyGoal || 10)
                                        }}
                                        className="text-error transition-transform hover:scale-110"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-text-primary font-bold">
                                        {user?.stats?.accepted || 0}/{user?.stats?.weeklyGoal || 10}
                                    </span>
                                    <button
                                        onClick={() => setIsEditingGoal(true)}
                                        className="text-text-muted hover:text-accent transition-colors"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="bg-border h-1.5 w-full overflow-hidden rounded-full">
                        <div
                            className="bg-accent h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(100, ((user?.stats?.accepted || 0) / (user?.stats?.weeklyGoal || 10)) * 100)}%`,
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Followed Topics */}
            <div className="flex flex-col gap-3">
                <p className="text-text-muted px-3 text-xs font-bold tracking-wider uppercase">
                    Followed Topics
                </p>
                <div className="flex flex-wrap gap-2 px-3">
                    {['#algorithms', '#react', '#system_design', '#python'].map((tag) => (
                        <span
                            key={tag}
                            className="bg-bg-muted text-text-secondary hover:text-text-primary cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </aside>
    )
}
