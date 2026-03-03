'use client'

import { useState } from 'react'

// Shared Components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

// Auth
import { useAuth } from '@/context/AuthContext'

import { toast } from 'sonner'
import { Settings } from 'lucide-react'
import Link from 'next/link'
import EditProfileModal from './EditProfileModal'

/**
 * @component ProfileHero
 * @description Displays the user's profile banner, avatar, name, bio, rank badge,
 * and action buttons. Reads from AuthContext for own profile, prop for public.
 * Responsive: centered single-column on mobile, side-by-side on desktop.
 *
 * @param {Object} props
 * @param {Object} [props.user] - Override user data (for public profiles).
 * @returns {JSX.Element} The rendered profile hero section.
 */
export default function ProfileHero({ user: userProp }) {
    const { user: authUser, updateProfile } = useAuth()

    const displayUser = userProp || authUser
    const name = displayUser?.name || displayUser?.email?.split('@')[0] || 'Unknown User'

    const { bio = '', avatarSeed = name, stats } = displayUser || {}

    const isOwnProfile =
        authUser &&
        ((authUser.firebaseUid && authUser.firebaseUid === displayUser?.firebaseUid) ||
            (authUser.email && authUser.email === displayUser?.email) ||
            (authUser._id && authUser._id === displayUser?._id))

    const rank = stats?.globalRank ?? '—'
    const finalAvatarSeed = avatarSeed || name

    const [modalOpen, setModalOpen] = useState(false)
    return (
        <>
            <div className="bg-bg-subtle border-border relative mb-8 overflow-hidden rounded-xl border">
                {/* Banner */}
                <div className="from-accent/20 via-accent/5 relative h-24 w-full bg-gradient-to-r to-transparent md:h-40">
                    <div className="text-text-primary/5 absolute top-4 right-6 font-mono text-4xl font-bold select-none">
                        CODEARENA
                    </div>
                </div>

                {/* Mobile layout: centered column; desktop: side-by-side row */}
                <div className="relative z-10 -mt-12 px-6 pb-6 md:px-8 md:pb-8">
                    {/* Avatar — centered on mobile */}
                    <div className="flex justify-center md:justify-start">
                        <div className="bg-bg-page border-bg-page rounded-full border-4 p-1 shadow-xl">
                            <Avatar className="border-accent h-24 w-24 border-2 md:h-32 md:w-32">
                                <AvatarImage
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${finalAvatarSeed}`}
                                    alt={`${name}'s avatar`}
                                />
                                <AvatarFallback className="bg-bg-muted text-text-primary text-2xl">
                                    {(name || 'U').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* User Info + Buttons */}
                    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        {/* Name, username, rank, bio */}
                        <div className="space-y-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                                <h1 className="text-text-primary text-2xl font-bold md:text-3xl">
                                    {name}
                                </h1>
                                <span className="bg-warning-light text-warning border-warning/20 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
                                    🏆 #{rank}
                                </span>
                            </div>
                            {bio && (
                                <p className="text-text-muted max-w-md pt-2 text-sm leading-relaxed">
                                    {bio}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex shrink-0 flex-row flex-wrap items-center justify-center gap-3 md:justify-end">
                            {!isOwnProfile && <Button variant="default">Follow</Button>}
                            {isOwnProfile && (
                                <Button onClick={() => setModalOpen(true)} variant="outline">
                                    <Settings className="mr-2 h-4 w-4" /> Edit Profile
                                </Button>
                            )}
                        </div>
                        {modalOpen && (
                            <EditProfileModal
                                onClose={() => setModalOpen(false)}
                            ></EditProfileModal>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

ProfileHero.displayName = 'ProfileHero'
