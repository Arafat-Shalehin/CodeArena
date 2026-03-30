'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
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
import AccountSection from '@/features/profile/components/settings/AccountSection'
import PreferencesSection from '@/features/profile/components/settings/PreferencesSection'
import NotificationsSection from '@/features/profile/components/settings/NotificationsSection'
import PrivacySection from '@/features/profile/components/settings/PrivacySection'
import SubscriptionSection from '@/features/profile/components/settings/SubscriptionSection'
import { Button } from '@/components/ui/button'
import ProfilePictureCard from '@/features/profile/components/ProfilePictureCard'
import Navbar from '@/components/layout/Navbar'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// Schema
const editProfileSchema = z.object({
    name: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(25, 'Username must be at most 25 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    bio: z.string().max(160, 'Bio must be at most 160 characters').optional().or(z.literal('')),
    location: z.string().max(100, 'Location is too long').optional().or(z.literal('')),
    country: z.string().optional(),
    website: z
        .string()
        .refine(
            (val) =>
                !val ||
                val.startsWith('http://') ||
                val.startsWith('https://') ||
                val.includes('.'),
            'Must be a valid URL (e.g., https://example.com)'
        )
        .optional()
        .or(z.literal('')),
    avatarSeed: z.string().optional(),
    socials: z
        .object({
            github: z
                .string()
                .optional()
                .or(z.literal(''))
                .refine((val) => !val || /^[a-zA-Z0-9-]+$/.test(val), 'Invalid GitHub username'),
            linkedin: z
                .string()
                .optional()
                .or(z.literal(''))
                .refine((val) => !val || /^[a-zA-Z0-9-_]+$/.test(val), 'Invalid LinkedIn ID'),
            twitter: z
                .string()
                .optional()
                .or(z.literal(''))
                .refine((val) => !val || /^@?[a-zA-Z0-9_]+$/.test(val), 'Invalid Twitter handle'),
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
    'ninja',
    'pirate',
    'cowboy',
    'alien',
    'robot',
]

const COUNTRIES = [
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'AR', name: 'Argentina' },
    { code: 'AU', name: 'Australia' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BR', name: 'Brazil' },
    { code: 'CA', name: 'Canada' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'CN', name: 'China' },
    { code: 'DE', name: 'Germany' },
    { code: 'EG', name: 'Egypt' },
    { code: 'ES', name: 'Spain' },
    { code: 'FR', name: 'France' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'IN', name: 'India' },
    { code: 'IT', name: 'Italy' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'MX', name: 'Mexico' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PL', name: 'Poland' },
    { code: 'RU', name: 'Russia' },
    { code: 'SE', name: 'Sweden' },
    { code: 'SG', name: 'Singapore' },
    { code: 'TH', name: 'Thailand' },
    { code: 'TR', name: 'Turkey' },
    { code: 'US', name: 'United States' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'ZA', name: 'South Africa' },
].sort((a, b) => a.name.localeCompare(b.name))

export default function SettingsPage() {
    const { user, isLoading: authLoading, syncUser } = useAuth()
    const [activeSection, setActiveSection] = useState('profile')
    const [isSaved, setIsSaved] = useState(false)
    const abortRef = useRef(null)

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
            avatarSeed: '',
            socials: { github: '', linkedin: '', twitter: '' },
        },
    })

    // Hydrate form once user data is available (after auth loading completes)
    useEffect(() => {
        if (user && !authLoading) {
            reset({
                name: user.name || '',
                bio: user.bio || '',
                location: user.location || '',
                country: user.country || '',
                website: user.website || '',
                avatarSeed: user.avatarSeed || user.name || PREDEFINED_AVATARS[0],
                socials: {
                    github: user.socials?.github || '',
                    linkedin: user.socials?.linkedin || '',
                    twitter: user.socials?.twitter || '',
                },
            })
        }
    }, [user, authLoading, reset])

    const avatarSeed = watch('avatarSeed')

    const onSubmit = async (data) => {
        const userId = user?.id || user?._id

        if (!userId) {
            toast.error('Unable to update profile. Please log in again.')
            return
        }

        // Cancel any previous in-flight submit
        abortRef.current?.abort()
        abortRef.current = new AbortController()

        try {
            const userIdString = userId.toString()
            const payload = {
                name: data.name,
                bio: data.bio || '',
                location: data.location || '',
                country: data.country || '',
                website: data.website || '',
                socials: {
                    github: data.socials?.github?.trim() || '',
                    linkedin: data.socials?.linkedin?.trim() || '',
                    twitter: data.socials?.twitter?.trim() || '',
                },
                avatarSeed: data.avatarSeed,
            }

            const res = await fetch(`/api/users/${userIdString}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                signal: abortRef.current.signal,
                body: JSON.stringify(payload),
            })

            const responseText = await res.text()
            let responseData = {}
            try {
                responseData = JSON.parse(responseText)
            } catch {
                throw new Error(
                    `Server error (${res.status}): ${responseText || 'No response body'}`
                )
            }

            if (!res.ok) {
                throw new Error(responseData.message || `Failed to update profile (${res.status})`)
            }

            // Sync Firebase displayName
            if (auth.currentUser) {
                await firebaseUpdateProfile(auth.currentUser, { displayName: data.name }).catch(
                    (e) => console.error('Firebase profile sync failed:', e)
                )
            }

            // Sync with server to get fresh DB data as the single source of truth
            await syncUser()

            setIsSaved(true)
            toast.success('Changes saved successfully!')
            setTimeout(() => setIsSaved(false), 3000)
        } catch (error) {
            if (error.name === 'AbortError') return
            toast.error(error.message || 'Failed to save profile. Please try again.')
        }
    }

    if (authLoading) {
        return (
            <div className="bg-bg-page site-gradient flex min-h-screen flex-col">
                <Navbar />
                <main className="flex flex-grow items-center justify-center">
                    <Loader2 className="text-accent h-8 w-8 animate-spin" />
                </main>
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
                    <div className="min-h-[600px] lg:col-span-9">
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
                                    countries={COUNTRIES}
                                />
                                <SocialProfilesForm
                                    register={register}
                                    errors={errors}
                                    watch={watch}
                                    setValue={setValue}
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
                                                    avatarSeed:
                                                        user.avatarSeed ||
                                                        user.name ||
                                                        PREDEFINED_AVATARS[0],
                                                    socials: {
                                                        github: user.socials?.github || '',
                                                        linkedin: user.socials?.linkedin || '',
                                                        twitter: user.socials?.twitter || '',
                                                    },
                                                })
                                            }
                                        }}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant={isSaved ? 'outline' : 'default'}
                                        className={cn(
                                            'px-8 transition-all duration-300',
                                            !isSaved && 'shadow-accent-glow',
                                            isSaved &&
                                                'border-success text-success hover:bg-success/5'
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Saving...
                                            </span>
                                        ) : isSaved ? (
                                            <span className="animate-in fade-in zoom-in flex items-center gap-2 duration-300">
                                                <Check className="h-4 w-4" />
                                                Saved Changes
                                            </span>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {activeSection === 'account' && <AccountSection user={user} />}
                        {activeSection === 'preferences' && <PreferencesSection user={user} />}
                        {activeSection === 'notifications' && <NotificationsSection user={user} />}
                        {activeSection === 'privacy' && <PrivacySection user={user} />}
                        {activeSection === 'subscription' && <SubscriptionSection user={user} />}
                    </div>
                </div>
            </main>
        </div>
    )
}
