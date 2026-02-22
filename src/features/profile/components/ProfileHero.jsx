'use client';

import { useState } from 'react';

// Shared Components
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Auth
import { useAuth } from '@/context/AuthContext';

// Profile Edit Modal
import EditProfileModal from './EditProfileModal';
import { toast } from 'sonner';

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
  const { user: authUser, updateProfile } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayUser = userProp || authUser;

  const {
    username = 'unknown',
    name: displayName = 'Unknown User',
    bio = '',
    avatarSeed = username,
    stats,
  } = displayUser || {};

  const isOwnProfile = authUser && (
    (authUser.firebaseUid && authUser.firebaseUid === displayUser?.firebaseUid) ||
    (authUser.email && authUser.email === displayUser?.email) ||
    (authUser.username && authUser.username === displayUser?.username)
  );

  const rank = stats?.globalRank ?? '—';
  const finalAvatarSeed = avatarSeed || username;

  const handleSaveProfile = (updatedData) => {
    updateProfile(updatedData);
    toast.success('Changes saved successfully!');
  };

  return (
    <>
      <div className="relative rounded-xl overflow-hidden bg-bg-subtle border border-border mb-8">
        {/* Banner */}
        <div className="h-24 md:h-40 w-full bg-gradient-to-r from-accent/20 via-accent/5 to-transparent relative">
          <div className="absolute top-4 right-6 text-text-primary/5 font-bold text-4xl select-none font-mono">
            CODEARENA
          </div>
        </div>

        {/* Mobile layout: centered column; desktop: side-by-side row */}
        <div className="px-6 md:px-8 pb-6 md:pb-8 -mt-12 relative z-10">
          {/* Avatar — centered on mobile */}
          <div className="flex justify-center md:justify-start">
            <div className="p-1 rounded-full bg-bg-page border-4 border-bg-page shadow-xl">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-accent">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${finalAvatarSeed}`}
                  alt={`${username}'s avatar`}
                />
                <AvatarFallback className="bg-bg-muted text-text-primary text-2xl">
                  {username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* User Info + Buttons */}
          <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            {/* Name, username, rank, bio */}
            <div className="text-center md:text-left space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                  {username}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-light text-warning border border-warning/20">
                  🏆 #{rank}
                </span>
              </div>
              <p className="text-text-secondary text-base md:text-lg">{displayName}</p>
              {bio && (
                <p className="text-sm text-text-muted max-w-md leading-relaxed">{bio}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center md:justify-end shrink-0">
              {!isOwnProfile && (
                <Button variant="default">Follow</Button>
              )}
              {isOwnProfile && (
                <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          user={displayUser}
          onSave={handleSaveProfile}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
}

ProfileHero.displayName = 'ProfileHero';
