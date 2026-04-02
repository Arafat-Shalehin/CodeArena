'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Firebase
import { getFirebaseAuth } from '@/lib/firebase/config'

// Auth Context
import { useAuth } from '@/context/AuthContext'

// Components
import SettingsSidebar from '@/features/profile/components/SettingsSidebar'
import PersonalInfoForm from '@/features/profile/components/PersonalInfoForm'
import SocialProfilesForm from '@/features/profile/components/SocialProfilesForm'
import { Button } from '@/components/ui/button'
import ProfilePictureCard from '@/features/profile/components/ProfilePictureCard'
import Navbar from '@/components/layout/Navbar'
import AccountSection from '@/features/profile/components/settings/AccountSection'
import NotificationsSection from '@/features/profile/components/settings/NotificationsSection'
import PrivacySection from '@/features/profile/components/settings/PrivacySection'
import SubscriptionSection from '@/features/profile/components/settings/SubscriptionSection'

// Schema
const editProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Display name must be at least 2 characters')
        .max(50, 'Display name must be at most 50 characters'),
    bio: z.string().max(160, 'Bio must be at most 160 characters').optional().or(z.literal('')),
    location: z.string().max(100, 'Location is too long').optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    socials: z
        .object({
            github: z.string().optional().or(z.literal('')),
            linkedin: z.string().optional().or(z.literal('')),
            twitter: z.string().optional().or(z.literal('')),
        })
        .optional(),
})

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

export default function SettingsPage() {
    const { user, updateProfile: updateLocalContext, isLoading: authLoading, syncUser } = useAuth()
    const [activeSection, setActiveSection] = useState('profile')
    const [isSaved, setIsSaved] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: '',
            bio: '',
            location: '',
            country: '',
            website: '',
            socials: { github: '', linkedin: '', twitter: '' },
        },
    })

    // Hydrate form once user data is available
    useEffect(() => {
        if (user) {
            reset({
                name: user.name || '',
                bio: user.bio || '',
                location: user.location || '',
                country: user.country || '',
                website: user.website || '',
                socials: {
                    github: user.socials?.github || '',
                    linkedin: user.socials?.linkedin || '',
                    twitter: user.socials?.twitter || '',
                },
            })
            if (!watch('avatarSeed')) {
                setValue('avatarSeed', user.avatarSeed || user.name || PREDEFINED_AVATARS[0])
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id, reset, setValue])

    const avatarSeed = watch('avatarSeed')

    const onSubmit = async (data) => {
        const userId = user?.id || user?._id
        if (!userId) {
            console.error('No user ID found:', user)
            toast.error('Unable to update profile. Please log in again.')
            return
        }

        const payload = {
            name: data.name,
            bio: data.bio || '',
            location: data.location || '',
            country: data.country || '',
            website: data.website || '',
            socials: {
                github: (data.socials?.github || '').trim(),
                linkedin: (data.socials?.linkedin || '').trim(),
                twitter: (data.socials?.twitter || '').trim(),
            },
            avatarSeed,
        }

        console.log('[Settings] Submitting profile update:', { userId: userId.toString(), payload })

        try {
            const res = await fetch(`/api/users/${userId.toString()}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const responseData = await res.json()

            if (!res.ok) {
                console.error('[Settings] API error:', responseData)
                throw new Error(responseData.message || `Server error: ${res.status}`)
            }

            console.log('[Settings] API response:', responseData)

            // Update Firebase display name if available
            const firebase = await getFirebaseAuth()
            if (firebase?.auth?.currentUser) {
                const { updateProfile: firebaseUpdateProfile } = await import('firebase/auth')
                await firebaseUpdateProfile(firebase.auth.currentUser, { displayName: data.name })
            }

            // Update local context FIRST with the values we just saved
            updateLocalContext({
                name: data.name,
                bio: data.bio || '',
                location: data.location || '',
                country: data.country || '',
                website: data.website || '',
                socials: payload.socials,
                avatarSeed,
            })

            // Sync in background to ensure consistency
            try {
                await syncUser()
            } catch (syncError) {
                console.error('[Settings] Sync failed:', syncError)
            }

            setIsSaved(true)
            toast.success('Changes saved successfully!')
            setTimeout(() => setIsSaved(false), 3000)
        } catch (error) {
            if (error.name === 'AbortError') return
            console.error('[Settings] Profile update failed:', error)
            toast.error(error.message || 'Failed to save profile. Please try again.')
        }
    }

    if (authLoading) {
        return (
            <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
                <Navbar />
                <main className="flex grow items-center justify-center">
                    <Loader2 className="text-accent h-8 w-8 animate-spin" />
                </main>
            </div>
        )
    }

    return (
        <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl grow px-4 pt-2 pb-12 md:px-6">
                <div className="mb-10">
                    <h1 className="text-text-primary text-3xl font-bold tracking-tight">
                        Profile Information
                    </h1>
                    <p className="text-text-secondary mt-2">
                        Update your personal details and how you appear to others on CodeArena.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* Sidebar */}
                    <SettingsSidebar
                        activeSection={activeSection}
                        onSectionChange={setActiveSection}
                        className="lg:col-span-3"
                    />

                    {/* Content Section */}
                    <div className="lg:col-span-9">
                        {activeSection === 'profile' && (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                <ProfilePictureCard
                                    avatarSeed={avatarSeed}
                                    onSelectSeed={(seed) => setValue('avatarSeed', seed)}
                                    predefinedAvatars={PREDEFINED_AVATARS}
                                />
                                <PersonalInfoForm
                                    register={register}
                                    errors={errors}
                                    bioValue={watch('bio')}
                                    watch={watch}
                                    setValue={setValue}
                                    user={user}
                                />
                                <SocialProfilesForm
                                    register={register}
                                    errors={errors}
                                    watch={watch}
                                    setValue={setValue}
                                    user={user}
                                />

                                <div className="border-border flex items-center justify-end gap-4 border-t pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-text-secondary font-semibold"
                                        onClick={() => {
                                            if (user) {
                                                reset({
                                                    name: user.name || '',
                                                    bio: user.bio || '',
                                                    location: user.location || '',
                                                    country: user.country || '',
                                                    website: user.website || '',
                                                    socials: {
                                                        github: user.socials?.github || '',
                                                        linkedin: user.socials?.linkedin || '',
                                                        twitter: user.socials?.twitter || '',
                                                    },
                                                    avatarSeed:
                                                        user.avatarSeed ||
                                                        user.name ||
                                                        PREDEFINED_AVATARS[0],
                                                })
                                            }
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="default"
                                        className="shadow-accent-glow px-8"
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
                        )}

                        {activeSection === 'account' && <AccountSection user={user} />}
                        {activeSection === 'notifications' && (
                            <NotificationsSection user={user} syncUser={syncUser} />
                        )}
                        {activeSection === 'privacy' && (
                            <PrivacySection user={user} syncUser={syncUser} />
                        )}
                        {activeSection === 'subscription' && <SubscriptionSection user={user} />}
                    </div>
                </div>
            </main>
        </div>
    )
}
