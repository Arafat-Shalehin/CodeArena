'use client'

import { Edit2, Check, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function QuickStatsCard({ user, onUpdateGoal }) {
    const [isEditingGoal, setIsEditingGoal] = useState(false)
    const [newGoal, setNewGoal] = useState(user?.stats?.weeklyGoal || 10)

    const handleUpdateGoal = () => {
        onUpdateGoal(parseInt(newGoal))
        setIsEditingGoal(false)
    }

    const goalProgress = Math.min(
        100,
        ((user?.stats?.accepted || 0) / (user?.stats?.weeklyGoal || 10)) * 100
    )

    return (
        <div className="bg-bg-subtle border-border rounded-lg border p-6 shadow-sm">
            <p className="text-text-muted mb-4 text-xs font-bold tracking-wider uppercase">
                Your Stats
            </p>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-text-primary text-2xl font-bold">
                        {user?.stats?.globalRank || 'N/A'}
                    </p>
                    <p className="text-text-muted text-[10px] font-medium uppercase">Global Rank</p>
                </div>
                <div>
                    <p className="text-accent text-2xl font-bold">{user?.stats?.accepted || 0}</p>
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
                        style={{ width: `${goalProgress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    )
}
