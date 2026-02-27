import React from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

/**
 * ProfilePictureCard Component
 * Provides a user interface for selecting the user's avatar seed from predefined dicebear pixel art options.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.avatarSeed - The currently selected avatar seed string.
 * @param {Function} props.onSelectSeed - Callback function triggered when an avatar seed is clicked.
 * @param {Array<string>} props.predefinedAvatars - Array of strings containing the avatar seed options.
 * @returns {React.JSX.Element} The rendered profile picture selection card.
 */
export default function ProfilePictureCard({ avatarSeed, onSelectSeed, predefinedAvatars = [] }) {
    return (
        <Card className="p-6">
            <h3 className="text-text-primary mb-6 text-lg font-semibold">Profile Picture</h3>
            <div className="space-y-4">
                <Label className="text-text-primary block text-sm font-medium">
                    Choose an Avatar
                </Label>
                <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                    {predefinedAvatars.map((seed) => {
                        const isSelected = avatarSeed === seed
                        return (
                            <button
                                key={seed}
                                type="button"
                                onClick={() => onSelectSeed(seed)}
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
        </Card>
    )
}
