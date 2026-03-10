'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

// Firebase
import { auth } from '@/lib/firebase/config'
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth'

// Auth Context
import { useAuth } from '@/context/AuthContext'

// Components
import SettingsSidebar from '@/features/profile/components/SettingsSidebar'
import PersonalInfoForm from '@/features/profile/components/PersonalInfoForm'
import SocialProfilesForm from '@/features/profile/components/SocialProfilesForm'
import { Button } from '@/components/ui/button'
import ProfilePictureCard from '@/features/profile/components/ProfilePictureCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Schema
const editProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Display name must be at least 2 characters')
        .max(50, 'Display name must be at most 50 characters'),
    bio: z.string().max(160, 'Bio must be at most 160 characters').optional().or(z.literal('')),
    location: z.string().max(100, 'Location is too long').optional().or(z.literal('')),
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
    }, [user, reset, setValue])

    const avatarSeed = watch('avatarSeed')

    const onSubmit = async (data) => {
        // First, update the MongoDB database
        const userId = user?.id || user?._id
        console.log('User object:', user)
        console.log('Extracted userId:', userId)

        if (userId) {
            try {
                const userIdString = userId.toString()
                const payload = {
                    name: data.name,
                    bio: data.bio || '',
                    location: data.location || '',
                    website: data.website || '',
                    socials: data.socials || { github: '', linkedin: '', twitter: '' },
                    avatarSeed,
                }
                console.log('Sending profile update:', { userId: userIdString, payload })

                const res = await fetch(`/api/users/${userIdString}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                })

                const responseData = await res.json()
                console.log('Profile update response:', { status: res.status, data: responseData })

                if (!res.ok) {
                    throw new Error(responseData.message || 'Failed to update profile')
                }
            } catch (error) {
                console.error('Database profile sync failed:', error)
                toast.error(error.message || 'Failed to save profile. Please try again.')
                return // Stop here - don't update local context or show success
            }
        } else {
            console.error('No user ID found:', user)
            toast.error('Unable to update profile. Please log in again.')
            return
        }

        // Update Firebase display name
        if (auth.currentUser) {
            try {
                await firebaseUpdateProfile(auth.currentUser, { displayName: data.name })
            } catch (e) {
                console.error('Firebase profile sync failed:', e)
                toast.error('Failed to sync name with Firebase auth.')
            }
        }

        // Update local auth context (which also handles localStorage caching mapping)
        updateLocalContext({
            name: data.name,
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            socials: data.socials,
            avatarSeed,
        })

        // Sync with server to get fresh data
        try {
            await syncUser()
        } catch (syncError) {
            console.error('Sync failed:', syncError)
        }

        toast.success('Changes saved successfully!')
    }

    if (authLoading) {
        return (
            <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
                <Navbar />
                <main className="flex flex-grow items-center justify-center">
                    <Loader2 className="text-accent h-8 w-8 animate-spin" />
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-grow px-4 pt-2 pb-12 md:px-6">
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
                                />
                                <SocialProfilesForm register={register} errors={errors} />

                                <div className="border-border flex items-center justify-end gap-4 border-t pt-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-text-secondary font-semibold"
                                        onClick={() => user && reset()}
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

                        {/* Coming Soon Placeholder */}
                        {activeSection !== 'profile' && (
                            <div className="bg-bg-subtle border-border text-text-muted rounded-lg border p-12 text-center">
                                <p className="text-sm font-medium">
                                    This settings section is coming soon.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
