'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Firebase — sync displayName on save
import { auth } from '@/lib/firebase/config'
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth'

// UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, AtSign, FileText, X, Loader2 } from 'lucide-react'

// ── Validation Schema ──────────────────────────────────────────────────────────
const editProfileSchema = z.object({
    name: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(25, 'Username must be at most 25 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    bio: z.string().max(160, 'Bio must be at most 160 characters').optional().or(z.literal('')),
})

// ── Avatar Seeds ────────────────────────────────────────────────────────────────
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
]

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
    const avatarSeed = watch('avatarSeed') ?? (user?.avatarSeed || user?.name || PREDEFINED_AVATARS[0])

    // Set initial avatarSeed into the form
    useEffect(() => {
        setValue('avatarSeed', user?.avatarSeed || user?.name || PREDEFINED_AVATARS[0])
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

    const bioValue = watch('bio') || ''

    const onSubmit = async (data) => {
        // Sync displayName to Firebase Auth
        if (auth.currentUser) {
            try {
                await firebaseUpdateProfile(auth.currentUser, { displayName: data.name })
            } catch (e) {
                console.error('Firebase profile sync failed:', e)
            }
        }
        onSave({ name: data.name, bio: data.bio || '', avatarSeed })
        onClose()
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
                        {/* Unique Handle (mapped to backend 'name') */}
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="name"
                                className="text-text-primary text-sm font-medium"
                            >
                                Username / Handle
                            </Label>
                            <div className="relative">
                                <div className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <AtSign size={16} />
                                </div>
                                <Input
                                    id="name"
                                    className="h-11 pl-10"
                                    placeholder="your_unique_handle"
                                    disabled={isSubmitting}
                                    {...register('name')}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-error text-xs font-medium">
                                    {errors.name.message}
                                </p>
                            )}
                            <p className="text-text-muted text-xs">
                                Unique name used to identify you and for your profile URL.
                            </p>
                        </div>

                        {/* Bio */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="bio"
                                    className="text-text-primary text-sm font-medium"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <FileText size={14} className="text-text-muted" />
                                        Bio
                                    </span>
                                </Label>
                                <span
                                    className={`text-xs font-medium ${bioValue.length > 140 ? 'text-warning' : 'text-text-muted'}`}
                                >
                                    {bioValue.length}/160
                                </span>
                            </div>
                            <textarea
                                id="bio"
                                rows={3}
                                placeholder="A short description about yourself..."
                                disabled={isSubmitting}
                                className="border-border bg-bg-page text-text-primary placeholder:text-text-muted focus:ring-accent/10 focus:border-accent/30 w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all focus:ring-4 focus:outline-none disabled:opacity-50"
                                {...register('bio')}
                            />
                            {errors.bio && (
                                <p className="text-error text-xs font-medium">
                                    {errors.bio.message}
                                </p>
                            )}
                        </div>

                        {/* Avatar Selection */}
                        <div className="space-y-3">
                            <Label className="text-text-primary block text-sm font-medium">
                                Choose an Avatar
                            </Label>
                            <div className="grid grid-cols-5 gap-3">
                                {PREDEFINED_AVATARS.map((seed) => {
                                    const isSelected = avatarSeed === seed
                                    return (
                                        <button
                                            key={seed}
                                            type="button"
                                            onClick={() => setValue('avatarSeed', seed)}
                                            className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${isSelected
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
