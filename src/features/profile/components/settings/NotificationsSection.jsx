'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Bell, MessageSquare } from 'lucide-react'

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

export default function NotificationsSection({ user, syncUser }) {
    const userId = user?._id || user?.id
    const [notifications, setNotifications] = useState({
        pushSubmissions: true,
        pushContests: true,
        pushFollowers: false,
        notifyAchievements: true,
        notifyComments: true,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (user?.notificationSettings) {
            setNotifications((prev) => {
                const s = user.notificationSettings
                const next = {
                    pushSubmissions: s.pushSubmissions ?? true,
                    pushContests: s.pushContests ?? true,
                    pushFollowers: s.pushFollowers ?? false,
                    notifyAchievements: s.notifyAchievements ?? true,
                    notifyComments: s.notifyComments ?? true,
                }
                if (
                    next.pushSubmissions !== prev.pushSubmissions ||
                    next.pushContests !== prev.pushContests ||
                    next.pushFollowers !== prev.pushFollowers ||
                    next.notifyAchievements !== prev.notifyAchievements ||
                    next.notifyComments !== prev.notifyComments
                ) {
                    return next
                }
                return prev
            })
        }
    }, [user?.notificationSettings])

    const handleSave = async () => {
        if (!userId) {
            toast.error('Unable to save settings. Please log in again.')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/users/${userId}/notifications`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(notifications),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to save notification settings')
            }

            toast.success('Notification settings saved')
            syncUser?.()
            syncUser?.()
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Push Notifications */}
            <Card className="p-6">
                <div className="mb-6 flex items-center gap-3">
                    <Bell className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">Push Notifications</h3>
                </div>

                <div className="space-y-6">
                    <ToggleSwitch
                        checked={notifications.pushSubmissions}
                        onChange={(val) =>
                            setNotifications({ ...notifications, pushSubmissions: val })
                        }
                        label="Submission Results"
                        description="Real-time notifications for code submissions"
                    />
                    <ToggleSwitch
                        checked={notifications.pushContests}
                        onChange={(val) =>
                            setNotifications({ ...notifications, pushContests: val })
                        }
                        label="Contest Alerts"
                        description="Live updates during active contests"
                    />
                    <ToggleSwitch
                        checked={notifications.pushFollowers}
                        onChange={(val) =>
                            setNotifications({ ...notifications, pushFollowers: val })
                        }
                        label="New Followers"
                        description="Instant notifications for new followers"
                    />
                </div>
            </Card>

            {/* In-App Notifications */}
            <Card className="p-6">
                <div className="mb-6 flex items-center gap-3">
                    <MessageSquare className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">
                        In-App Notifications
                    </h3>
                </div>

                <div className="space-y-6">
                    <ToggleSwitch
                        checked={notifications.notifyAchievements}
                        onChange={(val) =>
                            setNotifications({ ...notifications, notifyAchievements: val })
                        }
                        label="Achievements"
                        description="Badges and milestones unlocked"
                    />
                    <ToggleSwitch
                        checked={notifications.notifyComments}
                        onChange={(val) =>
                            setNotifications({ ...notifications, notifyComments: val })
                        }
                        label="Comments"
                        description="Replies to your submissions or posts"
                    />
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSubmitting} className="shadow-accent-glow">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Notifications
                </Button>
            </div>
        </div>
    )
}
