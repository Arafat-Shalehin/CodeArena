'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Lock, Eye, User, BarChart3 } from 'lucide-react'

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

function RadioOption({ selected, onChange, value, label, description }) {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onChange(value)
        }
    }

    return (
        <div
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={() => onChange(value)}
            onKeyDown={handleKeyDown}
            className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                selected ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`mt-0.5 h-4 w-4 rounded-full border-2 ${
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
                <div>
                    <p className="text-text-primary font-medium">{label}</p>
                    {description && <p className="text-text-muted text-sm">{description}</p>}
                </div>
            </div>
        </div>
    )
}

export default function PrivacySection({ user }) {
    const [privacy, setPrivacy] = useState({
        profileVisibility: 'public',
        showStats: true,
        showSubmissions: true,
        showContestHistory: true,
        showFollowers: true,
        allowMessaging: true,
        indexProfile: true,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (user?.privacySettings) {
            setPrivacy({
                profileVisibility: user.privacySettings.profileVisibility || 'public',
                showStats: user.privacySettings.showStats ?? true,
                showSubmissions: user.privacySettings.showSubmissions ?? true,
                showContestHistory: user.privacySettings.showContestHistory ?? true,
                showFollowers: user.privacySettings.showFollowers ?? true,
                allowMessaging: user.privacySettings.allowMessaging ?? true,
                indexProfile: user.privacySettings.indexProfile ?? true,
            })
        }
    }, [user])

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/users/${user._id}/privacy`, {
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
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Profile Visibility */}
            <Card className="p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Eye className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">Profile Visibility</h3>
                </div>

                <div className="space-y-3">
                    <RadioOption
                        selected={privacy.profileVisibility === 'public'}
                        onChange={(val) => setPrivacy({ ...privacy, profileVisibility: val })}
                        value="public"
                        label="Public"
                        description="Anyone can view your profile and stats"
                    />
                    <RadioOption
                        selected={privacy.profileVisibility === 'followers'}
                        onChange={(val) => setPrivacy({ ...privacy, profileVisibility: val })}
                        value="followers"
                        label="Followers Only"
                        description="Only your followers can see your full profile"
                    />
                    <RadioOption
                        selected={privacy.profileVisibility === 'private'}
                        onChange={(val) => setPrivacy({ ...privacy, profileVisibility: val })}
                        value="private"
                        label="Private"
                        description="Your profile is hidden from search and other users"
                    />
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
                        onChange={(val) => setPrivacy({ ...privacy, showStats: val })}
                        label="Statistics"
                        description="Your solve count, rating, and rankings"
                    />
                    <ToggleSwitch
                        checked={privacy.showSubmissions}
                        onChange={(val) => setPrivacy({ ...privacy, showSubmissions: val })}
                        label="Submission History"
                        description="Allow others to view your submitted solutions"
                    />
                    <ToggleSwitch
                        checked={privacy.showContestHistory}
                        onChange={(val) => setPrivacy({ ...privacy, showContestHistory: val })}
                        label="Contest History"
                        description="Show your participation in contests"
                    />
                    <ToggleSwitch
                        checked={privacy.showFollowers}
                        onChange={(val) => setPrivacy({ ...privacy, showFollowers: val })}
                        label="Followers/Following"
                        description="Display your follower and following lists"
                    />
                </div>
            </Card>

            {/* Additional Settings */}
            <Card className="p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Lock className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">Additional Settings</h3>
                </div>

                <div className="space-y-6">
                    <ToggleSwitch
                        checked={privacy.allowMessaging}
                        onChange={(val) => setPrivacy({ ...privacy, allowMessaging: val })}
                        label="Allow Direct Messages"
                        description="Let other users send you direct messages"
                    />
                    <ToggleSwitch
                        checked={privacy.indexProfile}
                        onChange={(val) => setPrivacy({ ...privacy, indexProfile: val })}
                        label="Search Engine Indexing"
                        description="Allow search engines to index your profile"
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
