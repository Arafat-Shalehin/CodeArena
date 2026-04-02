'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Globe, Users, Lock, BarChart3 } from 'lucide-react'

function ToggleSwitch({ checked, onChange, label, description }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-text-primary font-medium">{label}</p>
                {description && <p className="text-text-muted text-sm">{description}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    checked ? 'bg-accent' : 'bg-bg-muted'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    )
}

function RadioOption({ selected, onChange, value, label, description, icon: Icon }) {
    return (
        <div
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={() => onChange(value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChange(value)
                }
            }}
            className={`cursor-pointer rounded-lg border p-4 transition-all ${
                selected
                    ? 'border-accent bg-accent/5 ring-accent/20 ring-1'
                    : 'border-border hover:border-accent/50'
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors ${
                        selected ? 'border-accent bg-accent' : 'border-text-muted'
                    }`}
                >
                    {selected && (
                        <div
                            className="h-full w-full rounded-full bg-white"
                            style={{ transform: 'scale(0.5)' }}
                        />
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {Icon && (
                        <Icon size={18} className={selected ? 'text-accent' : 'text-text-muted'} />
                    )}
                    <div>
                        <p className="text-text-primary font-medium">{label}</p>
                        {description && <p className="text-text-muted text-sm">{description}</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

const VISIBILITY_OPTIONS = [
    {
        value: 'public',
        label: 'Public',
        description: 'Anyone can view your profile and stats',
        icon: Globe,
    },
    {
        value: 'followers',
        label: 'Followers Only',
        description: 'Only your followers can see your full profile',
        icon: Users,
    },
    {
        value: 'private',
        label: 'Private',
        description: 'Your profile is hidden from search and other users',
        icon: Lock,
    },
]

function buildDefaultPrivacy(settings) {
    return {
        profileVisibility: settings?.profileVisibility || 'public',
        showStats: settings?.showStats ?? true,
        showSubmissions: settings?.showSubmissions ?? true,
        showContestHistory: settings?.showContestHistory ?? true,
        showFollowers: settings?.showFollowers ?? true,
    }
}

export default function PrivacySection({ user, syncUser }) {
    const userId = user?._id || user?.id
    const [privacy, setPrivacy] = useState(() => buildDefaultPrivacy(user?.privacySettings))
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Sync only when privacySettings reference actually changes
    useEffect(() => {
        if (user?.privacySettings) {
            setPrivacy((prev) => {
                const next = buildDefaultPrivacy(user.privacySettings)
                // Only update if values differ
                if (
                    next.profileVisibility !== prev.profileVisibility ||
                    next.showStats !== prev.showStats ||
                    next.showSubmissions !== prev.showSubmissions ||
                    next.showContestHistory !== prev.showContestHistory ||
                    next.showFollowers !== prev.showFollowers
                ) {
                    return next
                }
                return prev
            })
        }
    }, [user?.privacySettings])

    const handleSave = useCallback(async () => {
        if (!userId) {
            toast.error('Unable to save settings. Please log in again.')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/users/${userId}/privacy`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(privacy),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to save privacy settings')
            }

            toast.success('Privacy settings saved')
            // Refresh AuthContext to sync updated privacySettings
            syncUser?.()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }, [userId, privacy])

    const updatePrivacy = useCallback((key, value) => {
        setPrivacy((prev) => ({ ...prev, [key]: value }))
    }, [])

    return (
        <div className="space-y-6">
            {/* Profile Visibility */}
            <Card className="p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Globe className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">Profile Visibility</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {VISIBILITY_OPTIONS.map((opt) => (
                        <RadioOption
                            key={opt.value}
                            selected={privacy.profileVisibility === opt.value}
                            onChange={(val) => updatePrivacy('profileVisibility', val)}
                            value={opt.value}
                            label={opt.label}
                            description={opt.description}
                            icon={opt.icon}
                        />
                    ))}
                </div>
            </Card>

            {/* What to Show */}
            <Card className="p-6">
                <div className="mb-6 flex items-center gap-3">
                    <BarChart3 className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">What to Show</h3>
                </div>

                <div className="space-y-6">
                    <ToggleSwitch
                        checked={privacy.showStats}
                        onChange={(val) => updatePrivacy('showStats', val)}
                        label="Statistics"
                        description="Your solve count, rating, and rankings"
                    />
                    <ToggleSwitch
                        checked={privacy.showSubmissions}
                        onChange={(val) => updatePrivacy('showSubmissions', val)}
                        label="Submission History"
                        description="Allow others to view your submitted solutions"
                    />
                    <ToggleSwitch
                        checked={privacy.showContestHistory}
                        onChange={(val) => updatePrivacy('showContestHistory', val)}
                        label="Contest History"
                        description="Show your participation in contests"
                    />
                    <ToggleSwitch
                        checked={privacy.showFollowers}
                        onChange={(val) => updatePrivacy('showFollowers', val)}
                        label="Followers/Following"
                        description="Display your follower and following lists"
                    />
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSubmitting} className="shadow-accent-glow">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Privacy Settings
                </Button>
            </div>
        </div>
    )
}
