'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Palette, Globe, Clock } from 'lucide-react'
import { useTheme } from 'next-themes'

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
]

const TIMEZONES = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (US)' },
    { value: 'America/Chicago', label: 'Central Time (US)' },
    { value: 'America/Denver', label: 'Mountain Time (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Europe/Berlin', label: 'Berlin' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Asia/Kolkata', label: 'India' },
    { value: 'Asia/Dubai', label: 'Dubai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
]

export default function PreferencesSection({ user, onSave }) {
    const { theme, setTheme } = useTheme()
    const [preferences, setPreferences] = useState({
        language: 'en',
        timezone: 'UTC',
        theme: 'system',
        weeklyGoal: 10,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const userId = user?._id || user?.id

    useEffect(() => {
        if (user?.preferences) {
            const prefs = {
                language: user.preferences.language || 'en',
                timezone: user.preferences.timezone || 'UTC',
                theme: user.preferences.theme || 'system',
                weeklyGoal: user.preferences.weeklyGoal || 10,
            }
            setPreferences(prefs)
            // Apply saved theme on mount
            if (prefs.theme !== theme) {
                setTheme(prefs.theme)
            }
        }
    }, [user])

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/users/${userId}/preferences`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(preferences),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to save preferences')
            }

            // Apply theme on save (including 'system')
            setTheme(preferences.theme)
            toast.success('Preferences saved successfully')
            if (onSave) onSave(preferences)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Theme Selection */}
            <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                    <Palette className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">Appearance</h3>
                </div>

                <div className="space-y-3">
                    <Label>Theme</Label>
                    <div className="flex gap-3">
                        {['light', 'dark', 'system'].map((themeOption) => (
                            <button
                                key={themeOption}
                                type="button"
                                aria-pressed={preferences.theme === themeOption}
                                onClick={() =>
                                    setPreferences({ ...preferences, theme: themeOption })
                                }
                                className={`rounded-md border px-4 py-2 transition-colors ${
                                    preferences.theme === themeOption
                                        ? 'border-accent bg-accent/10 text-accent'
                                        : 'border-border text-text-secondary hover:border-accent/50'
                                }`}
                            >
                                {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Language Selection */}
            <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                    <Globe className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">Language & Region</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <select
                            id="language"
                            value={preferences.language}
                            onChange={(e) =>
                                setPreferences({ ...preferences, language: e.target.value })
                            }
                            className="bg-bg-page border-border text-text-primary w-full rounded-md border px-3 py-2"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                            id="timezone"
                            value={preferences.timezone}
                            onChange={(e) =>
                                setPreferences({ ...preferences, timezone: e.target.value })
                            }
                            className="bg-bg-page border-border text-text-primary w-full rounded-md border px-3 py-2"
                        >
                            {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Weekly Goal */}
            <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                    <Clock className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">Weekly Goal</h3>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="weeklyGoal">Problems per week: {preferences.weeklyGoal}</Label>
                    <input
                        id="weeklyGoal"
                        type="range"
                        min="1"
                        max="50"
                        value={preferences.weeklyGoal}
                        aria-label="Weekly problem goal"
                        aria-valuetext={`${preferences.weeklyGoal} problems per week`}
                        onChange={(e) =>
                            setPreferences({ ...preferences, weeklyGoal: parseInt(e.target.value) })
                        }
                        className="w-full"
                    />
                    <div className="text-text-muted flex justify-between text-xs">
                        <span>1</span>
                        <span>50</span>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSubmitting} className="shadow-accent-glow">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Preferences
                </Button>
            </div>
        </div>
    )
}
