import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, MapPin, Globe, CheckCircle } from 'lucide-react'

/**
 * PersonalInfoForm Component
 * * A specialized form section for updating a user's primary profile details.
 * It provides inputs for name, username (with availability status), bio,
 * location, and personal website.
 * * @component
 * @param {Object} props - The component props.
 * @param {Object} props.formData - The current state object containing user information.
 * @param {string} props.formData.fullName - The user's display name.
 * @param {string} props.formData.username - The user's unique handle.
 * @param {string} [props.formData.bio] - A brief description of the user.
 * @param {string} [props.formData.location] - The user's physical location.
 * @param {string} [props.formData.website] - The user's external portfolio or personal URL.
 * @param {Function} props.onChange - Callback function triggered on every input change.
 * Receives the standard React change event.
 * * @returns {React.JSX.Element} The rendered personal information form card.
 */
export default function PersonalInfoForm({ formData, onChange }) {
    return (
        <Card className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Full Name Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="fullName"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Full Name
                    </Label>
                    <div className="relative">
                        <User
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={onChange}
                            className="pl-10"
                            placeholder="Alex Rivera"
                        />
                    </div>
                </div>

                {/* Username Input with Availability Indicator */}
                <div className="space-y-2">
                    <Label
                        htmlFor="username"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Username
                    </Label>
                    <div className="relative">
                        <Mail
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={onChange}
                            className="pr-24 pl-10"
                            placeholder="arivera_codes"
                        />
                        <div className="bg-success-light text-success absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold">
                            <CheckCircle size={10} />
                            Available
                        </div>
                    </div>
                </div>

                {/* Bio TextArea with Character Counter */}
                <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                        <Label
                            htmlFor="bio"
                            className="text-text-muted text-xs font-bold tracking-wider uppercase"
                        >
                            Bio
                        </Label>
                        <span className="text-text-muted text-[10px]">
                            {formData.bio?.length || 0}/500
                        </span>
                    </div>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={onChange}
                        rows={4}
                        className="bg-bg-page border-border text-text-primary focus:ring-accent placeholder:text-text-muted w-full resize-none rounded-md border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none"
                        placeholder="Tell us about your coding journey..."
                    />
                </div>

                {/* Location Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="location"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Location
                    </Label>
                    <div className="relative">
                        <MapPin
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={onChange}
                            className="pl-10"
                            placeholder="San Francisco, CA"
                        />
                    </div>
                </div>

                {/* Website URL Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="website"
                        className="text-text-muted text-xs font-bold tracking-wider uppercase"
                    >
                        Website
                    </Label>
                    <div className="relative">
                        <Globe
                            className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2"
                            size={16}
                        />
                        <Input
                            id="website"
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={onChange}
                            className="pl-10"
                            placeholder="https://arivera.dev"
                        />
                    </div>
                </div>
            </div>
        </Card>
    )
}
