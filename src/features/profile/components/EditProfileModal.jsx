'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Firebase — sync displayName on save
import { auth } from '@/lib/firebase/config'
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth'

// Auth
import { useAuth } from '@/context/AuthContext'

// UI
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'

// Sub-components
import UsernameInput from './UsernameInput'
import BioInput from './BioInput'
import AvatarSelector from './AvatarSelector'

// ── Validation Schema ──────────────────────────────────────────────────────────
const editProfileSchema = z.object({
    name: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(25, 'Username must be at most 25 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    bio: z.string().max(160, 'Bio must be at most 160 characters').optional().or(z.literal('')),
})

/**
 * @component EditProfileModal
 * @description Modal for editing display name, username, bio, and avatar.
 * Uses react-hook-form + Zod. Saves to AuthContext (localStorage-backed)
 * and syncs displayName to Firebase Auth.
 *
 * @param {Object} props
 * @param {Object} props.user - Current user data to prepopulate the form.
 * @param {Function} props.onSave - Callback fired with updated data on save.
 * @param {Function} props.onClose - Callback to close without saving.
 * @returns {JSX.Element} The rendered modal.
 */
export default function EditProfileModal({ user, onSave, onClose }) {
    const { syncUser } = useAuth()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: user?.name || '',
            bio: user?.bio || '',
        },
    })

    // Controlled avatar seed
    const avatarSeed = watch('avatarSeed') ?? (user?.avatarSeed || user?.name || 'adventurer')
    const bioValue = watch('bio') || ''

    // Set initial avatarSeed into the form
    useEffect(() => {
        setValue('avatarSeed', user?.avatarSeed || user?.name || 'adventurer')
    }, [user, setValue])

    // Escape key + scroll lock
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [onClose])

    const onSubmit = async (data) => {
        const userId = user?._id || user?.id
        if (!userId) {
            toast.error('Unable to update profile. Please log in again.')
            return
        }

        try {
            // 1. Save to database
            const payload = { name: data.name, bio: data.bio || '', avatarSeed }
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const responseData = await res.json()
            if (!res.ok) throw new Error(responseData.message || 'Failed to update profile')

            // 2. Sync Firebase displayName
            if (auth.currentUser) {
                await firebaseUpdateProfile(auth.currentUser, { displayName: data.name }).catch(
                    (e) => console.error('Firebase profile sync failed:', e)
                )
            }

            // 3. Refresh user from DB to guarantee UI matches server
            await syncUser()

            toast.success('Profile updated!')
            onSave?.({ name: data.name, bio: data.bio || '', avatarSeed })
            onClose()
        } catch (error) {
            console.error('Profile update failed:', error)
            toast.error(error.message || 'Failed to save profile.')
        }
    }

    return (
        <div className="bg-bg-page/80 animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm duration-200">
            {/* Backdrop */}
            <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

            <div className="bg-bg-surface border-border animate-in zoom-in-95 relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200">
                {/* Header */}
                <div className="border-border bg-bg-subtle/50 flex shrink-0 items-center justify-between border-b px-6 py-4">
                    <h2 className="text-text-primary text-xl font-semibold">Edit Profile</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary hover:bg-bg-muted focus:ring-accent/50 rounded-lg p-1.5 transition-colors focus:ring-2 focus:outline-none"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable form body + sticky footer all inside one <form> */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
                    <div className="flex-1 space-y-5 overflow-y-auto p-6">
                        {/* Username Input with availability checker */}
                        <UsernameInput
                            value={watch('name')}
                            register={register}
                            errors={errors}
                            disabled={isSubmitting}
                        />

                        {/* Bio Input with character counter */}
                        <BioInput
                            value={bioValue}
                            register={register}
                            errors={errors}
                            disabled={isSubmitting}
                        />

                        {/* Avatar Selection Grid */}
                        <AvatarSelector
                            value={avatarSeed}
                            onChange={(seed) => setValue('avatarSeed', seed)}
                        />
                    </div>

                    {/* Sticky Footer — inside <form> so submit works */}
                    <div className="border-border bg-bg-subtle/50 flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-10 px-4"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                            className="h-10 min-w-[120px] px-6"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Saving...
                                </span>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

EditProfileModal.displayName = 'EditProfileModal'
