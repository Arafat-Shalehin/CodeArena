'use client'

import { useEffect } from 'react'
import { Label } from '@/components/ui/label'

/**
 * AvatarSelector Component
 *
 * Grid of selectable avatar options with visual feedback.
 * Features:
 * - 5-column responsive grid
 * - Selected state with checkmark
 * - Hover effects
 * - DiceBear pixel-art integration
 *
 * @param {Object} props
 * @param {string} props.value - Current selected avatar seed
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of avatar seed strings
 */
const PREDEFINED_AVATARS = [
    'adventurer',
    'mage',
    'knight',
    'rogue',
    'cleric',
    'paladin',
    'bard',
    'druid',
    'ranger',
    'monk',
    'sorcerer',
    'warlock',
    'barbarian',
    'fighter',
    'wizard',
    'ninja',
    'pirate',
    'cowboy',
    'alien',
    'robot',
]

export default function AvatarSelector({ value, onChange, options = PREDEFINED_AVATARS }) {
    return (
        <div className="space-y-3">
            <Label className="text-text-primary block text-sm font-medium">Choose an Avatar</Label>
            <div className="grid grid-cols-5 gap-3">
                {options.map((seed) => {
                    const isSelected = value === seed
                    return (
                        <button
                            key={seed}
                            type="button"
                            onClick={() => onChange(seed)}
                            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                                isSelected
                                    ? 'border-accent ring-accent/20 bg-accent/5 ring-2'
                                    : 'border-border hover:border-text-muted/50 hover:bg-bg-subtle bg-bg-page'
                            }`}
                        >
                            <img
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`}
                                alt={seed}
                                className="h-full w-full object-cover p-1 select-none"
                                draggable={false}
                            />
                            {isSelected && (
                                <div className="bg-accent text-bg-page absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full">
                                    <svg
                                        className="h-2.5 w-2.5"
                                        viewBox="0 0 12 12"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="M2 6l3 3 5-5" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

AvatarSelector.displayName = 'AvatarSelector'
