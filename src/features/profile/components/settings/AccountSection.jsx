'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Trash2, Mail, Lock, AlertTriangle } from 'lucide-react'

export default function AccountSection({ user }) {
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/users/${user._id}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to change password')
            }

            toast.success('Password changed successfully')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setIsChangingPassword(false)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (
            !confirm('Are you sure you want to delete your account? This action cannot be undone.')
        ) {
            return
        }

        if (
            !confirm(
                'This will permanently delete all your data including submissions, progress, and achievements. Continue?'
            )
        ) {
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: 'DELETE',
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Failed to delete account')
            }

            toast.success('Account deleted successfully')
            window.location.href = '/'
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Email Section */}
            <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                    <Mail className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">Email Address</h3>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-bg-muted max-w-md"
                    />
                    <span className="text-text-muted text-sm">Email cannot be changed</span>
                </div>
            </Card>

            {/* Password Section */}
            <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Lock className="text-accent" size={20} />
                        <h3 className="text-text-primary text-lg font-semibold">Password</h3>
                    </div>
                    {!isChangingPassword && (
                        <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                            Change Password
                        </Button>
                    )}
                </div>

                {isChangingPassword && (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        currentPassword: e.target.value,
                                    })
                                }
                                required
                                className="max-w-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value,
                                    })
                                }
                                required
                                minLength={6}
                                className="max-w-md"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value,
                                    })
                                }
                                required
                                className="max-w-md"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Save Password
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsChangingPassword(false)
                                    setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: '',
                                    })
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            {/* Danger Zone */}
            <Card className="border-error/30 p-6">
                <div className="mb-4 flex items-center gap-3">
                    <AlertTriangle className="text-error" size={20} />
                    <h3 className="text-error text-lg font-semibold">Danger Zone</h3>
                </div>
                <p className="text-text-muted mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isSubmitting}
                    className="bg-error hover:bg-error/90"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Deleting...' : 'Delete Account'}
                </Button>
            </Card>
        </div>
    )
}
