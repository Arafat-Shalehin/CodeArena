'use client'

import { useState, useEffect } from 'react'

// Shared Components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

// Auth
import { useAuth } from '@/context/AuthContext'

import { toast } from 'sonner'
import { Settings, MapPin, Link as LinkIcon, Github, Linkedin, Twitter } from 'lucide-react'
import Link from 'next/link'
import FollowersListModal from './FollowersListModal'

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
    const { user: authUser } = useAuth()

    const displayUser = userProp || authUser
    const name = displayUser?.name || displayUser?.email?.split('@')[0] || 'Unknown User'

    const { bio = '', avatarSeed = name, stats, location, website, socials } = displayUser || {}

    const isOwnProfile =
        authUser &&
        ((authUser.firebaseUid && authUser.firebaseUid === displayUser?.firebaseUid) ||
            (authUser.email && authUser.email === displayUser?.email) ||
            (authUser._id &&
                displayUser?._id &&
                authUser._id.toString() === displayUser._id.toString()))

    const rank = stats?.globalRank ?? '—'
    const finalAvatarSeed = avatarSeed || name

    const [isFollowLoading, setIsFollowLoading] = useState(false)

    // Manage local follow state for optimistic UI updates
    const initialFollowersCount = displayUser?.followers?.length || 0
    const initialFollowingCount = displayUser?.following?.length || 0
    const currentUserId = authUser?._id || authUser?.id

    const checkIsFollowing = (user) => {
        if (!currentUserId || !Array.isArray(user?.followers)) return false
        return user.followers.some((fId) => fId.toString() === currentUserId.toString())
    }

    const [followersCount, setFollowersCount] = useState(initialFollowersCount)
    const [followingCount, setFollowingCount] = useState(initialFollowingCount)
    const [isFollowing, setIsFollowing] = useState(checkIsFollowing(displayUser))
    const [friendsModalType, setFriendsModalType] = useState(null) // 'followers' | 'following' | null

    // Sync state if displayUser changes from network fetch
    useEffect(() => {
        setFollowersCount(displayUser?.followers?.length || 0)
        setFollowingCount(displayUser?.following?.length || 0)
        setIsFollowing(checkIsFollowing(displayUser))
    }, [displayUser, currentUserId])

    const handleFollowToggle = async () => {
        if (!authUser) {
            toast.error('You need to be logged in to follow users.')
            return
        }

        // Optimistic UI Update
        const previousIsFollowing = isFollowing
        const previousCount = followersCount
        const newIsFollowing = !isFollowing

        setIsFollowing(newIsFollowing)
        setFollowersCount(newIsFollowing ? previousCount + 1 : Math.max(0, previousCount - 1))
        setIsFollowLoading(true)

        try {
            const res = await fetch(`/api/users/${displayUser._id}/follow`, {
                method: 'POST',
            })
            const data = await res.json()

            if (res.ok && data.success) {
                // Read truth from server to ensure sync
                if (data.data?.followersCount !== undefined) {
                    setFollowersCount(data.data.followersCount)
                }
                setIsFollowing(data.data.following)
                toast.success(data.data.following ? `Following ${name}` : `Unfollowed ${name}`)
            } else {
                throw new Error(data.message || 'Failed to toggle follow.')
            }
        } catch (error) {
            console.error('Follow toggle error:', error)
            toast.error(error.message || 'An unexpected error occurred.')
            // Revert optimistic update
            setIsFollowing(previousIsFollowing)
            setFollowersCount(previousCount)
        } finally {
            setIsFollowLoading(false)
        }
    }

    // Build a safe URL to prevent XSS via javascript: protocol
    const safeWebsiteUrl = (() => {
        if (!website) return null
        try {
            const url = new URL(website.startsWith('http') ? website : `https://${website}`)
            return ['http:', 'https:'].includes(url.protocol) ? url.href : null
        } catch {
            return null
        }
    })()

    return (
        <div className="border-border relative mb-8 overflow-hidden rounded-2xl border p-6 md:p-8">
            {/* Glass-Gradient Background */}
            <div className="from-accent-light via-bg-page to-info-light absolute inset-0 z-0 bg-gradient-to-r opacity-50" />
            <div className="absolute inset-0 z-0 backdrop-blur-xl" />

            <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
                {/* Left Side: Avatar, Name, Description */}
                <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 text-center md:flex-row md:justify-start md:text-left">
                    {/* Avatar with Pro styling */}
                    <div className="relative shrink-0">
                        <div className="bg-bg-page absolute -inset-1 rounded-2xl shadow-lg" />
                        <Avatar className="dark:border-border h-32 w-32 rounded-2xl border-4 border-white shadow-sm">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${finalAvatarSeed}`}
                                alt={`${name}'s avatar`}
                                className="rounded-2xl object-cover"
                            />
                            <AvatarFallback className="bg-bg-muted text-text-primary rounded-2xl text-4xl font-bold">
                                {(name || 'U').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Name, username, rank, bio, and quick info */}
                    <div className="flex max-w-[400px] flex-col items-center space-y-4 md:items-start">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                <h1 className="text-text-primary text-3xl font-bold tracking-tight drop-shadow-sm">
                                    {name}
                                </h1>
                                <span className="bg-warning-light text-warning border-warning/20 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold tracking-wider uppercase">
                                    🏆 #{rank}
                                </span>
                            </div>

                            <div className="mt-1 mb-2 flex items-center justify-center gap-4 text-sm font-medium md:justify-start">
                                <button
                                    onClick={() => setFriendsModalType('followers')}
                                    className="hover:text-accent flex items-center gap-1 transition-colors"
                                >
                                    <span className="text-text-primary font-bold">
                                        {followersCount}
                                    </span>
                                    <span className="text-text-secondary font-medium">
                                        Followers
                                    </span>
                                </button>
                                <span className="text-text-muted">•</span>
                                <button
                                    onClick={() => setFriendsModalType('following')}
                                    className="hover:text-accent flex items-center gap-1 transition-colors"
                                >
                                    <span className="text-text-primary font-bold">
                                        {followingCount}
                                    </span>
                                    <span className="text-text-secondary font-medium">
                                        Following
                                    </span>
                                </button>
                            </div>

                            {bio ? (
                                <p className="text-text-secondary text-center text-sm leading-relaxed font-medium md:text-left">
                                    {bio}
                                </p>
                            ) : isOwnProfile ? (
                                <p className="text-text-muted text-center text-sm italic md:text-left">
                                    No bio yet. Tell the world about your coding journey!
                                </p>
                            ) : null}
                        </div>

                        {/* Quick info: Location & Website */}
                        {(location || website) && (
                            <div className="text-text-muted flex flex-wrap items-center justify-center gap-4 text-sm md:justify-start">
                                {location && (
                                    <div
                                        className="hover:text-text-primary flex items-center gap-1.5 transition-colors"
                                        title="Location"
                                    >
                                        <MapPin size={16} className="text-accent/70" />
                                        <span>{location}</span>
                                    </div>
                                )}
                                {safeWebsiteUrl && (
                                    <div
                                        className="hover:text-text-primary flex items-center gap-1.5 transition-colors"
                                        title="Website"
                                    >
                                        <LinkIcon size={16} className="text-accent/70" />
                                        <a
                                            href={safeWebsiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                        >
                                            {website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Followers/Following Modal */}
                        {friendsModalType && (
                            <FollowersListModal
                                type={friendsModalType}
                                userId={displayUser._id}
                                onClose={() => setFriendsModalType(null)}
                            />
                        )}
                    </div>
                </div>

                {/* Right Side: Buttons & Socials */}
                <div className="mt-2 flex w-full shrink-0 flex-col items-center md:w-auto md:min-w-[200px] md:items-end">
                    {/* Action Button */}
                    <div className="mb-8 flex w-full justify-center md:justify-end">
                        {!isOwnProfile && (
                            <Button
                                variant={isFollowing ? 'outline' : 'default'}
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                                className={`w-full md:w-auto ${!isFollowing ? 'bg-accent hover:bg-accent-hover shadow-accent-glow text-white' : ''}`}
                            >
                                {isFollowLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                            </Button>
                        )}
                        {isOwnProfile && (
                            <Link href="/profile/settings" className="w-full md:w-auto">
                                <Button
                                    variant="secondary"
                                    className="bg-bg-page hover:bg-bg-subtle text-text-primary border-border h-10 w-full border px-8 py-2 font-semibold shadow-sm transition-all md:w-auto"
                                >
                                    <Settings className="mr-2 h-4 w-4" /> Edit Profile
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Social Icons only */}
                    {(socials?.github || socials?.linkedin || socials?.twitter) && (
                        <div className="flex items-center justify-center gap-4 md:justify-end">
                            {socials?.github && (
                                <a
                                    href={`https://github.com/${socials.github}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${name}'s GitHub profile`}
                                    className="text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <Github size={20} />
                                </a>
                            )}
                            {socials?.linkedin && (
                                <a
                                    href={`https://linkedin.com/in/${socials.linkedin}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${name}'s LinkedIn profile`}
                                    className="text-text-muted hover:text-accent transition-colors"
                                >
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {socials?.twitter && (
                                <a
                                    href={`https://twitter.com/${socials.twitter.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`${name}'s Twitter profile`}
                                    className="text-text-muted hover:text-info transition-colors"
                                >
                                    <Twitter size={20} />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

ProfileHero.displayName = 'ProfileHero'
