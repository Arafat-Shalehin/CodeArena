'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
    Loader2,
    Trash2,
    Mail,
    Lock,
    AlertTriangle,
    KeyRound,
    Eye,
    EyeOff,
    Info,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFirebaseAuth } from '@/lib/firebase/config'

export default function AccountSection({ user }) {
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResetting, setIsResetting] = useState(false)

    // A user has a password if they didn't sign up via social or if they've set one.
    // In our schema, authProvider 'local' implies password.
    // We'll also check if the user object explicitly says they don't have one if the API provides it.
    const hasPassword = user?.authProvider === 'local' || !!user?.hasPassword

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
    }

    const handleForgotPassword = async () => {
        if (!user?.email) return

        setIsResetting(true)
        try {
            const { auth } = await getFirebaseAuth()
            const { sendPasswordResetEmail } = await import('firebase/auth')
            await sendPasswordResetEmail(auth, user.email)
            toast.success('Password reset email sent! Please check your inbox.')
        } catch (error) {
            console.error('Reset error:', error)
            toast.error(error.message || 'Failed to send reset email')
        } finally {
            setIsResetting(false)
        }
    }

    const validate = () => {
        const newErrors = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }
        let isValid = true

        if (hasPassword && !passwordData.currentPassword) {
            newErrors.currentPassword = 'Current password is required'
            isValid = false
        }

        if (passwordData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters'
            isValid = false
        }

        if (
            hasPassword &&
            passwordData.newPassword === passwordData.currentPassword &&
            passwordData.newPassword !== ''
        ) {
            newErrors.newPassword = 'New password must be different from current'
            isValid = false
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()

        if (!validate()) return

        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/users/${user._id}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                    isFirstTimePassword: !hasPassword,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.message?.toLowerCase().includes('current password')) {
                    setErrors((prev) => ({
                        ...prev,
                        currentPassword: 'Incorrect current password',
                    }))
                } else {
                    throw new Error(data.message || 'Failed to change password')
                }
                return
            }

            toast.success(
                hasPassword ? 'Password changed successfully' : 'Password set successfully'
            )
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setIsChangingPassword(false)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handlePasswordInputChange = (field, value) => {
        setPasswordData((prev) => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }))
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
                credentials: 'include',
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
        <div className="mx-auto max-w-2xl space-y-6">
            {/* Email Section */}
            <Card className="p-6">
                <div className="mb-4 flex items-center justify-center gap-3">
                    <Mail className="text-accent" size={20} />
                    <h3 className="text-text-primary text-lg font-semibold">Email Address</h3>
                </div>
                <div className="flex flex-col items-center gap-3">
                    <Input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-bg-muted w-full"
                    />
                    <span className="text-text-muted text-sm italic">Email cannot be changed</span>
                </div>
            </Card>

            {/* Password Section */}
            <Card className="p-6 text-center">
                <div className="mb-4 flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-3">
                        <KeyRound className="text-accent" size={20} />
                        <h3 className="text-text-primary text-lg font-semibold">
                            {hasPassword ? 'Account Security' : 'Set Account Password'}
                        </h3>
                    </div>
                    {!isChangingPassword && (
                        <Button
                            variant="outline"
                            onClick={() => setIsChangingPassword(true)}
                            className="mt-2"
                        >
                            {hasPassword ? 'Change Password' : 'Set Password'}
                        </Button>
                    )}
                </div>

                {!hasPassword && !isChangingPassword && (
                    <div className="bg-accent/5 border-accent/20 flex flex-col items-center gap-3 rounded-xl border p-6">
                        <Info className="text-accent shrink-0" size={24} />
                        <p className="text-text-secondary max-w-sm text-sm leading-relaxed">
                            You're currently using social login. Set a password to enable direct
                            email login in the future.
                        </p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {isChangingPassword && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            onSubmit={handlePasswordChange}
                            className="space-y-4 overflow-hidden text-left"
                        >
                            <div className="mx-auto max-w-md space-y-5 pt-4">
                                {hasPassword && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="currentPassword">
                                                Current Password
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={handleForgotPassword}
                                                disabled={isResetting}
                                                className="text-accent hover:text-accent-hover text-xs font-bold transition-colors hover:underline disabled:opacity-50"
                                            >
                                                {isResetting ? 'Sending...' : 'Forgot password?'}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock
                                                className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                                                size={16}
                                            />
                                            <Input
                                                id="currentPassword"
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) =>
                                                    handlePasswordInputChange(
                                                        'currentPassword',
                                                        e.target.value
                                                    )
                                                }
                                                required
                                                className={`w-full pr-10 pl-10 ${errors.currentPassword ? 'border-error ring-error ring-1' : ''}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('current')}
                                                className="text-text-muted hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                            >
                                                {showPasswords.current ? (
                                                    <EyeOff size={16} />
                                                ) : (
                                                    <Eye size={16} />
                                                )}
                                            </button>
                                        </div>
                                        {errors.currentPassword && (
                                            <p className="text-error animate-in fade-in slide-in-from-left-1 text-center text-xs font-medium duration-200">
                                                {errors.currentPassword}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <KeyRound
                                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                                            size={16}
                                        />
                                        <Input
                                            id="newPassword"
                                            type={showPasswords.new ? 'text' : 'password'}
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                handlePasswordInputChange(
                                                    'newPassword',
                                                    e.target.value
                                                )
                                            }
                                            required
                                            minLength={6}
                                            className={`w-full pr-10 pl-10 ${errors.newPassword ? 'border-error ring-error ring-1' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="text-text-muted hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff size={16} />
                                            ) : (
                                                <Eye size={16} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="text-error animate-in fade-in slide-in-from-left-1 text-center text-xs font-medium duration-200">
                                            {errors.newPassword}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <KeyRound
                                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                                            size={16}
                                        />
                                        <Input
                                            id="confirmPassword"
                                            type={showPasswords.confirm ? 'text' : 'password'}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                handlePasswordInputChange(
                                                    'confirmPassword',
                                                    e.target.value
                                                )
                                            }
                                            required
                                            className={`w-full pr-10 pl-10 ${errors.confirmPassword ? 'border-error ring-error ring-1' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="text-text-muted hover:text-text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                        >
                                            {showPasswords.confirm ? (
                                                <EyeOff size={16} />
                                            ) : (
                                                <Eye size={16} />
                                            )}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-error animate-in fade-in slide-in-from-left-1 text-center text-xs font-medium duration-200">
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-center gap-3 pt-2">
                                    <Button type="submit" disabled={isSubmitting} className="px-8">
                                        {isSubmitting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : null}
                                        {hasPassword ? 'Save Password' : 'Set Password'}
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
                                            setErrors({
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmPassword: '',
                                            })
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </Card>

            {/* Danger Zone */}
            <Card className="border-error/30 bg-error/5 p-6">
                <div className="mb-4 flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-error" size={24} />
                        <h3 className="text-error text-lg font-bold tracking-wider uppercase">
                            Danger Zone
                        </h3>
                    </div>
                    <p className="text-text-secondary max-w-sm text-center text-sm">
                        Once you delete your account, there is no going back. All your data will be
                        permanently removed.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isSubmitting}
                        className="bg-error hover:bg-error/90 shadow-error/20 mt-2 px-8 shadow-lg"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Deleting...' : 'Delete Account'}
                    </Button>
                </div>
            </Card>
        </div>
    )
}
