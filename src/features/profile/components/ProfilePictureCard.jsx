import React from 'react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera } from 'lucide-react'

/**
 * ProfilePictureCard Component
 * * Provides a user interface for viewing and updating the user's profile image.
 * Includes a preview avatar, a camera overlay for mobile-friendly interactions,
 * and explicit action buttons for uploading or removing the current image.
 * * @component
 * @param {Object} props - The component props.
 * @param {string} [props.avatarUrl] - The URL of the user's current profile image.
 * If null or empty, the fallback initials will be shown.
 * @param {Function} props.onUpload - Callback function triggered when the "Change Avatar"
 * button or camera icon is clicked.
 * @param {Function} props.onRemove - Callback function triggered when the "Remove"
 * button is clicked to clear the current avatar.
 * * @returns {React.JSX.Element} The rendered profile picture management card.
 */

export default function ProfilePictureCard({ avatarUrl, onUpload, onRemove }) {
    return (
        <Card className="p-6">
            <h3 className="text-text-primary mb-6 text-lg font-semibold">Profile Picture</h3>
            <div className="flex flex-col items-center gap-8 md:flex-row">
                {/* Avatar Preview & Quick-Action Icon */}
                <div className="group relative">
                    <Avatar className="border-bg-subtle h-28 w-28 border-4 shadow-md">
                        <AvatarImage src={avatarUrl} alt="Profile" />
                        <AvatarFallback>AR</AvatarFallback>
                    </Avatar>
                    <button
                        onClick={onUpload}
                        className="bg-accent focus:ring-accent absolute right-1 bottom-1 rounded-full p-2 text-white shadow-lg transition-transform hover:scale-110 focus:ring-2 focus:outline-none"
                        title="Change Avatar"
                    >
                        <Camera size={16} />
                    </button>
                </div>

                {/* Information and Action Buttons */}
                <div className="flex-1 text-center md:text-left">
                    <div className="mb-4 flex flex-wrap justify-center gap-3 md:justify-start">
                        <Button variant="default" size="sm" onClick={onUpload}>
                            Change Avatar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-error hover:bg-error-light hover:text-error border-border"
                            onClick={onRemove}
                        >
                            Remove
                        </Button>
                    </div>
                    <p className="text-text-muted text-xs leading-relaxed">
                        JPG, GIF or PNG. Recommended size: 400×400. Max size of 800K.
                    </p>
                </div>
            </div>
        </Card>
    )
}
