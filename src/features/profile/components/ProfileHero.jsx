'use client'

import { useState } from 'react'

// Shared Components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

// Auth
import { useAuth } from '@/context/AuthContext'

import { toast } from 'sonner'
import { Settings, MapPin, Link as LinkIcon, Github, Linkedin, Twitter } from 'lucide-react'
import Link from 'next/link'
import EditProfileModal from './EditProfileModal'
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
    const { user: authUser, updateProfile } = useAuth()

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

    const [modalOpen, setModalOpen] = useState(false)
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
    const [isFollowing, setIsFollowing] = useState(checkIsFollowing(displayUser))
    const [friendsModalType, setFriendsModalType] = useState(null) // 'followers' | 'following' | null

    // Sync state if displayUser changes from network fetch
    import('react').then((React) => {
        React.useEffect(() => {
            setFollowersCount(displayUser?.followers?.length || 0)
            setIsFollowing(checkIsFollowing(displayUser))
        }, [displayUser, currentUserId])
    })

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
        <div className="bg-bg-subtle/60 relative mb-8 overflow-hidden rounded-2xl border border-white/20 p-6 backdrop-blur-xl md:p-8 dark:border-white/10">
            {/* Decorative glowing blobs for enhanced glass effect */}
            <div className="bg-accent/20 pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl"></div>
            <div className="bg-accent/20 pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
                {/* Left Side: Avatar, Name, Description */}
                <div className="flex w-full flex-1 flex-col items-center justify-center gap-6 text-center md:flex-row md:justify-start md:text-left">
                    {/* Avatar */}
                    <div className="bg-bg-page border-border shrink-0 rounded-xl border p-1">
                        <Avatar className="h-24 w-24 rounded-lg md:h-32 md:w-32">
                            <AvatarImage
                                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${finalAvatarSeed}`}
                                alt={`${name}'s avatar`}
                                className="rounded-lg object-cover"
                            />
                            <AvatarFallback className="bg-bg-muted text-text-primary rounded-lg text-3xl font-bold">
                                {(name || 'U').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Name, username, rank, bio, and quick info */}
                    <div className="flex max-w-[400px] flex-col items-center space-y-4 md:items-start">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                <h1 className="text-text-primary text-2xl font-bold drop-shadow-sm md:text-3xl">
                                    {name}
                                </h1>
                                <span className="bg-warning-light text-warning border-warning/20 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wider uppercase">
                                    🏆 #{rank}
                                </span>
                            </div>

                            <div className="mt-1 mb-2 flex items-center justify-center gap-4 text-sm md:justify-start">
                                <button
                                    onClick={() => setFriendsModalType('followers')}
                                    className="hover:text-accent flex items-center gap-1 transition-colors"
                                >
                                    <span className="text-text-primary font-semibold">
                                        {followersCount}
                                    </span>
                                    <span className="text-text-muted font-normal">Followers</span>
                                </button>
                                <span className="text-text-muted">•</span>
                                <button
                                    onClick={() => setFriendsModalType('following')}
                                    className="hover:text-accent flex items-center gap-1 transition-colors"
                                >
                                    <span className="text-text-primary font-semibold">
                                        {initialFollowingCount}
                                    </span>
                                    <span className="text-text-muted font-normal">Following</span>
                                </button>
                            </div>

                            {bio && (
                                <p className="text-text-primary text-center text-sm leading-relaxed font-medium md:text-left">
                                    {bio}
                                </p>
                            )}
                        </div>

                        {/* Quick info: Location & Website moving here */}
                        {(location || website) && (
                            <div className="text-text-muted flex flex-wrap items-center justify-center gap-4 text-sm md:justify-start">
                                {location && (
                                    <div className="hover:text-text-primary flex items-center gap-1.5 transition-colors">
                                        <MapPin size={16} className="text-accent/70" />
                                        <span>{location}</span>
                                    </div>
                                )}
                                {safeWebsiteUrl && (
                                    <div className="hover:text-text-primary flex items-center gap-1.5 transition-colors">
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

                        {/* Edit Profile Modal logic */}
                        {modalOpen && <EditProfileModal onClose={() => setModalOpen(false)} />}

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
                <div className="border-border/20 mt-6 flex w-full shrink-0 flex-col items-center border-t pt-6 md:mt-0 md:w-auto md:min-w-[200px] md:items-end md:justify-between md:self-stretch md:border-t-0 md:border-l md:pt-0 md:pl-8">
                    {/* Action Button */}
                    <div className="flex w-full justify-center md:justify-end">
                        {!isOwnProfile && (
                            <Button
                                variant={isFollowing ? 'outline' : 'default'}
                                onClick={handleFollowToggle}
                                disabled={isFollowLoading}
                                className={`w-full md:w-auto ${!isFollowing ? 'shadow-accent-glow' : ''}`}
                            >
                                {isFollowLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                            </Button>
                        )}
                        {isOwnProfile && (
                            <Link href="/profile/settings" className="w-full md:w-auto">
                                <Button
                                    variant="outline"
                                    className="bg-bg-page/50 border-accent/40 text-text-primary hover:bg-accent hover:border-accent h-10 w-full border-2 px-8 py-2 font-semibold backdrop-blur-md transition-all duration-300 hover:text-white"
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
                                    className="text-text-muted hover:text-text-primary hover:bg-bg-muted rounded-full p-1.5 transition-colors"
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
                                    className="text-text-muted hover:bg-bg-muted rounded-full p-1.5 transition-colors hover:text-[#0077b5]"
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
                                    className="text-text-muted hover:bg-bg-muted rounded-full p-1.5 transition-colors hover:text-[#1DA1F2]"
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
